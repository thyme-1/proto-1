"use client";

import { useEffect, useMemo, useState } from "react";
import { PhotoHero } from "@/components/PhotoHero";
import { TimeDisplay } from "@/components/TimeDisplay";
import { FocusOverlay } from "@/components/FocusOverlay";
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
  const [focus, setFocus] = useState<
    "home" | "clock" | "meals" | "events" | "photos"
  >("home");
  const [now, setNow] = useState(() => new Date());

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

  const { focusDateISO, focusDateLabel, focusEvents } = useMemo(() => {
    if (!data)
      return { focusDateISO: todayISO, focusDateLabel: "Today", focusEvents: [] };
    const todays = data.events.filter((e) => e.date === todayISO);
    if (todays.length > 0) {
      return { focusDateISO: todayISO, focusDateLabel: "Today", focusEvents: todays };
    }

    // Prototype-friendly fallback: if nothing is scheduled "today", show the next scheduled date.
    const sortedByDateThenTime = [...data.events].sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.time.localeCompare(b.time);
    });
    const next = sortedByDateThenTime.find((e) => e.date >= todayISO);
    const nextDate = next?.date ?? todayISO;
    const nextDateEvents = sortedByDateThenTime.filter((e) => e.date === nextDate);
    const label = nextDate === todayISO ? "Today" : "Next scheduled day";
    return { focusDateISO: nextDate, focusDateLabel: label, focusEvents: nextDateEvents };
  }, [data, todayISO]);

  const { nextEventLine, mealLine, primarySummaryLine } = useMemo(() => {
    if (!data) {
      return {
        nextEventLine: null as string | null,
        mealLine: null as string | null,
        primarySummaryLine: null as string | null,
      };
    }
    const todays = data.events.filter((e) => e.date === todayISO);
    const candidateEvents = todays.length > 0 ? todays : focusEvents;
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    const sortedEvents = [...candidateEvents].sort((a, b) =>
      a.time.localeCompare(b.time)
    );
    const upcoming =
      sortedEvents.find((e) => {
        const m = toMinutes(e.time);
        return m != null && m >= nowMinutes;
      }) ?? sortedEvents[0];

    const nextEventLine = upcoming
      ? `Next event: ${upcoming.title} at ${upcoming.time}`
      : null;

    // Meal hint is intentionally simple (no times to avoid confusion).
    const h = now.getHours();
    const mealLine =
      h < 11
        ? `Meals: Lunch is ${data.meals.lunch}`
        : h < 16
          ? `Meals: Dinner is ${data.meals.dinner}`
          : `Meals: Breakfast is ${data.meals.breakfast}`;

    // Spec: one calm summary line under the time/date.
    const primarySummaryLine = nextEventLine ?? mealLine;

    return { nextEventLine, mealLine, primarySummaryLine };
  }, [data, focusEvents, now, todayISO]);

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_700px_at_15%_10%,#E9F5FF_0%,transparent_60%),radial-gradient(900px_600px_at_85%_5%,#FFF8E7_0%,transparent_55%),linear-gradient(#F8FAFC,#F8FAFC)] px-4 py-5 md:px-8 md:py-8">
      <main className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
        {error ? (
          <div className="rounded-[28px] border-2 border-red-200 bg-red-50 p-8 text-[30px] font-semibold text-red-950">
            {error}
          </div>
        ) : null}

        {!data ? (
          <div className="h-[72vh] min-h-[520px] animate-pulse rounded-[36px] bg-white/60 ring-1 ring-black/10" />
        ) : (
          <>
            <PhotoHero photos={data.photos} onPress={() => setFocus("photos")}>
              <div className="flex flex-col gap-5">
                <TimeDisplay onPress={() => setFocus("clock")} now={now} />

                {/* One calm, one-line summary under the clock (spec requirement). */}
                <div className="rounded-[24px] bg-black/30 px-7 py-5 text-[32px] font-semibold leading-snug text-white shadow-[0_12px_30px_rgba(0,0,0,0.18)] ring-1 ring-white/25 backdrop-blur-sm md:px-9">
                  {primarySummaryLine ?? "Today"}
                </div>

                <div className="flex flex-col gap-4">
                  <button
                    type="button"
                    onClick={() => setFocus("meals")}
                    className="w-full rounded-[28px] bg-black/30 px-7 py-5 text-left text-white shadow-[0_12px_30px_rgba(0,0,0,0.18)] ring-1 ring-white/25 backdrop-blur-sm transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/50 md:px-9"
                    aria-label="Open full-screen meals"
                  >
                    <div className="text-[30px] font-semibold leading-snug">Meals</div>
                    <div className="mt-2 text-[30px] font-semibold leading-snug">
                      {mealLine ?? "Tap to see meals"}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFocus("events")}
                    className="w-full rounded-[28px] bg-black/30 px-7 py-5 text-left text-white shadow-[0_12px_30px_rgba(0,0,0,0.18)] ring-1 ring-white/25 backdrop-blur-sm transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/50 md:px-9"
                    aria-label="Open full-screen events"
                  >
                    <div className="text-[30px] font-semibold leading-snug">
                      Events {focusDateLabel.toLowerCase()}
                    </div>
                    <div className="mt-2 text-[30px] font-semibold leading-snug">
                      {nextEventLine ?? "No events scheduled."}
                    </div>
                  </button>
                </div>
              </div>
            </PhotoHero>

            <div className="rounded-[28px] bg-white/70 px-7 py-5 text-[28px] font-semibold text-slate-950 shadow-sm ring-1 ring-black/10 backdrop-blur md:px-9">
              Tip: Tap the photos, time, meals, or events for a full-screen view.
            </div>

            {/* Focus modes */}
            <FocusOverlay isOpen={focus === "clock"} onClose={() => setFocus("home")}>
              <div className="text-center text-slate-950">
                <div className="text-[140px] font-semibold leading-none tracking-tight md:text-[170px]">
                  {now.toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </div>
                <div className="mt-6 text-[40px] font-semibold">
                  {now.toLocaleDateString([], {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
                <div className="mt-8 text-[30px] font-semibold text-slate-950">
                  Tap anywhere to go back
                </div>
              </div>
            </FocusOverlay>

            <FocusOverlay isOpen={focus === "meals"} onClose={() => setFocus("home")}>
              <div className="text-slate-950">
                <div className="text-[44px] font-semibold">Meals today</div>
                <div className="mt-8 grid gap-6">
                  <div className="rounded-[28px] bg-slate-50 p-7 ring-1 ring-black/5">
                    <div className="text-[34px] font-semibold">Breakfast</div>
                    <div className="mt-3 text-[30px] font-semibold leading-snug">
                      {data.meals.breakfast}
                    </div>
                  </div>
                  <div className="rounded-[28px] bg-slate-50 p-7 ring-1 ring-black/5">
                    <div className="text-[34px] font-semibold">Lunch</div>
                    <div className="mt-3 text-[30px] font-semibold leading-snug">
                      {data.meals.lunch}
                    </div>
                  </div>
                  <div className="rounded-[28px] bg-slate-50 p-7 ring-1 ring-black/5">
                    <div className="text-[34px] font-semibold">Dinner</div>
                    <div className="mt-3 text-[30px] font-semibold leading-snug">
                      {data.meals.dinner}
                    </div>
                  </div>
                </div>
                <div className="mt-10 text-center text-[30px] font-semibold">
                  Tap anywhere to go back
                </div>
              </div>
            </FocusOverlay>

            <FocusOverlay isOpen={focus === "events"} onClose={() => setFocus("home")}>
              <div className="text-slate-950">
                <div className="text-[44px] font-semibold">
                  Events — {focusDateLabel}
                </div>
                <div className="mt-2 text-[30px] font-semibold text-slate-900">
                  {focusDateISO}
                </div>

                {focusEvents.length === 0 ? (
                  <div className="mt-8 rounded-[28px] bg-slate-50 p-7 text-[32px] font-semibold ring-1 ring-black/5">
                    No events scheduled.
                  </div>
                ) : (
                  <ul className="mt-8 grid gap-6">
                    {focusEvents
                      .slice()
                      .sort((a, b) => a.time.localeCompare(b.time))
                      .map((e) => (
                        <li
                          key={e.id}
                          className="rounded-[28px] bg-slate-50 p-7 ring-1 ring-black/5"
                        >
                          <div className="flex flex-col gap-2 md:flex-row md:items-baseline md:justify-between">
                            <div className="text-[36px] font-semibold">
                              {e.title}
                            </div>
                            <div className="text-[34px] font-semibold">
                              {e.time}
                            </div>
                          </div>
                          <div className="mt-2 text-[30px] font-semibold leading-snug text-slate-950">
                            {e.location ? <span>{e.location}</span> : null}
                            {e.location && e.description ? <span> • </span> : null}
                            {e.description ? <span>{e.description}</span> : null}
                          </div>
                        </li>
                      ))}
                  </ul>
                )}

                <div className="mt-10 text-center text-[30px] font-semibold">
                  Tap anywhere to go back
                </div>
              </div>
            </FocusOverlay>

            <FocusOverlay isOpen={focus === "photos"} onClose={() => setFocus("home")}>
              <div className="text-slate-950">
                <div className="text-[44px] font-semibold">Family photos</div>
                <div className="mt-8">
                  {/* Reuse hero slideshow in a dedicated focus mode */}
                  <PhotoHero
                    photos={data.photos}
                    onPress={() => setFocus("home")}
                    showCounter
                    priority={false}
                    heightClassName="h-[70vh] min-h-[520px]"
                  >
                    <div className="rounded-[24px] bg-black/30 px-7 py-5 text-white ring-1 ring-white/25 backdrop-blur-sm">
                      <div className="text-[30px] font-semibold">
                        Tap anywhere to go back
                      </div>
                    </div>
                  </PhotoHero>
                </div>
              </div>
            </FocusOverlay>
          </>
        )}
      </main>
    </div>
  );
}
