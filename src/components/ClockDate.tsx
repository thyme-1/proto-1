"use client";

import { useEffect, useMemo, useState } from "react";

function formatTime(d: Date) {
  // Large, easy-to-read time (local device time).
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

export function ClockDate() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    // Update once per second for a responsive clock.
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const time = useMemo(() => formatTime(now), [now]);
  const date = useMemo(() => formatDate(now), [now]);

  return (
    <header className="flex flex-col gap-2 rounded-3xl bg-white/70 p-6 shadow-sm ring-1 ring-black/10 backdrop-blur md:flex-row md:items-end md:justify-between md:p-8">
      <div className="text-slate-900">
        <div className="text-6xl font-semibold leading-none tracking-tight md:text-7xl">
          {time}
        </div>
        <div className="mt-2 text-xl font-medium text-slate-700 md:text-2xl">
          {date}
        </div>
      </div>
      <div className="mt-2 rounded-2xl bg-sky-50 px-4 py-3 text-lg font-semibold text-slate-900 ring-1 ring-sky-100 md:mt-0 md:text-xl">
        Resident Dashboard
      </div>
    </header>
  );
}

