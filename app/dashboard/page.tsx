"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Profile {
  xp: number;
  streak: number;
  weak_subjects: string[];
  test_date: string | null;
}

const SUBJECT_COLORS: Record<string, string> = {
  Math: "bg-blue-100 text-blue-700 ring-blue-200",
  Reading: "bg-violet-100 text-violet-700 ring-violet-200",
  Writing: "bg-emerald-100 text-emerald-700 ring-emerald-200",
};

function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.max(0, Math.ceil((target.getTime() - today.getTime()) / 86_400_000));
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("profiles")
        .select("xp, streak, weak_subjects, test_date")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      setProfile(
        data
          ? {
              xp: data.xp ?? 0,
              streak: data.streak ?? 0,
              weak_subjects: data.weak_subjects ?? [],
              test_date: data.test_date ?? null,
            }
          : null
      );
      setLoading(false);
    }
    load();
  }, []);

  const days =
    profile?.test_date ? daysUntil(profile.test_date) : null;

  // ── Loading skeleton ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-400">Loading…</p>
      </main>
    );
  }

  // ── No profile yet ───────────────────────────────────────────────────────
  if (!profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 p-8">
        <div className="text-center">
          <p className="text-gray-500">No profile found.</p>
          <Link
            href="/onboarding"
            className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Complete onboarding →
          </Link>
        </div>
      </main>
    );
  }

  // ── Dashboard ────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-xl space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {greeting()} 👋
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {profile.streak > 0
              ? `You're on a ${profile.streak}-day streak. Don't break it!`
              : "Start a challenge to begin your streak."}
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            emoji="⚡"
            label="Total XP"
            value={profile.xp.toLocaleString()}
          />
          <StatCard
            emoji="🔥"
            label="Streak"
            value={`${profile.streak}d`}
          />
          <StatCard
            emoji="📅"
            label="Days left"
            value={days !== null ? String(days) : "—"}
            sub={days === 0 ? "Today!" : days === 1 ? "tomorrow" : days !== null ? "until test" : "no date set"}
          />
        </div>

        {/* CTA */}
        <Link
          href="/challenge"
          className="flex items-center justify-between rounded-2xl bg-blue-600 px-6 py-5 shadow-md shadow-blue-200 transition-transform hover:scale-[1.01] hover:bg-blue-700 active:scale-100"
        >
          <div>
            <p className="text-base font-bold text-white">Start today&apos;s challenge</p>
            <p className="mt-0.5 text-sm text-blue-200">10 questions · earn XP</p>
          </div>
          <span className="text-2xl">→</span>
        </Link>

        {/* Weak subjects */}
        {profile.weak_subjects.length > 0 && (
          <div className="rounded-2xl bg-white p-5 ring-1 ring-gray-100">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Focus areas
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {profile.weak_subjects.map((subject) => (
                <span
                  key={subject}
                  className={`rounded-full px-3 py-1 text-sm font-medium ring-1 ${
                    SUBJECT_COLORS[subject] ?? "bg-gray-100 text-gray-600 ring-gray-200"
                  }`}
                >
                  {subject}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* XP progress hint */}
        <p className="text-center text-xs text-gray-400">
          Complete challenges to earn XP and level up your score.
        </p>

      </div>
    </main>
  );
}

function StatCard({
  emoji,
  label,
  value,
  sub,
}: {
  emoji: string;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl bg-white p-4 text-center ring-1 ring-gray-100">
      <span className="text-xl">{emoji}</span>
      <p className="mt-1.5 text-xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
      <p className="mt-0.5 text-xs text-gray-400">{label}</p>
    </div>
  );
}
