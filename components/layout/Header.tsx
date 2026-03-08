"use client";

import { useEffect, useState } from "react";
import { PageTitle, Body } from "@/components/ui/Typography";

function useBrisbaneClock() {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    function tick() {
      setTime(
        new Date().toLocaleTimeString("en-AU", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
          timeZone: "Australia/Brisbane",
        })
      );
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return time;
}

export default function Header() {
  const time = useBrisbaneClock();

  return (
    <header className="bg-white border-b border-slate-200">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <PageTitle>Brisbane Local Dashboard</PageTitle>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Body as="span" className="hidden sm:inline !text-slate-600">
            Brisbane time&nbsp;&mdash;
          </Body>
          <span className="inline-flex items-center gap-1.5 font-mono font-medium tabular-nums text-slate-900">
            <span className="h-2 w-2 rounded-full bg-primary-500" />
            {time}
          </span>
        </div>
      </div>
    </header>
  );
}
