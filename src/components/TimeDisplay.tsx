"use client";

import { useEffect, useMemo, useState } from "react";

function formatTime(d: Date) {
  // Very large, high-contrast time (local device time).
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function formatDate(d: Date) {
  return d.toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function TimeDisplay({
  onPress,
  now: nowProp,
}: {
  onPress?: () => void;
  now?: Date;
}) {
  const [now, setNow] = useState(() => nowProp ?? new Date());

  useEffect(() => {
    if (nowProp) return;
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, [nowProp]);

  const effectiveNow = nowProp ?? now;
  const time = useMemo(() => formatTime(effectiveNow), [effectiveNow]);
  const date = useMemo(() => formatDate(effectiveNow), [effectiveNow]);

  return (
    <button
      type="button"
      onClick={onPress}
      className="group inline-flex w-full flex-col items-start gap-3 rounded-[28px] bg-black/30 px-7 py-6 text-left text-white shadow-[0_12px_30px_rgba(0,0,0,0.18)] ring-1 ring-white/25 backdrop-blur-sm transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/50 md:px-9 md:py-7"
      aria-label="Open full-screen clock"
    >
      <div className="text-[104px] font-semibold leading-[0.95] tracking-tight md:text-[120px]">
        {time}
      </div>
      <div className="text-[34px] font-semibold leading-tight md:text-[38px]">
        {date}
      </div>
    </button>
  );
}

