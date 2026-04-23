"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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
    <header className="border-b border-stone-200/60 bg-white sticky top-0 z-30 pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2 sm:px-6">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Brisbane Local Dashboard logo"
            width={48}
            height={48}
            className="size-12"
          />
          <PageTitle>Brisbane Local Dashboard</PageTitle>
        </div>
        <div className="flex items-center gap-2 text-sm text-stone-500">
          <Body as="span" className="hidden sm:inline text-stone-400!">
            Brisbane&nbsp;&mdash;
          </Body>
          <span className="inline-flex items-center gap-1.5 font-mono text-sm font-medium tabular-nums text-stone-900">
            <span className="size-1.5 rounded-full bg-primary-500" />
            {time}
          </span>
        </div>
      </div>
    </header>
  );
}
