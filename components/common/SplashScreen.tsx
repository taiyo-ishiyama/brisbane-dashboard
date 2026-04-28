"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

type SplashScreenProps = {
  onComplete?: () => void;
  duration?: number;
};

export function SplashScreen({ onComplete, duration = 2800 }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const hasCompleted = useRef(false);

  const completeSplash = useCallback(() => {
    if (hasCompleted.current) return;
    hasCompleted.current = true;
    setIsVisible(false);
    onComplete?.();
  }, [onComplete]);

  useEffect(() => {
    const timer = setTimeout(completeSplash, duration);
    return () => clearTimeout(timer);
  }, [duration, completeSplash]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-surface"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          <div className="size-72 md:size-96">
            <DotLottieReact
              src="/lottie/splash.json"
              autoplay
              loop
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
