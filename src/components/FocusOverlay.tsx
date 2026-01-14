"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * Full-screen focus mode container.
 *
 * UX intent (senior-friendly):
 * - One task at a time (no clutter).
 * - Tap anywhere to go back (no tiny close buttons).
 * - Slow, calm transitions (no sharp motion).
 */
export function FocusOverlay({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-50"
          role="dialog"
          aria-modal="true"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          {/* Soft backdrop for calm focus and contrast */}
          <div className="absolute inset-0 bg-slate-950/70" />

          <motion.div
            className="relative mx-auto flex h-full w-full max-w-[1400px] items-center justify-center overflow-auto px-6 py-10 md:px-10"
            initial={{ opacity: 0, y: 14, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.985 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            {/* Big, simple surface; tap anywhere outside still closes */}
            <div className="w-full rounded-[32px] bg-white shadow-2xl ring-1 ring-black/10">
              <div className="p-8 md:p-12">{children}</div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

