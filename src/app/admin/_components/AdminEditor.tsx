"use client";

import { useEffect, useMemo, useState } from "react";
import type { DashboardData, DashboardEvent, DashboardPhoto } from "@/lib/dashboardTypes";
import {
  clearLocalOverride,
  getTodayISODate,
  loadDashboardData,
  writeLocalOverride,
} from "@/lib/dashboardStorage";

function newId(prefix: string) {
  // Simple id generator for MVP (swap later with DB ids).
  return `${prefix}-${Date.now()}`;
}

export function AdminEditor() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const todayISO = useMemo(() => getTodayISODate(), []);

  useEffect(() => {
    let cancelled = false;
    loadDashboardData()
      .then((d) => {
        if (cancelled) return;
        setData(d);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load data.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => null);
    window.location.reload();
  }

  function save() {
    if (!data) return;
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      // Important MVP note:
      // Static deployments (Vercel/Netlify) can’t persist file writes to `data/dashboard.json` at runtime.
      // So we store admin edits as a local override in this browser’s localStorage.
      writeLocalOverride(data);
      setMessage("Saved (this device only).");
    } catch {
      setError("Could not save. (Storage may be blocked in this browser.)");
    } finally {
      setSaving(false);
    }
  }

  function resetToBundled() {
    clearLocalOverride();
    window.location.reload();
  }

  function downloadJson() {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dashboard.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-xl text-red-900">
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-[260px] animate-pulse rounded-3xl bg-white/60 ring-1 ring-black/10" />
    );
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-3xl bg-white/80 p-6 shadow-sm ring-1 ring-black/10 backdrop-blur md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-slate-900 md:text-4xl">
              Editing data
            </h2>
            <p className="mt-2 text-lg text-slate-700 md:text-xl">
              Saves are stored in this browser only. Use “Download JSON” to
              export changes and replace <code>data/dashboard.json</code> in the
              repo if you want them bundled for everyone.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={save}
              disabled={saving}
              className="h-12 rounded-2xl bg-slate-900 px-5 text-lg font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              onClick={downloadJson}
              className="h-12 rounded-2xl border border-black/15 bg-white px-5 text-lg font-semibold text-slate-900 hover:bg-slate-50"
            >
              Download JSON
            </button>
            <button
              onClick={resetToBundled}
              className="h-12 rounded-2xl border border-black/15 bg-white px-5 text-lg font-semibold text-slate-900 hover:bg-slate-50"
            >
              Reset
            </button>
            <button
              onClick={logout}
              className="h-12 rounded-2xl border border-black/15 bg-white px-5 text-lg font-semibold text-slate-900 hover:bg-slate-50"
            >
              Sign out
            </button>
          </div>
        </div>

        {message ? (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-lg text-emerald-900">
            {message}
          </div>
        ) : null}
        {error ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-lg text-red-900">
            {error}
          </div>
        ) : null}
      </section>

      <MealsEditor
        breakfast={data.meals.breakfast}
        lunch={data.meals.lunch}
        dinner={data.meals.dinner}
        onChange={(meals) => setData((d) => (d ? { ...d, meals } : d))}
      />

      <EventsEditor
        todayISO={todayISO}
        events={data.events}
        onChange={(events) => setData((d) => (d ? { ...d, events } : d))}
      />

      <PhotosEditor
        photos={data.photos}
        onChange={(photos) => setData((d) => (d ? { ...d, photos } : d))}
      />
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-lg font-semibold text-slate-900 md:text-xl">
        {label}
      </span>
      {children}
    </label>
  );
}

function MealsEditor({
  breakfast,
  lunch,
  dinner,
  onChange,
}: {
  breakfast: string;
  lunch: string;
  dinner: string;
  onChange: (meals: DashboardData["meals"]) => void;
}) {
  return (
    <section className="rounded-3xl bg-white/80 p-6 shadow-sm ring-1 ring-black/10 backdrop-blur md:p-8">
      <h2 className="text-3xl font-semibold text-slate-900 md:text-4xl">
        Meals
      </h2>
      <div className="mt-5 grid gap-5 md:grid-cols-3">
        <Field label="Breakfast">
          <textarea
            value={breakfast}
            onChange={(e) =>
              onChange({ breakfast: e.target.value, lunch, dinner })
            }
            rows={4}
            className="w-full resize-none rounded-2xl border border-black/15 bg-white p-4 text-lg text-slate-900 shadow-sm outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
          />
        </Field>
        <Field label="Lunch">
          <textarea
            value={lunch}
            onChange={(e) =>
              onChange({ breakfast, lunch: e.target.value, dinner })
            }
            rows={4}
            className="w-full resize-none rounded-2xl border border-black/15 bg-white p-4 text-lg text-slate-900 shadow-sm outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
          />
        </Field>
        <Field label="Dinner">
          <textarea
            value={dinner}
            onChange={(e) =>
              onChange({ breakfast, lunch, dinner: e.target.value })
            }
            rows={4}
            className="w-full resize-none rounded-2xl border border-black/15 bg-white p-4 text-lg text-slate-900 shadow-sm outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
          />
        </Field>
      </div>
    </section>
  );
}

function EventsEditor({
  todayISO,
  events,
  onChange,
}: {
  todayISO: string;
  events: DashboardEvent[];
  onChange: (events: DashboardEvent[]) => void;
}) {
  const sorted = [...events].sort((a, b) =>
    `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)
  );

  function update(id: string, patch: Partial<DashboardEvent>) {
    onChange(events.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }

  function remove(id: string) {
    onChange(events.filter((e) => e.id !== id));
  }

  function add() {
    const next: DashboardEvent = {
      id: newId("evt"),
      date: todayISO,
      time: "10:00",
      title: "New Activity",
      location: "Community Room",
      description: "",
    };
    onChange([...events, next]);
  }

  return (
    <section className="rounded-3xl bg-white/80 p-6 shadow-sm ring-1 ring-black/10 backdrop-blur md:p-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className="text-3xl font-semibold text-slate-900 md:text-4xl">
          Events
        </h2>
        <button
          onClick={add}
          className="h-12 rounded-2xl bg-sky-600 px-5 text-lg font-semibold text-white hover:bg-sky-500"
        >
          Add event
        </button>
      </div>

      <div className="mt-5 grid gap-4">
        {sorted.map((e) => (
          <div
            key={e.id}
            className={[
              "rounded-3xl border p-5 shadow-sm",
              e.date === todayISO
                ? "border-amber-200 bg-amber-50"
                : "border-black/10 bg-white",
            ].join(" ")}
          >
            <div className="grid gap-4 md:grid-cols-4">
              <Field label="Date">
                <input
                  type="date"
                  value={e.date}
                  onChange={(ev) => update(e.id, { date: ev.target.value })}
                  className="h-12 rounded-2xl border border-black/15 bg-white px-4 text-lg text-slate-900 shadow-sm outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                />
              </Field>
              <Field label="Time">
                <input
                  type="time"
                  value={e.time}
                  onChange={(ev) => update(e.id, { time: ev.target.value })}
                  className="h-12 rounded-2xl border border-black/15 bg-white px-4 text-lg text-slate-900 shadow-sm outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                />
              </Field>
              <Field label="Title">
                <input
                  value={e.title}
                  onChange={(ev) => update(e.id, { title: ev.target.value })}
                  className="h-12 rounded-2xl border border-black/15 bg-white px-4 text-lg text-slate-900 shadow-sm outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                />
              </Field>
              <Field label="Location">
                <input
                  value={e.location ?? ""}
                  onChange={(ev) => update(e.id, { location: ev.target.value })}
                  className="h-12 rounded-2xl border border-black/15 bg-white px-4 text-lg text-slate-900 shadow-sm outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                />
              </Field>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label="Description (optional)">
                <input
                  value={e.description ?? ""}
                  onChange={(ev) =>
                    update(e.id, { description: ev.target.value })
                  }
                  className="h-12 rounded-2xl border border-black/15 bg-white px-4 text-lg text-slate-900 shadow-sm outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                />
              </Field>

              <div className="flex items-end justify-end">
                <button
                  onClick={() => remove(e.id)}
                  className="h-12 rounded-2xl border border-red-200 bg-red-50 px-5 text-lg font-semibold text-red-900 hover:bg-red-100"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}

        {sorted.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 p-6 text-xl text-slate-800 ring-1 ring-black/5">
            No events yet. Click “Add event”.
          </div>
        ) : null}
      </div>
    </section>
  );
}

function PhotosEditor({
  photos,
  onChange,
}: {
  photos: DashboardPhoto[];
  onChange: (photos: DashboardPhoto[]) => void;
}) {
  function update(i: number, patch: Partial<DashboardPhoto>) {
    onChange(photos.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  }

  function remove(i: number) {
    onChange(photos.filter((_, idx) => idx !== i));
  }

  function add() {
    onChange([
      ...photos,
      { url: "/photos/photo-1.svg", alt: "New photo" } satisfies DashboardPhoto,
    ]);
  }

  return (
    <section className="rounded-3xl bg-white/80 p-6 shadow-sm ring-1 ring-black/10 backdrop-blur md:p-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className="text-3xl font-semibold text-slate-900 md:text-4xl">
          Photos
        </h2>
        <button
          onClick={add}
          className="h-12 rounded-2xl bg-sky-600 px-5 text-lg font-semibold text-white hover:bg-sky-500"
        >
          Add photo
        </button>
      </div>

      <div className="mt-5 grid gap-4">
        {photos.map((p, i) => (
          <div
            key={`${p.url}-${i}`}
            className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm"
          >
            <div className="grid gap-4 md:grid-cols-5">
              <Field label="Photo URL">
                <input
                  value={p.url}
                  onChange={(e) => update(i, { url: e.target.value })}
                  className="h-12 w-full rounded-2xl border border-black/15 bg-white px-4 text-lg text-slate-900 shadow-sm outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100 md:col-span-3"
                />
              </Field>

              <Field label="Alt text">
                <input
                  value={p.alt}
                  onChange={(e) => update(i, { alt: e.target.value })}
                  className="h-12 w-full rounded-2xl border border-black/15 bg-white px-4 text-lg text-slate-900 shadow-sm outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                />
              </Field>

              <div className="flex items-end justify-end md:col-span-1">
                <button
                  onClick={() => remove(i)}
                  className="h-12 rounded-2xl border border-red-200 bg-red-50 px-5 text-lg font-semibold text-red-900 hover:bg-red-100"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}

        {photos.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 p-6 text-xl text-slate-800 ring-1 ring-black/5">
            No photos yet. Click “Add photo”.
          </div>
        ) : null}
      </div>
    </section>
  );
}

