import type { DashboardEvent } from "@/lib/dashboardTypes";
import { Card } from "@/components/Card";

function toMinutes(timeHHMM: string): number | null {
  // Very small, forgiving parser for "HH:MM".
  const m = /^(\d{1,2}):(\d{2})$/.exec(timeHHMM.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (Number.isNaN(h) || Number.isNaN(min)) return null;
  return h * 60 + min;
}

export function EventsToday({
  events,
  now = new Date(),
}: {
  events: DashboardEvent[];
  now?: Date;
}) {
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const sorted = [...events].sort((a, b) => {
    const am = toMinutes(a.time) ?? 0;
    const bm = toMinutes(b.time) ?? 0;
    return am - bm;
  });

  // Highlight the *next* upcoming event (senior-friendly cue).
  const nextUpcomingId =
    sorted.find((e) => {
      const m = toMinutes(e.time);
      return m != null && m >= nowMinutes;
    })?.id ?? null;

  return (
    <Card title="Today’s Events & Activities" className="h-full">
      {sorted.length === 0 ? (
        <div className="rounded-2xl bg-slate-50 p-5 text-xl text-slate-800 ring-1 ring-black/5">
          No events scheduled for today.
        </div>
      ) : (
        <ul className="grid gap-4">
          {sorted.map((e) => {
            const isHighlighted = e.id === nextUpcomingId;
            return (
              <li
                key={e.id}
                className={[
                  "rounded-2xl p-5 ring-1 transition-colors",
                  isHighlighted
                    ? "bg-amber-50 ring-amber-200"
                    : "bg-slate-50 ring-black/5",
                ].join(" ")}
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-baseline md:justify-between">
                  <div className="text-2xl font-semibold text-slate-900 md:text-3xl">
                    {e.title}
                  </div>
                  <div className="text-xl font-semibold text-slate-900 md:text-2xl">
                    {e.time}
                  </div>
                </div>
                <div className="mt-1 text-lg text-slate-700 md:text-xl">
                  {e.location ? <span>{e.location}</span> : null}
                  {e.location && e.description ? <span> • </span> : null}
                  {e.description ? <span>{e.description}</span> : null}
                </div>
                {isHighlighted ? (
                  <div className="mt-3 inline-flex items-center rounded-full bg-amber-200/60 px-4 py-1.5 text-lg font-semibold text-slate-900">
                    Next up
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

