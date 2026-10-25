import "server-only";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/auth";

// Server actions are reachable by POST from anywhere, so each one re-checks the session.
export async function requireAdmin(): Promise<void> {
  const jar = await cookies();
  if (!(await verifyAdminToken(jar.get(ADMIN_COOKIE)?.value))) throw new Error("Unauthorized");
}
