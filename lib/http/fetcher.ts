import { FETCH_TIMEOUT_MS, FETCH_RETRIES } from "@/config/constants";
import { FetchError } from "./errors";

export async function fetchJson<T>(
  url: string,
  opts?: { timeoutMs?: number; retries?: number },
): Promise<T> {
  const timeout = opts?.timeoutMs ?? FETCH_TIMEOUT_MS;
  const retries = opts?.retries ?? FETCH_RETRIES;

  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);

      if (!res.ok) {
        throw new FetchError(res.status, url, `HTTP ${res.status} from ${url}`);
      }

      return (await res.json()) as T;
    } catch (err) {
      lastError = err;
      if (err instanceof FetchError) throw err;
      if (attempt < retries) continue;
    }
  }

  throw lastError;
}
