"use client";

import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { SectionTitle } from "@/components/ui/Typography";

const subscribe = () => () => {};
function useIsMounted() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  toolbar?: ReactNode;
  children: ReactNode;
}

export default function Modal({ open, onClose, title, toolbar, children }: ModalProps) {
  const mounted = useIsMounted();
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<Element | null>(null);

  // Lock body scroll while open
  useEffect(() => {
    if (!mounted || !open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mounted, open]);

  // Close on Escape
  useEffect(() => {
    if (!mounted || !open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [mounted, open, onClose]);

  // Focus management: move focus into modal, trap it, restore on close
  useEffect(() => {
    if (!mounted || !open) return;

    previousFocusRef.current = document.activeElement;
    const dialog = dialogRef.current;
    if (dialog) {
      const firstFocusable = dialog.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (firstFocusable) firstFocusable.focus();
      else dialog.focus();
    }

    return () => {
      if (previousFocusRef.current instanceof HTMLElement) {
        previousFocusRef.current.focus();
      }
    };
  }, [mounted, open]);

  // Trap Tab / Shift+Tab within modal
  useEffect(() => {
    if (!mounted || !open) return;
    const dialog = dialogRef.current;
    if (!dialog) return;

    function handleTab(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      const focusable = dialog!.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    dialog.addEventListener("keydown", handleTab);
    return () => dialog.removeEventListener("keydown", handleTab);
  }, [mounted, open]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
            aria-hidden
          />

          {/* Panel */}
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal
            aria-label={title}
            tabIndex={-1}
            className="relative flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-stone-200/60 bg-white shadow-xl outline-none"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4">
              <SectionTitle>{title}</SectionTitle>
              <button
                onClick={onClose}
                aria-label="Close"
                className="rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Toolbar (fixed) */}
            {toolbar && (
              <div className="border-b border-stone-100 px-6 py-4">
                {toolbar}
              </div>
            )}

            {/* Scrollable content */}
            <div className="overflow-y-auto px-6 py-4">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
