import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { serverEnv } from "@/lib/env/server";

let _client: SupabaseClient | undefined;

/** Lazily created service-role client — avoids env validation at build time. */
export function getSupabaseAdmin(): SupabaseClient {
  if (!_client) {
    _client = createClient(
      serverEnv.SUPABASE_URL,
      serverEnv.SUPABASE_SERVICE_ROLE_KEY,
    );
  }
  return _client;
}
