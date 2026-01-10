"use client";

import { useEffect, useMemo, useState } from "react";
import { ClockDate } from "@/components/ClockDate";
import { EventsToday } from "@/components/EventsToday";
import { MealsToday } from "@/components/MealsToday";
import { PhotoSlideshow } from "@/components/PhotoSlideshow";
import { getTodayISODate, loadDashboardData } from "@/lib/dashboardStorage";
import type { DashboardData } from "@/lib/dashboardTypes";

export default function Home() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const todayISO = useMemo(() => getTodayISODate(), []);
  const todaysEvents = useMemo(() => {
    if (!data) return [];
    return data.events.filter((e) => e.date === todayISO);
  }, [data, todayISO]);

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_700px_at_15%_10%,#E9F5FF_0%,transparent_60%),radial-gradient(900px_600px_at_85%_5%,#FFF8E7_0%,transparent_55%),linear-gradient(#F8FAFC,#F8FAFC)] px-4 py-6 md:px-8 md:py-8">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <ClockDate />

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-xl text-red-900">
            {error}
          </div>
        ) : null}

        {!data ? (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="h-[240px] animate-pulse rounded-2xl bg-white/60 ring-1 ring-black/10" />
            <div className="h-[240px] animate-pulse rounded-2xl bg-white/60 ring-1 ring-black/10" />
            <div className="h-[280px] animate-pulse rounded-2xl bg-white/60 ring-1 ring-black/10 md:col-span-2" />
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <MealsToday meals={data.meals} />
            <EventsToday events={todaysEvents} />
            <div className="lg:col-span-2">
              <PhotoSlideshow photos={data.photos} />
            </div>
          </div>
        )}

        <footer className="pb-2 pt-2 text-center text-base text-slate-600">
          Tip: Staff can update meals/events/photos in{" "}
          <a className="font-semibold underline" href="/admin">
            Admin
          </a>
          .
        </footer>
      </main>
    </div>
  );
}
