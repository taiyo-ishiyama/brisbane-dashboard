"use client";

import { Clock } from "lucide-react";
import { Muted } from "@/components/ui/Typography";

interface LastUpdatedProps {
  fetchedAt: string;
}

export default function LastUpdated({ fetchedAt }: LastUpdatedProps) {
  const time = new Date(fetchedAt).toLocaleTimeString("en-AU", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Australia/Brisbane",
  });

  return (
    <Muted className="inline-flex items-center gap-1">
      <Clock className="h-3 w-3" />
      Last updated {time}
    </Muted>
  );
}
