"use client";

import { useState, type ReactNode } from "react";
import { SplashScreen } from "@/components/common/SplashScreen";

export function SplashProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      <SplashScreen
        duration={2500}
        onComplete={() => setIsLoading(false)}
      />
      <div
        style={{
          visibility: isLoading ? "hidden" : "visible",
          opacity: isLoading ? 0 : 1,
          transition: "opacity 0.3s ease-in-out",
        }}
      >
        {children}
      </div>
    </>
  );
}
