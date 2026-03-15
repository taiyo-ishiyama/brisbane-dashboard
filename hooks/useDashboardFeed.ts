import { useQuery } from "@tanstack/react-query";
import type { BrisbaneDashboardFeed } from "@/types/dashboard";

export function useDashboardFeed() {
  return useQuery<BrisbaneDashboardFeed>({
    queryKey: ["dashboardFeed"],
    queryFn: async ({ signal }) => {
      const res = await fetch("/api/feed", { signal });
      if (!res.ok) throw new Error(`Feed request failed (${res.status})`);
      return res.json();
    },
    refetchInterval: 5 * 60_000,
  });
}
