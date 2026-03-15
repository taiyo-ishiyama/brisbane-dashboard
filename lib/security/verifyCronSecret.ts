import { serverEnv } from "@/lib/env/server";

export function verifyCronSecret(request: Request): Response | null {
  const secret = request.headers.get("x-cron-secret");
  if (secret !== serverEnv.CRON_SECRET) {
    return Response.json({ error: "Unauthorised" }, { status: 401 });
  }
  return null;
}
