/**
 * API Route: GET /api/press-kit/:id/download
 * 
 * Downloads a press kit document with optional watermarking
 * 
 * Query parameters:
 * - watermark: "true" to apply watermark (default: false)
 * - format: output format if different from original
 * 
 * Response:
 * - 200: File with proper headers for download
 * - 400: Invalid parameters
 * - 404: Press kit not found
 * - 500: Processing error
 */

import { getPressKitItem } from "@shared/supabase";
import { applyWatermark, validateFileForWatermark } from "@shared/watermark";

/**
 * Handler for GET /api/press-kit/:id/download
 * Handles press kit download with optional watermarking
 */
export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");
    const query = getQuery(event);
    const applyWatermarkFlag = query.watermark === "true";

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        data: { error: "Press kit ID is required" },
      });
    }

    // Fetch press kit item from database
    let pressKit;
    try {
      pressKit = await getPressKitItem(id);
    } catch (error) {
      console.error("Failed to fetch press kit:", error);
      throw createError({
        statusCode: 404,
        statusMessage: "Not Found",
        data: { error: "Press kit not found" },
      });
    }

    if (!pressKit || !pressKit.document_url) {
      throw createError({
        statusCode: 404,
        statusMessage: "Not Found",
        data: { error: "Document not found" },
      });
    }

    // Fetch document from R2/storage
    let documentBuffer: Buffer;
    try {
      const response = await fetch(pressKit.document_url);
      if (!response.ok) {
        throw new Error(`Failed to fetch document: ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      documentBuffer = Buffer.from(arrayBuffer);
    } catch (error) {
      console.error("Failed to fetch document:", error);
      throw createError({
        statusCode: 500,
        statusMessage: "Internal Server Error",
        data: { error: "Failed to retrieve document" },
      });
    }

    // Get content type from URL or use default
    const contentType =
      pressKit.document_type ||
      getPressKitMimeType(pressKit.document_url);

    // Apply watermark if requested
    let finalBuffer = documentBuffer;
    let finalFilename = pressKit.document_url.split("/").pop() || "document";
    let finalContentType = contentType;

    if (applyWatermarkFlag) {
      try {
        // Validate file for watermarking
        const validation = validateFileForWatermark(
          contentType,
          100 * 1024 * 1024, // 100MB for documents
          documentBuffer.length,
        );

        if (!validation.isValid) {
          throw createError({
            statusCode: 400,
            statusMessage: "Bad Request",
            data: { error: validation.error },
          });
        }

        // Apply watermark
        const watermarked = await applyWatermark(documentBuffer, {
          contentType,
          filename: finalFilename,
        });

        finalBuffer = watermarked.buffer;
        finalFilename = watermarked.filename;
        finalContentType = watermarked.contentType;

        // Log watermark application
        console.info(`Watermark applied to press kit: ${id}`);
      } catch (error) {
        console.error("Watermarking error:", error);

        // If watermarking fails, return original with warning header
        setResponseHeader(
          event,
          "X-Watermark-Status",
          "failed-returning-original",
        );
      }
    }

    // Set response headers for download
    setResponseHeader(event, "Content-Type", finalContentType);
    setResponseHeader(
      event,
      "Content-Disposition",
      `attachment; filename="${finalFilename}"`,
    );
    setResponseHeader(event, "Content-Length", finalBuffer.length.toString());
    setResponseHeader(event, "Cache-Control", "no-cache, no-store");
    setResponseHeader(event, "Pragma", "no-cache");

    // Set security headers
    setResponseHeader(event, "X-Content-Type-Options", "nosniff");
    setResponseHeader(event, "X-Frame-Options", "DENY");

    return finalBuffer;
  } catch (error) {
    console.error("Press kit download error:", error);

    // Re-throw HTTP errors
    if (error instanceof Error && (error as any).statusCode) {
      throw error;
    }

    // Handle other errors
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      data: { error: "Failed to process download request" },
    });
  }
});

/**
 * Determines MIME type from URL or filename
 */
function getPressKitMimeType(url: string): string {
  const filename = url.toLowerCase().split("/").pop() || "";

  if (filename.endsWith(".pdf")) return "application/pdf";
  if (filename.endsWith(".png")) return "image/png";
  if (filename.endsWith(".jpg") || filename.endsWith(".jpeg"))
    return "image/jpeg";
  if (filename.endsWith(".webp")) return "image/webp";
  if (filename.endsWith(".doc")) return "application/msword";
  if (filename.endsWith(".docx"))
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (filename.endsWith(".xls"))
    return "application/vnd.ms-excel";
  if (filename.endsWith(".xlsx"))
    return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

  // Default to PDF
  return "application/octet-stream";
}
