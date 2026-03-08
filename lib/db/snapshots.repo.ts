import { getSupabaseAdmin } from "@/lib/supabase/serverClient";
import type { SnapshotRow } from "./types";

export async function upsertSnapshot(
  section: string,
  payload: unknown,
  key = "latest",
): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("snapshots")
    .upsert(
      {
        section,
        key,
        fetched_at: new Date().toISOString(),
        payload,
      },
      { onConflict: "section,key" },
    );

  if (error) throw new Error(`upsertSnapshot(${section}): ${error.message}`);
}

export async function getLatestSnapshot<T>(
  section: string,
  key = "latest",
): Promise<T | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("snapshots")
    .select("payload")
    .eq("section", section)
    .eq("key", key)
    .single<Pick<SnapshotRow, "payload">>();

  if (error && error.code === "PGRST116") return null; // no rows
  if (error) throw new Error(`getLatestSnapshot(${section}): ${error.message}`);
  return data.payload as T;
}

export async function getAllLatestSnapshots(): Promise<
  Record<string, unknown>
> {
  const { data, error } = await getSupabaseAdmin()
    .from("snapshots")
    .select("section, payload")
    .eq("key", "latest");

  if (error) throw new Error(`getAllLatestSnapshots: ${error.message}`);

  const result: Record<string, unknown> = {};
  for (const row of data ?? []) {
    result[row.section] = row.payload;
  }
  return result;
}
