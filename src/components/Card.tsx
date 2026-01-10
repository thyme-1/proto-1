import type { ReactNode } from "react";

export function Card({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={[
        "rounded-2xl border border-black/10 bg-white/90 shadow-sm",
        "backdrop-blur supports-[backdrop-filter]:bg-white/75",
        "p-6 md:p-7",
        className,
      ].join(" ")}
    >
      {title ? (
        <h2 className="mb-4 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
          {title}
        </h2>
      ) : null}
      {children}
    </section>
  );
}

