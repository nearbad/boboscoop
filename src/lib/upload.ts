import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";

export const LOCAL_UPLOAD_DIR = path.join(process.cwd(), ".uploads");

export const ALLOWED = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
]);

// Returns the public URL of the stored image, or null when no file was chosen.
export async function saveImage(file: FormDataEntryValue | null): Promise<string | null> {
  if (!(file instanceof File) || file.size === 0) return null;
  const ext = ALLOWED.get(file.type);
  if (!ext) throw new Error("Можно загружать только JPG, PNG, WEBP или GIF");
  if (file.size > 5 * 1024 * 1024) throw new Error("Файл больше 5 МБ");
  const name = `${randomUUID()}.${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`uploads/${name}`, file, { access: "public", contentType: file.type });
    return blob.url;
  }
  // Local fallback for development; served by src/app/uploads/[name]/route.ts.
  await mkdir(LOCAL_UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(LOCAL_UPLOAD_DIR, name), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${name}`;
}

export async function saveImages(files: FormDataEntryValue[]): Promise<string[]> {
  const urls: string[] = [];
  for (const f of files) {
    const url = await saveImage(f);
    if (url) urls.push(url);
  }
  return urls;
}
