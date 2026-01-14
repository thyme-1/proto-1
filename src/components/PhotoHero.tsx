"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { DashboardPhoto } from "@/lib/dashboardTypes";

/**
 * PhotoHero
 * - Main visual focus (60–70% of screen height)
 * - Slow, gentle fades between photos
 * - Gradient overlay for text readability
 */
export function PhotoHero({
  photos,
  intervalMs = 9000,
  children,
  onPress,
  showCounter = true,
  priority = true,
  heightClassName,
}: {
  photos: DashboardPhoto[];
  intervalMs?: number;
  children?: ReactNode;
  onPress?: () => void;
  showCounter?: boolean;
  priority?: boolean;
  heightClassName?: string;
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
      className="relative w-full overflow-hidden rounded-[36px] bg-slate-900 shadow-xl ring-1 ring-black/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/60"
      aria-label="Open full-screen photos"
    >
      {/* 60–70% of the screen height: main visual focus */}
      <div
        className={[
          "relative w-full",
          heightClassName ?? "h-[68vh] min-h-[520px]",
        ].join(" ")}
      >
        {current ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${index}-${current.url}`}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              // Calm fade (photo transitions can be a bit slower than UI overlays)
              transition={{ duration: 0.9, ease: "easeOut" }}
            >
              <Image
                src={current.url}
                alt={current.alt}
                fill
                sizes="(max-width: 768px) 100vw, 1200px"
                className="object-cover"
                priority={priority}
              />
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900 text-white">
            <div className="rounded-[28px] bg-white/10 px-8 py-6 text-[32px] font-semibold ring-1 ring-white/20">
              No photos yet
            </div>
          </div>
        )}

        {/* Soft overlay: makes white text readable over any photo */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/72 via-black/35 to-black/15" />

        {/* Content layer */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10">
          <div className="pointer-events-auto w-full max-w-[920px]">
            {children}
          </div>
        </div>

        {showCounter && safePhotos.length > 1 ? (
          <div className="pointer-events-none absolute right-5 top-5 rounded-full bg-black/40 px-5 py-3 text-[26px] font-semibold text-white ring-1 ring-white/20 backdrop-blur-sm">
            {index + 1} / {safePhotos.length}
          </div>
        ) : null}
      </div>
    </button>
  );
}

