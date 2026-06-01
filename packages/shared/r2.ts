const R2_PUBLIC_URL = import.meta.env.VITE_R2_PUBLIC_URL ?? "";

export function getAssetUrl(key: string | null | undefined): string {
  if (!key) return "";
  if (key.startsWith("http://") || key.startsWith("https://")) return key;
  return `${R2_PUBLIC_URL}/${key}`;
}

export async function uploadToR2(file: File, presignedUrl: string): Promise<void> {
  const res = await fetch(presignedUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });

  if (!res.ok) {
    throw new Error(`R2 upload failed: ${res.status} ${res.statusText}`);
  }
}

export async function getUploadPresignedUrl(
  filename: string,
  contentType: string,
  folder: string = "uploads",
): Promise<{ presignedUrl: string; objectKey: string }> {
  const res = await fetch("/api/r2-presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename, contentType, folder }),
  });

  if (!res.ok) throw new Error("Failed to get presigned URL");
  return res.json();
}
