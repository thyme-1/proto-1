"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import type { DashboardPhoto } from "@/lib/dashboardTypes";

/**
 * HomePhotoFrame
 *
 * Resident home screen UX:
 * - Looks like a digital photo frame (edge-to-edge photo).
 * - Very large time + clear date.
 * - Exactly ONE short contextual line.
 * - Tap anywhere to open the menu (handled by the parent via onPress).
 *
 * Design rules (important):
 * - No cards, no boxed sections, no background blur.
 * - High contrast only.
 * - Minimal elements.
 */
export function HomePhotoFrame({
  photos,
  timeText,
  dateText,
  infoText,
  intervalMs = 17000,
  onPress,
}: {
  photos: DashboardPhoto[];
  timeText: string;
  dateText: string;
  infoText: string;
  intervalMs?: number;
  onPress?: () => void;
}) {
  const safePhotos = useMemo(() => (photos.length > 0 ? photos : []), [photos]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (safePhotos.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % safePhotos.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs, safePhotos.length]);

  const current = useMemo(() => safePhotos[index], [index, safePhotos]);

  return (
    <button
      type="button"
      onClick={onPress}
      className="fixed inset-0 block h-full w-full bg-black text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white"
      aria-label="Open menu"
    >
      {/* Photo layer */}
      <div className="absolute inset-0">
        {current ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${index}-${current.url}`}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              // Slow, calm fade transitions (no motion other than opacity).
              transition={{ duration: 1.2, ease: "easeOut" }}
            >
              <Image
                src={current.url}
                alt={current.alt}
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-black text-white">
            <div className="text-[44px] font-semibold">No photos yet</div>
          </div>
        )}

        {/* Readability overlay (not a box; no blur) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/0" />
      </div>

      {/* Text overlay */}
      <div className="relative flex h-full w-full items-end p-10 md:p-14">
        <div className="max-w-[1100px] text-white">
          <div className="text-[132px] font-semibold leading-[0.92] tracking-tight drop-shadow-[0_10px_24px_rgba(0,0,0,0.65)] md:text-[156px]">
            {timeText}
          </div>
          <div className="mt-4 text-[44px] font-semibold leading-tight drop-shadow-[0_10px_24px_rgba(0,0,0,0.65)] md:text-[52px]">
            {dateText}
          </div>
          <div className="mt-6 text-[40px] font-semibold leading-tight drop-shadow-[0_10px_24px_rgba(0,0,0,0.65)] md:text-[44px]">
            {infoText}
          </div>
        </div>
      </div>
    </button>
  );
}

