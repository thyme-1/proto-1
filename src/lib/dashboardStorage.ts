import type { DashboardData } from "@/lib/dashboardTypes";

/**
 * Client-side storage adapter for the MVP.
 *
 * - "Base" data is bundled in the deployed app at `/data/dashboard.json`.
 * - Admin edits are saved as a local override in `localStorage`.
 *
 * Why this design:
 * - Works in fully static deployments where you *cannot* write to the server filesystem.
 * - Makes swapping to Firebase/Supabase easy later: replace only this module.
 */

const LOCAL_OVERRIDE_KEY = "residentDashboard.override.v1";

export function getTodayISODate(d = new Date()): string {
  // Local YYYY-MM-DD (not UTC) so "today" matches what residents expect.
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export async function fetchBundledDashboard(): Promise<DashboardData> {
  // `cache: "no-store"` ensures the clock/day changes don't get stuck behind caching in dev.
  const res = await fetch("/data/dashboard.json", { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load dashboard.json (${res.status})`);
  }
  return (await res.json()) as DashboardData;
}

export function readLocalOverride(): Partial<DashboardData> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LOCAL_OVERRIDE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<DashboardData>;
  } catch {
    return null;
  }
}

export function writeLocalOverride(next: DashboardData) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    LOCAL_OVERRIDE_KEY,
    JSON.stringify({ ...next, updatedAt: new Date().toISOString() })
  );
}

export function clearLocalOverride() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(LOCAL_OVERRIDE_KEY);
}

export function mergeDashboardData(
  base: DashboardData,
  override: Partial<DashboardData> | null
): DashboardData {
  if (!override) return base;

  // Shallow merge is enough for our simple MVP shape.
  // If you later add nested structures, make this a proper deep merge.
  return {
    ...base,
    ...override,
    meals: { ...base.meals, ...(override.meals ?? {}) },
    events: override.events ?? base.events,
    photos: override.photos ?? base.photos,
  };
}

export async function loadDashboardData(): Promise<DashboardData> {
  const base = await fetchBundledDashboard();
  const override = readLocalOverride();
  return mergeDashboardData(base, override);
}

