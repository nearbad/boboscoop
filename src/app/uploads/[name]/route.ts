import { readFile } from "node:fs/promises";
import path from "node:path";
import { ALLOWED, LOCAL_UPLOAD_DIR } from "@/lib/upload";

const TYPES = new Map([...ALLOWED].map(([type, ext]) => [ext, type]));

// Serves images uploaded without Vercel Blob (local development).
export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const name = path.basename((await params).name);
  const type = TYPES.get(path.extname(name).slice(1));
  if (!type) return new Response("Not found", { status: 404 });
  try {
    const data = await readFile(path.join(LOCAL_UPLOAD_DIR, name));
    return new Response(new Uint8Array(data), { headers: { "Content-Type": type, "Cache-Control": "public, max-age=31536000, immutable" } });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
