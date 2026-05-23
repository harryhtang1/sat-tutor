"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import Heatmap from "@/components/Heatmap";

interface Profile {
  xp: number;
  streak: number;
  weak_subjects: string[];
  test_date: string | null;
}

const ALL_SUBJECTS = ["Math", "Reading & Writing"];

const SUBJECT_COLORS: Record<string, string> = {
  Math: "bg-blue-100 text-blue-700 ring-blue-200",
  "Reading & Writing": "bg-violet-100 text-violet-700 ring-violet-200",
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
  const { userId } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingDate, setEditingDate] = useState(false);
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);

  useEffect(() => {
    if (!userId) return;
    async function load() {
      const { data } = await supabase
        .from("profiles")
        .select("xp, streak, weak_subjects, test_date")
        .eq("user_id", userId)
        .single();

      if (!data) {
        router.replace("/onboarding");
        return;
      }
      setProfile({
        xp: data.xp ?? 0,
        streak: data.streak ?? 0,
        weak_subjects: data.weak_subjects ?? [],
        test_date: data.test_date ?? null,
      });
      setLoading(false);
    }
    load();
  }, [userId]);

  async function removeSubject(subject: string) {
    if (!profile || !userId) return;
    const updated = profile.weak_subjects.filter((s) => s !== subject);
    setProfile({ ...profile, weak_subjects: updated });
    await supabase.from("profiles").update({ weak_subjects: updated }).eq("user_id", userId);
  }

  async function addSubject(subject: string) {
    if (!profile || !userId) return;
    const updated = [...profile.weak_subjects, subject];
    setProfile({ ...profile, weak_subjects: updated });
    setShowSubjectPicker(false);
    await supabase.from("profiles").update({ weak_subjects: updated }).eq("user_id", userId);
  }

  async function updateTestDate(date: string) {
    if (!profile || !userId) return;
    setProfile({ ...profile, test_date: date });
    setEditingDate(false);
    await supabase.from("profiles").update({ test_date: date }).eq("user_id", userId);
  }

  const days = profile?.test_date ? daysUntil(profile.test_date) : null;
  const available = profile ? ALL_SUBJECTS.filter((s) => !profile.weak_subjects.includes(s)) : [];
  const todayIso = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="px-4 py-10">
        <div className="mx-auto max-w-xl space-y-6">
          {loading ? (
            <p className="text-center text-sm text-gray-400">Loading…</p>
          ) : !profile ? (
            <div className="text-center">
              <p className="text-gray-500">No profile found.</p>
              <Link
                href="/onboarding"
                className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Complete onboarding →
              </Link>
            </div>
          ) : (
            <>
              {/* Header */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{greeting()} 👋</h1>
                <p className="mt-1 text-sm text-gray-500">
                  {profile.streak > 0
                    ? `You're on a ${profile.streak}-day streak. Don't break it!`
                    : "Start a challenge to begin your streak."}
                </p>
              </div>

              {/* Stat cards */}
              <div className="grid grid-cols-3 gap-3">
                <StatCard emoji="⚡" label="Total XP" value={profile.xp.toLocaleString()} />
                <StatCard emoji="🔥" label="Streak" value={`${profile.streak}d`} />

                {/* Days left — click to edit test date */}
                <div
                  onClick={() => !editingDate && setEditingDate(true)}
                  className={`flex flex-col items-center rounded-2xl bg-white p-4 text-center ring-1 ring-gray-100 transition-all ${
                    !editingDate ? "cursor-pointer hover:ring-blue-200" : ""
                  }`}
                >
                  <span className="text-xl">📅</span>
                  {editingDate ? (
                    <input
                      type="date"
                      autoFocus
                      defaultValue={profile.test_date ?? ""}
                      min={todayIso}
                      onChange={(e) => e.target.value && updateTestDate(e.target.value)}
                      onBlur={() => setEditingDate(false)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1.5 w-full rounded border border-blue-300 px-1 py-0.5 text-center text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                  ) : (
                    <>
                      <p className="mt-1.5 text-xl font-bold text-gray-900">
                        {days !== null ? String(days) : "—"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {days === 0
                          ? "Today!"
                          : days === 1
                          ? "tomorrow"
                          : days !== null
                          ? "until test"
                          : "tap to set"}
                      </p>
                    </>
                  )}
                  <p className="mt-0.5 text-xs text-gray-400">Days left</p>
                </div>
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
                <span className="text-2xl text-white">→</span>
              </Link>

              {/* Activity heatmap */}
              <Heatmap />

              {/* Focus areas */}
              <div className="rounded-2xl bg-white p-5 ring-1 ring-gray-100">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Focus areas
                  </p>
                  {available.length > 0 && (
                    <button
                      onClick={() => setShowSubjectPicker((v) => !v)}
                      aria-label="Add subject"
                      className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-500 hover:bg-gray-200"
                    >
                      +
                    </button>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {profile.weak_subjects.length === 0 ? (
                    <p className="text-sm text-gray-400">No focus areas — tap + to add one.</p>
                  ) : (
                    profile.weak_subjects.map((subject) => (
                      <button
                        key={subject}
                        onClick={() => removeSubject(subject)}
                        className={`group flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ring-1 transition-opacity hover:opacity-75 ${
                          SUBJECT_COLORS[subject] ?? "bg-gray-100 text-gray-600 ring-gray-200"
                        }`}
                      >
                        {subject}
                        <span className="text-xs opacity-50 group-hover:opacity-100">×</span>
                      </button>
                    ))
                  )}
                </div>

                {showSubjectPicker && available.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2 border-t border-gray-100 pt-3">
                    {available.map((subject) => (
                      <button
                        key={subject}
                        onClick={() => addSubject(subject)}
                        className="rounded-full border border-dashed border-gray-300 px-3 py-1 text-sm font-medium text-gray-500 hover:border-gray-400 hover:text-gray-700"
                      >
                        + {subject}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <p className="text-center text-xs text-gray-400">
                Complete challenges to earn XP and level up your score.
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({
  emoji, label, value, sub,
}: {
  emoji: string; label: string; value: string; sub?: string;
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
