"use client";

import { Clock } from "lucide-react";
import { Muted } from "@/components/ui/Typography";

interface LastUpdatedProps {
  fetchedAt: string;
}

function formatFetchedAt(fetchedAt: string): string {
  const fetched = new Date(fetchedAt);
  const now = new Date();

  const brisbaneDate = (d: Date) =>
    d.toLocaleDateString("en-AU", { timeZone: "Australia/Brisbane", year: "numeric", month: "2-digit", day: "2-digit" });

  const time = fetched.toLocaleTimeString("en-AU", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Australia/Brisbane",
  });

  if (brisbaneDate(fetched) !== brisbaneDate(now)) {
    const date = fetched.toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
      timeZone: "Australia/Brisbane",
    });
    return `${date}, ${time}`;
  }

  return time;
}

export default function LastUpdated({ fetchedAt }: LastUpdatedProps) {
  return (
    <Muted className="inline-flex items-center gap-1 tabular-nums">
      <Clock className="size-3" />
      {formatFetchedAt(fetchedAt)}
    </Muted>
  );
}
