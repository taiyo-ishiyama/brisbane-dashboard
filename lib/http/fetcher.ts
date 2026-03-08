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
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const res = await fetch(url, { signal: controller.signal });

      if (!res.ok) {
        throw new FetchError(res.status, url, `HTTP ${res.status} from ${url}`);
      }

      return (await res.json()) as T;
    } catch (err) {
      lastError = err;
      if (err instanceof FetchError) throw err;
      if (attempt < retries) continue;
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError;
}

export async function fetchBuffer(
  url: string,
  opts?: { timeoutMs?: number; retries?: number },
): Promise<Uint8Array> {
  const timeout = opts?.timeoutMs ?? FETCH_TIMEOUT_MS;
  const retries = opts?.retries ?? FETCH_RETRIES;

  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const res = await fetch(url, { signal: controller.signal });

      if (!res.ok) {
        throw new FetchError(res.status, url, `HTTP ${res.status} from ${url}`);
      }

      return new Uint8Array(await res.arrayBuffer());
    } catch (err) {
      lastError = err;
      if (err instanceof FetchError) throw err;
      if (attempt < retries) continue;
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError;
}

export async function fetchText(
  url: string,
  opts?: { timeoutMs?: number; retries?: number },
): Promise<string> {
  const timeout = opts?.timeoutMs ?? FETCH_TIMEOUT_MS;
  const retries = opts?.retries ?? FETCH_RETRIES;

  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const res = await fetch(url, { signal: controller.signal });

      if (!res.ok) {
        throw new FetchError(res.status, url, `HTTP ${res.status} from ${url}`);
      }

      return await res.text();
    } catch (err) {
      lastError = err;
      if (err instanceof FetchError) throw err;
      if (attempt < retries) continue;
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError;
}
