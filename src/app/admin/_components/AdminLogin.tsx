"use client";

import { useState } from "react";

export function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok || !json.ok) {
        setError(json.error ?? "Login failed.");
        return;
      }

      // Cookie is set by the server. Reload to show the editor.
      window.location.reload();
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-3xl bg-white/80 p-6 shadow-sm ring-1 ring-black/10 backdrop-blur md:p-8">
      <h2 className="text-3xl font-semibold text-slate-900 md:text-4xl">
        Enter admin password
      </h2>
      <p className="mt-2 text-lg text-slate-700 md:text-xl">
        This prototype uses a simple password stored in the{" "}
        <code className="rounded bg-slate-100 px-2 py-0.5">ADMIN_PASSWORD</code>{" "}
        environment variable.
      </p>

      <form onSubmit={onSubmit} className="mt-6 grid gap-4">
        <label className="grid gap-2">
          <span className="text-lg font-semibold text-slate-900 md:text-xl">
            Password
          </span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-14 rounded-2xl border border-black/15 bg-white px-4 text-xl text-slate-900 shadow-sm outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            placeholder="Enter password"
            autoFocus
          />
        </label>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-lg text-red-900">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading || password.trim().length === 0}
          className="h-14 rounded-2xl bg-slate-900 text-xl font-semibold text-white shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </section>
  );
}

