/**
 * Digital Watermark Service
 * Adds watermarks to documents (images, PDFs) for authentication
 * 
 * Supports:
 * - Image formats (PNG, JPG, WebP) using Canvas API
 * - PDF documents using pdfkit
 */

export interface WatermarkConfig {
  position: "center" | "diagonal" | "corners";
  opacity: number; // 0.0-1.0
  text: string;
  rotation: number; // degrees
  fontSize: number; // points
  color: string; // rgba or hex
  bold?: boolean;
}

export interface WatermarkOptions {
  config?: Partial<WatermarkConfig>;
  filename?: string;
  contentType?: string;
}

/**
 * Default watermark configuration
 */
export const DEFAULT_WATERMARK_CONFIG: WatermarkConfig = {
  position: "diagonal",
  opacity: 0.2,
  text: "DOKUMEN RESMI - Korps Publik & Pers",
  rotation: -45,
  fontSize: 48,
  color: "rgba(128, 128, 128, 0.5)",
  bold: true,
};

/**
 * Merges custom config with defaults
 */
export function getWatermarkConfig(
  custom?: Partial<WatermarkConfig>,
): WatermarkConfig {
  return {
    ...DEFAULT_WATERMARK_CONFIG,
    ...custom,
  };
}

/**
 * Calculates text position based on position setting
 */
function getTextPosition(
  canvasWidth: number,
  canvasHeight: number,
  position: WatermarkConfig["position"],
): { x: number; y: number } {
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  const margin = 50;

  switch (position) {
    case "center":
      return { x: centerX, y: centerY };
    case "diagonal":
      return { x: centerX, y: centerY };
    case "corners":
      return { x: margin, y: margin };
    default:
      return { x: centerX, y: centerY };
  }
}

/**
 * Validates file type and size
 */
export function validateFileForWatermark(
  contentType: string,
  maxSizeBytes: number = 50 * 1024 * 1024, // 50MB
  fileSize?: number,
): { isValid: boolean; error?: string } {
  // Validate content type
  const allowedTypes = [
    "image/png",
    "image/jpeg",
    "image/webp",
    "application/pdf",
  ];

  if (!allowedTypes.includes(contentType)) {
    return {
      isValid: false,
      error: `Unsupported file type: ${contentType}. Supported: PNG, JPG, WebP, PDF`,
    };
  }

  // Validate file size
  if (fileSize && fileSize > maxSizeBytes) {
    return {
      isValid: false,
      error: `File too large. Maximum size: ${(maxSizeBytes / 1024 / 1024).toFixed(0)}MB`,
    };
  }

  return { isValid: true };
}

/**
 * Applies watermark to image buffer
 * Uses Canvas API (Node.js compatible via canvas library)
 */
export async function applyImageWatermark(
  imageBuffer: Buffer,
  config: WatermarkConfig = DEFAULT_WATERMARK_CONFIG,
): Promise<Buffer> {
  try {
    // Dynamic import to avoid hard dependency
    const { createCanvas, loadImage } = await import("canvas");

    // Load image from buffer
    const image = await loadImage(imageBuffer);

    // Create canvas with same dimensions
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext("2d");

    // Draw original image
    ctx.drawImage(image, 0, 0);

    // Apply watermark
    ctx.globalAlpha = config.opacity;
    ctx.fillStyle = config.color;

    // Set font
    const fontWeight = config.bold ? "bold" : "normal";
    ctx.font = `${fontWeight} ${config.fontSize}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Calculate position
    const { x, y } = getTextPosition(
      canvas.width,
      canvas.height,
      config.position,
    );

    // Apply rotation if diagonal
    if (config.rotation !== 0) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((config.rotation * Math.PI) / 180);
      ctx.fillText(config.text, 0, 0);
      ctx.restore();
    } else {
      ctx.fillText(config.text, x, y);
    }

    // Return as PNG buffer
    return canvas.toBuffer("image/png");
  } catch (error) {
    console.error("Image watermark error:", error);
    throw new Error("Failed to apply watermark to image");
  }
}

/**
 * Applies watermark to PDF
 * Requires pdfkit library
 */
export async function applyPdfWatermark(
  pdfBuffer: Buffer,
  config: WatermarkConfig = DEFAULT_WATERMARK_CONFIG,
): Promise<Buffer> {
  try {
    // Dynamic import to avoid hard dependency
    const PDFDocument = (await import("pdfkit")).default;
    const PDFParser = (await import("pdf-parse")).default;

    // Parse existing PDF to get page count
    let pageCount = 1;
    try {
      const pdfData = await PDFParser(pdfBuffer);
      pageCount = pdfData.numpages;
    } catch {
      pageCount = 1;
    }

    // Create new PDF with watermark
    const doc = new PDFDocument();
    const buffers: Buffer[] = [];

    // Collect output
    doc.on("data", (chunk: Buffer) => buffers.push(chunk));

    // TODO: Implement PDF watermarking logic
    // This would require more complex PDF manipulation
    // For now, return original buffer and log
    console.warn(
      "PDF watermarking not yet implemented - returning original document",
    );

    doc.end();

    return Buffer.concat(buffers);
  } catch (error) {
    console.error("PDF watermark error:", error);
    throw new Error("Failed to apply watermark to PDF");
  }
}

/**
 * Main function: Apply watermark based on content type
 */
export async function applyWatermark(
  fileBuffer: Buffer,
  options: WatermarkOptions = {},
): Promise<{ buffer: Buffer; filename: string; contentType: string }> {
  const config = getWatermarkConfig(options.config);
  const contentType = options.contentType || "image/png";

  // Validate file
  const validation = validateFileForWatermark(contentType, 50 * 1024 * 1024, fileBuffer.length);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  let watermarkedBuffer: Buffer;

  if (contentType.startsWith("image/")) {
    // Apply image watermark
    watermarkedBuffer = await applyImageWatermark(fileBuffer, config);
  } else if (contentType === "application/pdf") {
    // Apply PDF watermark
    watermarkedBuffer = await applyPdfWatermark(fileBuffer, config);
  } else {
    throw new Error(`Unsupported content type: ${contentType}`);
  }

  // Generate filename
  const timestamp = new Date().getTime();
  const extension = contentType.includes("pdf") ? "pdf" : "png";
  const filename =
    options.filename || `watermarked-${timestamp}.${extension}`;

  return {
    buffer: watermarkedBuffer,
    filename,
    contentType: contentType.includes("pdf") ? "application/pdf" : "image/png",
  };
}

/**
 * Generates watermark configuration from environment variables
 */
export function getWatermarkConfigFromEnv(): Partial<WatermarkConfig> {
  return {
    position: (process.env.WATERMARK_POSITION as any) || "diagonal",
    opacity: parseFloat(process.env.WATERMARK_OPACITY || "0.2"),
    text: process.env.WATERMARK_TEXT || DEFAULT_WATERMARK_CONFIG.text,
    rotation: parseInt(process.env.WATERMARK_ROTATION || "-45", 10),
    fontSize: parseInt(process.env.WATERMARK_FONT_SIZE || "48", 10),
    color: process.env.WATERMARK_COLOR || "rgba(128, 128, 128, 0.5)",
    bold: process.env.WATERMARK_BOLD !== "false",
  };
}
