"use client";

import { AnimatePresence, motion } from "framer-motion";

/**
 * HomeMenuOverlay
 *
 * Simple, resident-friendly menu:
 * - Opens on tap anywhere from the home screen.
 * - Three big options only (Meals, Events, Photos).
 * - No blur, no cards, high contrast.
 * - Tap anywhere outside options to close.
 *
 * Note: Buttons intentionally do not navigate yet (per "home screen only" task).
 */
export function HomeMenuOverlay({
  isOpen,
  onClose,
  onPick,
}: {
  isOpen: boolean;
  onClose: () => void;
  onPick?: (key: "meals" | "events" | "photos") => void;
}) {
  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-50 bg-black/85"
          role="dialog"
          aria-modal="true"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <motion.div
            className="mx-auto flex h-full w-full max-w-[1200px] flex-col justify-center px-10"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            <div className="text-[64px] font-semibold tracking-tight text-white">
              Menu
            </div>

            <div className="mt-10 grid gap-8">
              <MenuItem
                label="Meals"
                onClick={() => onPick?.("meals")}
                hint="(coming next)"
              />
              <MenuItem
                label="Events"
                onClick={() => onPick?.("events")}
                hint="(coming next)"
              />
              <MenuItem
                label="Photos"
                onClick={() => onPick?.("photos")}
                hint="(coming next)"
              />
            </div>

            <div className="mt-14 text-[36px] font-semibold text-white">
              Tap anywhere to go back
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function MenuItem({
  label,
  hint,
  onClick,
}: {
  label: string;
  hint?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        // Prevent the backdrop click handler from closing first.
        e.stopPropagation();
        onClick?.();
      }}
      className="flex w-full items-baseline justify-between border-b-2 border-white/35 py-6 text-left text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white"
    >
      <span className="text-[56px] font-semibold">{label}</span>
      {hint ? <span className="text-[34px] font-semibold">{hint}</span> : null}
    </button>
  );
}

