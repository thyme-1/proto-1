"use client";

import { useEffect, useMemo, useState } from "react";
import { HomePhotoFrame } from "@/components/HomePhotoFrame";
import { HomeMenuOverlay } from "@/components/HomeMenuOverlay";
import { getTodayISODate, loadDashboardData } from "@/lib/dashboardStorage";
import type { DashboardData } from "@/lib/dashboardTypes";

function toMinutes(timeHHMM: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(timeHHMM.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (Number.isNaN(h) || Number.isNaN(min)) return null;
  return h * 60 + min;
}

export default function Home() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date());
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadDashboardData()
      .then((d) => {
        if (cancelled) return;
        setData(d);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load dashboard");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const todayISO = getTodayISODate(now);

  const infoLine = useMemo(() => {
    if (!data) return "Loading…";

    const todays = data.events.filter((e) => e.date === todayISO);
    if (todays.length === 0) return "No events today";

    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const sorted = [...todays].sort((a, b) => a.time.localeCompare(b.time));
    const upcoming =
      sorted.find((e) => {
        const m = toMinutes(e.time);
        return m != null && m >= nowMinutes;
      }) ?? sorted[0];

    // Keep this single line short and easy to scan.
    // (If we later add meal times, we can swap between “Dinner at 5:30 PM” etc.)
    const timeLabel = new Date(`${todayISO}T${upcoming.time}:00`).toLocaleTimeString(
      [],
      { hour: "numeric", minute: "2-digit" }
    );
    const text = `Next: ${upcoming.title} at ${timeLabel}`;
    return text.length > 56 ? `${text.slice(0, 55)}…` : text;
  }, [data, now, todayISO]);

  const timeText = useMemo(
    () => now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
    [now]
  );
  const dateText = useMemo(
    () =>
      now.toLocaleDateString([], {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    [now]
  );

  return (
    <>
      {error ? (
        <div className="fixed inset-0 flex items-center justify-center bg-black p-10 text-white">
          <div className="text-[40px] font-semibold">{error}</div>
        </div>
      ) : null}

      <HomePhotoFrame
        photos={data?.photos ?? []}
        timeText={timeText}
        dateText={dateText}
        infoText={infoLine}
        intervalMs={17000}
        onPress={() => setMenuOpen(true)}
      />

      <HomeMenuOverlay
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        onPick={() => {
          // Home-screen-only task: we’ll wire these to full-screen views next.
          setMenuOpen(false);
        }}
      />
    </>
  );
}
