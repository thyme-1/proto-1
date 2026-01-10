import { cookies } from "next/headers";
import Link from "next/link";
import { AdminLogin } from "@/app/admin/_components/AdminLogin";
import { AdminEditor } from "@/app/admin/_components/AdminEditor";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const isAuthed = cookieStore.get("rd_admin")?.value === "1";

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_700px_at_15%_10%,#E9F5FF_0%,transparent_60%),radial-gradient(900px_600px_at_85%_5%,#FFF8E7_0%,transparent_55%),linear-gradient(#F8FAFC,#F8FAFC)] px-4 py-6 md:px-8 md:py-8">
      <main className="mx-auto w-full max-w-5xl">
        <header className="mb-6 flex flex-col gap-3 rounded-3xl bg-white/70 p-6 shadow-sm ring-1 ring-black/10 backdrop-blur md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
              Admin Editor
            </h1>
            <p className="mt-2 text-lg text-slate-700 md:text-xl">
              Update meals, events, and slideshow photos.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-lg font-semibold text-white hover:bg-slate-800"
          >
            Back to Dashboard
          </Link>
        </header>

        {isAuthed ? <AdminEditor /> : <AdminLogin />}
      </main>
    </div>
  );
}

