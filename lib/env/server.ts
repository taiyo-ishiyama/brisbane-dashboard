import { z } from "zod";

const envSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  CRON_SECRET: z.string().min(1),
});

type ServerEnv = z.infer<typeof envSchema>;

let _cached: ServerEnv | undefined;

/** Lazily parsed server env — only validated on first access (not at build time). */
export const serverEnv = new Proxy({} as ServerEnv, {
  get(_target, prop: string) {
    if (!_cached) {
      const result = envSchema.safeParse(process.env);
      if (!result.success) {
        const formatted = result.error.issues
          .map((i) => `  ${i.path.join(".")}: ${i.message}`)
          .join("\n");
        throw new Error(
          `Missing or invalid environment variables:\n${formatted}`,
        );
      }
      _cached = result.data;
    }
    return _cached[prop as keyof ServerEnv];
  },
});
