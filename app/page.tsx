import Link from "next/link";
import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";

const FEATURES = [
  {
    icon: "🎯",
    title: "Daily Challenge",
    description: "10 questions a day keeps the SAT away",
    href: "/challenge",
  },
  {
    icon: "📚",
    title: "Practice",
    description: "Drill any topic, any time",
    href: "/practice",
  },
  {
    icon: "🧠",
    title: "Learn",
    description: "Quick lessons for every SAT concept",
    href: "/learn",
  },
  {
    icon: "📊",
    title: "Dashboard",
    description: "Track your XP, streak, and progress",
    href: "/dashboard",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white">

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 px-6 py-28 text-center">
        {/* Soft radial glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(255,255,255,0.15),transparent)]"
        />

        {/* Signed-in nav chip */}
        <Show when="signed-in">
          <div className="absolute right-6 top-6">
            <UserButton afterSignOutUrl="/" />
          </div>
        </Show>

        <div className="relative mx-auto max-w-2xl">
          <span className="inline-block rounded-full bg-white/20 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-blue-100 ring-1 ring-white/30">
            AI-powered SAT prep
          </span>

          <h1 className="mt-5 text-6xl font-extrabold tracking-tight text-white sm:text-7xl">
            ScoreUp
          </h1>

          <p className="mt-4 text-lg font-medium text-blue-100 sm:text-xl">
            The AI-powered SAT tutor that actually explains your mistakes
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            {/* Signed-out: sign-in + get-started */}
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="rounded-xl bg-white/15 px-7 py-3 text-sm font-bold text-white ring-1 ring-white/30 backdrop-blur-sm transition-all hover:bg-white/25 active:scale-95">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="rounded-xl bg-white px-7 py-3 text-sm font-bold text-blue-600 shadow-lg shadow-blue-900/20 transition-all hover:bg-blue-50 hover:shadow-xl hover:shadow-blue-900/25 active:scale-95">
                  Get Started →
                </button>
              </SignUpButton>
            </Show>

            {/* Signed-in: go to dashboard */}
            <Show when="signed-in">
              <Link
                href="/dashboard"
                className="rounded-xl bg-white px-7 py-3 text-sm font-bold text-blue-600 shadow-lg shadow-blue-900/20 transition-all hover:bg-blue-50 hover:shadow-xl hover:shadow-blue-900/25 active:scale-95"
              >
                Go to Dashboard →
              </Link>
            </Show>
          </div>
        </div>
      </section>

      {/* ── Feature cards ───────────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-6 py-20">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {FEATURES.map(({ icon, title, description, href }) => (
            <Link
              key={href}
              href={href}
              className="group flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-100 hover:shadow-md"
            >
              <span className="text-3xl">{icon}</span>
              <div>
                <h2 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {title}
                </h2>
                <p className="mt-0.5 text-sm text-gray-500">{description}</p>
              </div>
              <span className="mt-auto text-xs font-semibold text-blue-500 opacity-0 transition-opacity group-hover:opacity-100">
                Open →
              </span>
            </Link>
          ))}
        </div>
      </section>

    </main>
  );
}
