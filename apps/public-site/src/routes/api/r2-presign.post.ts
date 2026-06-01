/**
 * API Route: POST /api/r2-presign
 * 
 * Generates a presigned URL for uploading files to Cloudflare R2
 * 
 * Request body:
 * {
 *   filename: string
 *   contentType: string
 *   folder?: string (default: "uploads")
 * }
 * 
 * Response:
 * {
 *   presignedUrl: string
 *   objectKey: string
 *   expiresIn: number
 * }
 */

import { json, type H3Event } from "h3";
import { generatePresignedUrl, validateUploadParams } from "@shared/presigned-url";

/**
 * Handler for POST /api/r2-presign
 * Validates the request and generates a presigned URL
 */
export default defineEventHandler(async (event: H3Event) => {
  // Only allow POST requests
  if (event.req.method !== "POST") {
    throw createError({
      statusCode: 405,
      statusMessage: "Method Not Allowed",
    });
  }

  try {
    const body = await readBody(event);

    const { filename, contentType, folder = "uploads" } = body;

    // Validate input parameters
    const validation = validateUploadParams(filename, contentType);
    if (!validation.isValid) {
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        data: { error: validation.error },
      });
    }

    // Validate folder name to prevent directory traversal
    if (!isValidFolderName(folder)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        data: { error: "Invalid folder name" },
      });
    }

    // Generate presigned URL
    const result = await generatePresignedUrl(filename, contentType, folder);

    setResponseHeader(event, "Content-Type", "application/json");
    return result;
  } catch (error) {
    console.error("R2 presign error:", error);

    if (error instanceof Error) {
      throw createError({
        statusCode: 500,
        statusMessage: "Internal Server Error",
        data: { error: error.message },
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      data: { error: "Failed to generate upload URL" },
    });
  }
});

/**
 * Validates folder name to prevent directory traversal attacks
 */
function isValidFolderName(folder: string): boolean {
  if (!folder) return false;
  if (folder.includes("..") || folder.includes("/")) return false;
  if (!/^[a-zA-Z0-9_-]+$/.test(folder)) return false;
  return true;
}
