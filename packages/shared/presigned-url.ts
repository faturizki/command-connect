/**
 * Server-side utility to generate presigned URLs for R2/S3 uploads
 * 
 * This module handles the server-side generation of presigned URLs
 * which allow clients to upload directly to Cloudflare R2 or AWS S3.
 */

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * Configuration for R2/S3 presigned URL generation
 */
export interface PresignConfig {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  urlExpirySeconds?: number;
}

/**
 * Response structure for presigned URL requests
 */
export interface PresignedUrlResponse {
  presignedUrl: string;
  objectKey: string;
  expiresIn: number;
}

/**
 * Gets presigned URL configuration from environment variables
 */
export function getPresignConfig(): PresignConfig | null {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
    return null;
  }

  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucketName,
    urlExpirySeconds: 3600, // 1 hour
  };
}

/**
 * Creates an S3 client configured for R2
 */
function createR2Client(config: PresignConfig): S3Client {
  return new S3Client({
    region: "auto",
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
  });
}

/**
 * Generates a presigned URL for uploading a file to R2
 */
export async function generatePresignedUrl(
  filename: string,
  contentType: string,
  folder: string = "uploads",
  config?: PresignConfig,
): Promise<PresignedUrlResponse> {
  const presignConfig = config || getPresignConfig();
  
  if (!presignConfig) {
    throw new Error("R2 credentials not configured");
  }

  // Validate inputs
  if (!filename || !contentType) {
    throw new Error("Filename and content type are required");
  }

  // Sanitize and construct the object key
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const objectKey = `${folder}/${Date.now()}-${sanitizedFilename}`;

  // Create S3 client
  const client = createR2Client(presignConfig);

  try {
    // Generate presigned URL
    const command = new PutObjectCommand({
      Bucket: presignConfig.bucketName,
      Key: objectKey,
      ContentType: contentType,
    });

    const url = await getSignedUrl(client, command, {
      expiresIn: presignConfig.urlExpirySeconds || 3600,
    });

    return {
      presignedUrl: url,
      objectKey,
      expiresIn: presignConfig.urlExpirySeconds || 3600,
    };
  } catch (error) {
    console.error("Failed to generate presigned URL:", error);
    throw new Error("Failed to generate upload URL");
  }
}

/**
 * Validates file upload parameters
 */
export function validateUploadParams(
  filename: string,
  contentType: string,
  maxFileSize: number = 100 * 1024 * 1024, // 100MB
): { isValid: boolean; error?: string } {
  if (!filename || filename.length === 0) {
    return { isValid: false, error: "Filename is required" };
  }

  if (!contentType || contentType.length === 0) {
    return { isValid: false, error: "Content type is required" };
  }

  // Check filename length
  if (filename.length > 255) {
    return { isValid: false, error: "Filename is too long" };
  }

  // Validate content type format
  if (!contentType.includes("/")) {
    return { isValid: false, error: "Invalid content type format" };
  }

  return { isValid: true };
}
