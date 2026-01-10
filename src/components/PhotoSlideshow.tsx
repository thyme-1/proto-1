"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { DashboardPhoto } from "@/lib/dashboardTypes";
import { Card } from "@/components/Card";

export function PhotoSlideshow({
  photos,
  intervalMs = 6500,
}: {
  photos: DashboardPhoto[];
  intervalMs?: number;
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
    <Card title="Photos" className="h-full">
      {current ? (
        <div className="relative overflow-hidden rounded-2xl ring-1 ring-black/10">
          {/* Minimal, calm animation: a gentle fade between images */}
          <div className="animate-[fadeIn_600ms_ease-out]">
            <Image
              src={current.url}
              alt={current.alt}
              width={1600}
              height={900}
              className="h-[240px] w-full object-cover md:h-[280px] lg:h-[320px]"
              priority
            />
          </div>
          {safePhotos.length > 1 ? (
            <div className="absolute bottom-3 right-3 rounded-full bg-white/80 px-3 py-1.5 text-base font-semibold text-slate-900 ring-1 ring-black/10 backdrop-blur">
              {index + 1} / {safePhotos.length}
            </div>
          ) : null}
        </div>
      ) : (
        <div className="rounded-2xl bg-slate-50 p-6 text-xl text-slate-800 ring-1 ring-black/5">
          No photos configured yet.
        </div>
      )}
    </Card>
  );
}

