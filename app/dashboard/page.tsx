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
  display_name: string | null;
}

const ALL_SUBJECTS = ["Math", "Reading & Writing"];

const SUBJECT_PILL: Record<string, string> = {
  Math: "bg-blue-100 text-blue-700",
  "Reading & Writing": "bg-violet-100 text-violet-700",
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

const LEVELS = [
  { number: 1, name: "Beginner",  min: 0 },
  { number: 2, name: "Learner",   min: 100 },
  { number: 3, name: "Scholar",   min: 300 },
  { number: 4, name: "Advanced",  min: 600 },
  { number: 5, name: "Expert",    min: 1000 },
  { number: 6, name: "Master",    min: 1500 },
];

function getLevel(xp: number) {
  let level = LEVELS[0];
  for (const l of LEVELS) {
    if (xp >= l.min) level = l;
    else break;
  }
  return level;
}

export default function DashboardPage() {
  const { userId } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingDate, setEditingDate] = useState(false);
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);
  const [showXpDetail, setShowXpDetail] = useState<boolean>(false);

  useEffect(() => {
    if (!userId) return;
    async function load() {
      const { data } = await supabase
        .from("profiles")
        .select("xp, streak, weak_subjects, test_date, display_name")
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
        display_name: data.display_name ?? null,
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
  const level = getLevel(profile?.xp ?? 0);
  const nextLevel = level.number < LEVELS.length ? LEVELS[level.number] : null;
  const progressPct = nextLevel
    ? Math.round(((profile?.xp ?? 0) - level.min) / (nextLevel.min - level.min) * 100)
    : 100;

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <main className="px-4 py-10">
        <div className="mx-auto max-w-xl space-y-5">
          {loading ? (
            <p className="text-center text-sm text-gray-400">Loading…</p>
          ) : !profile ? (
            <div className="text-center">
              <p className="text-gray-500">No profile found.</p>
              <Link
                href="/onboarding"
                className="mt-4 inline-block rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Complete onboarding →
              </Link>
            </div>
          ) : (
            <>
              {/* Header */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {greeting()}{profile.display_name ? `, ${profile.display_name.charAt(0).toUpperCase() + profile.display_name.slice(1)}` : ""} 👋
                </h1>
                <p className="mt-1 text-sm text-gray-400">
                  {profile.streak > 0
                    ? `You're on a ${profile.streak}-day streak. Don't break it!`
                    : "Start a challenge to begin your streak."}
                </p>
              </div>

              {/* Stat cards */}
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">

                  {/* Streak */}
                  <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-orange-400 to-rose-400 px-4 py-3 shadow-lg shadow-orange-200/60">
                    <span className="pointer-events-none absolute -right-3 -top-2 select-none text-[56px] opacity-10">🔥</span>
                    <p className="text-xs font-medium text-white/70">Streak</p>
                    <p className="mt-0.5 text-2xl font-bold leading-none text-white">{profile.streak}</p>
                    <p className="mt-0.5 text-xs font-medium text-white/70">days</p>
                  </div>

                  {/* Days left — click to edit test date */}
                  <div
                    onClick={() => !editingDate && setEditingDate(true)}
                    className={`relative overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-indigo-500 to-violet-500 px-4 py-3 shadow-lg shadow-violet-200/60 transition-transform ${
                      !editingDate ? "cursor-pointer hover:scale-[1.02]" : ""
                    }`}
                  >
                    <span className="pointer-events-none absolute -right-3 -top-2 select-none text-[56px] opacity-10">📅</span>
                    <p className="text-xs font-medium text-white/70">Days left</p>
                    {editingDate ? (
                      <input
                        type="date"
                        autoFocus
                        defaultValue={profile.test_date ?? ""}
                        min={todayIso}
                        onChange={(e) => e.target.value && updateTestDate(e.target.value)}
                        onBlur={() => setEditingDate(false)}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-2 w-full rounded-lg bg-white/20 px-1.5 py-1 text-center text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-white/40"
                      />
                    ) : (
                      <>
                        <p className="mt-0.5 text-2xl font-bold leading-none text-white">
                          {days !== null ? String(days) : "—"}
                        </p>
                        <p className="mt-0.5 text-xs font-medium text-white/70">
                          {days === 0 ? "Today!" : days === 1 ? "tomorrow" : days !== null ? "until test" : "tap to set"}
                        </p>
                      </>
                    )}
                  </div>

                  {/* XP — click to expand level detail */}
                  <div
                    onClick={() => setShowXpDetail((v) => !v)}
                    className="relative overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-blue-500 to-cyan-400 px-4 py-3 shadow-lg shadow-blue-200/60 cursor-pointer transition-transform hover:scale-[1.02]"
                  >
                    <span className="pointer-events-none absolute -right-3 -top-2 select-none text-[56px] opacity-10">⚡</span>
                    <p className="text-xs font-medium text-white/70">Total XP</p>
                    <p className="mt-0.5 text-2xl font-bold leading-none text-white">{profile.xp.toLocaleString()}</p>
                    <span className="mt-1 inline-block rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold text-white">
                      Lv.{level.number} {level.name}
                    </span>
                  </div>
                </div>

                {/* XP detail expand — dark card */}
                {showXpDetail && (
                  <div className="rounded-3xl bg-gray-900 p-5 shadow-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-black text-white">
                        Level {level.number} — {level.name}
                      </p>
                      {nextLevel && (
                        <p className="text-xs text-gray-400">Next: {nextLevel.name}</p>
                      )}
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-gray-700">
                      <div
                        className="h-full rounded-full bg-blue-500 transition-all"
                        style={{
                          width: `${progressPct}%`,
                          boxShadow: "0 0 10px rgba(59,130,246,0.7)",
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>{Math.floor(profile.xp / 10).toLocaleString()} correct answers × 10 XP</span>
                      {nextLevel ? (
                        <span>{(nextLevel.min - profile.xp).toLocaleString()} XP until Lv.{nextLevel.number}</span>
                      ) : (
                        <span>Max level reached 🏆</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* CTA */}
              <Link
                href="/challenge"
                className="relative flex w-full items-center justify-between overflow-hidden rounded-2xl bg-gray-900 px-6 py-5 transition-transform hover:scale-[1.01] active:scale-100"
                style={{ boxShadow: "0 0 40px rgba(59,130,246,0.3)" }}
              >
                <div>
                  <p className="text-base font-semibold text-white">Start today&apos;s challenge</p>
                  <p className="mt-0.5 text-sm font-medium text-gray-400">10 questions · earn XP · build your streak</p>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-lg font-black text-white ring-1 ring-white/20">
                  →
                </div>
              </Link>

              {/* Activity heatmap */}
              <div className="rounded-3xl bg-white px-5 pb-5 pt-4 shadow-sm">
                <Heatmap />
              </div>

              {/* Focus areas */}
              <div className="rounded-3xl bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                    Focus areas
                  </p>
                  {available.length > 0 && (
                    <button
                      onClick={() => setShowSubjectPicker((v) => !v)}
                      aria-label="Add subject"
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-500 hover:bg-gray-200"
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
                        className={`group flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium transition-opacity hover:opacity-75 ${
                          SUBJECT_PILL[subject] ?? "bg-gray-100 text-gray-700"
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
                        className="rounded-full border-2 border-dashed border-gray-200 px-3 py-1 text-sm font-medium text-gray-400 transition-colors hover:border-gray-400 hover:text-gray-600"
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
