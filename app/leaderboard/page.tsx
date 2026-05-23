"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";

type Tab = "alltime" | "weekly";

interface Entry {
  user_id: string;
  display_name: string | null;
  xp: number;
  streak: number;
  score: number; // xp for all-time, questions answered for weekly
}

function userName(e: Entry): string {
  return e.display_name?.trim() || (e.user_id ? e.user_id.slice(0, 8) : "Unknown");
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-base leading-none">🥇</span>;
  if (rank === 2) return <span className="text-base leading-none">🥈</span>;
  if (rank === 3) return <span className="text-base leading-none">🥉</span>;
  return <span className="w-7 text-center text-sm font-bold text-gray-400 tabular-nums">{rank}</span>;
}

function Row({ rank, entry, isMe, scoreLabel }: {
  rank: number;
  entry: Entry;
  isMe: boolean;
  scoreLabel: string;
}) {
  const name = userName(entry);
  return (
    <div
      className={`flex items-center gap-3 rounded-xl px-4 py-3 ${
        isMe ? "bg-blue-50 ring-1 ring-blue-200" : "bg-white ring-1 ring-gray-100"
      }`}
    >
      <div className="flex w-7 shrink-0 justify-center">
        <RankBadge rank={rank} />
      </div>

      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
          isMe ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600"
        }`}
      >
        {name[0].toUpperCase()}
      </div>

      <div className="min-w-0 flex-1">
        <p
          className={`truncate text-sm font-semibold ${
            isMe ? "text-blue-700" : "text-gray-900"
          }`}
        >
          {name}
          {isMe && <span className="ml-1 text-xs font-normal text-blue-400">(you)</span>}
        </p>
        {entry.streak > 0 && (
          <p className="text-xs text-gray-400">🔥 {entry.streak}-day streak</p>
        )}
      </div>

      <div className="shrink-0 text-right">
        <p
          className={`text-sm font-bold tabular-nums ${
            isMe ? "text-blue-600" : "text-gray-900"
          }`}
        >
          {entry.score.toLocaleString()}
        </p>
        <p className="text-xs text-gray-400">{scoreLabel}</p>
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  const { userId, isLoaded } = useAuth();
  const [tab, setTab] = useState<Tab>("alltime");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [myEntry, setMyEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    setLoading(true);
    const p = tab === "alltime" ? loadAllTime() : loadWeekly();
    p.finally(() => setLoading(false));
  }, [tab, isLoaded, userId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadAllTime() {
    const { data: top } = await supabase
      .from("profiles")
      .select("user_id, display_name, xp, streak")
      .order("xp", { ascending: false })
      .limit(20);

    setEntries(
      (top ?? []).map((p) => ({
        user_id: p.user_id,
        display_name: p.display_name ?? null,
        xp: p.xp ?? 0,
        streak: p.streak ?? 0,
        score: p.xp ?? 0,
      }))
    );

    if (!userId) { setMyRank(null); setMyEntry(null); return; }

    const { data: me } = await supabase
      .from("profiles")
      .select("user_id, display_name, xp, streak")
      .eq("user_id", userId)
      .single();

    if (!me) { setMyRank(null); setMyEntry(null); return; }

    // Count users with strictly more XP to find rank
    const { count } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gt("xp", me.xp ?? 0);

    setMyRank((count ?? 0) + 1);
    setMyEntry({
      user_id: me.user_id,
      display_name: me.display_name ?? null,
      xp: me.xp ?? 0,
      streak: me.streak ?? 0,
      score: me.xp ?? 0,
    });
  }

  async function loadWeekly() {
    // Monday of current week
    const now = new Date();
    const dow = now.getDay(); // 0 = Sun
    const monday = new Date(now);
    monday.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1));
    const weekStart = [
      monday.getFullYear(),
      String(monday.getMonth() + 1).padStart(2, "0"),
      String(monday.getDate()).padStart(2, "0"),
    ].join("-");

    // Fetch all completions this week across all users
    const { data: completions } = await supabase
      .from("daily_completions")
      .select("user_id, questions_answered")
      .gte("completed_date", weekStart);

    // Aggregate by user_id in JS
    const totals: Record<string, number> = {};
    for (const row of completions ?? []) {
      totals[row.user_id] = (totals[row.user_id] ?? 0) + row.questions_answered;
    }

    const allSorted = Object.entries(totals).sort(([, a], [, b]) => b - a);

    if (allSorted.length === 0) {
      setEntries([]); setMyRank(null); setMyEntry(null);
      return;
    }

    // Fetch profiles for top 20
    const top20 = allSorted.slice(0, 20);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name, xp, streak")
      .in("user_id", top20.map(([id]) => id));

    const pm: Record<string, { display_name: string | null; xp: number; streak: number }> = {};
    for (const p of profiles ?? []) {
      pm[p.user_id] = { display_name: p.display_name ?? null, xp: p.xp ?? 0, streak: p.streak ?? 0 };
    }

    setEntries(
      top20.map(([uid, total]) => ({
        user_id: uid,
        display_name: pm[uid]?.display_name ?? null,
        xp: pm[uid]?.xp ?? 0,
        streak: pm[uid]?.streak ?? 0,
        score: total,
      }))
    );

    if (!userId) { setMyRank(null); setMyEntry(null); return; }

    const myIdx = allSorted.findIndex(([id]) => id === userId);
    if (myIdx < 0) { setMyRank(null); setMyEntry(null); return; }

    setMyRank(myIdx + 1);

    // Reuse profile from top-20 lookup, or fetch separately if not in top 20
    let myProf = pm[userId];
    if (!myProf) {
      const { data } = await supabase
        .from("profiles")
        .select("display_name, xp, streak")
        .eq("user_id", userId)
        .single();
      myProf = { display_name: data?.display_name ?? null, xp: data?.xp ?? 0, streak: data?.streak ?? 0 };
    }

    setMyEntry({
      user_id: userId,
      display_name: myProf.display_name,
      xp: myProf.xp,
      streak: myProf.streak,
      score: allSorted[myIdx][1],
    });
  }

  const scoreLabel = tab === "alltime" ? "XP" : "Qs this week";
  const inTop20 = !!userId && entries.some((e) => e.user_id === userId);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-xl space-y-6">

        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
          <p className="mt-1 text-sm text-gray-500">See how you stack up</p>
        </div>

        {/* Tab toggle */}
        <div className="flex rounded-xl bg-gray-100 p-1">
          {(["alltime", "weekly"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-lg py-1.5 text-sm font-semibold transition-colors ${
                tab === t
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t === "alltime" ? "All Time" : "This Week"}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-gray-100" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center ring-1 ring-gray-100">
            <p className="text-3xl">🏆</p>
            <p className="mt-2 text-sm text-gray-500">
              {tab === "weekly"
                ? "No activity yet this week. Be the first!"
                : "No users yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry, i) => (
              <Row
                key={entry.user_id}
                rank={i + 1}
                entry={entry}
                isMe={entry.user_id === userId}
                scoreLabel={scoreLabel}
              />
            ))}

            {/* Current user outside top 20 */}
            {!inTop20 && myEntry && myRank !== null && (
              <>
                <div className="flex items-center gap-2 py-1">
                  <div className="flex-1 border-t border-dashed border-gray-300" />
                  <span className="text-xs text-gray-400">your rank</span>
                  <div className="flex-1 border-t border-dashed border-gray-300" />
                </div>
                <Row rank={myRank} entry={myEntry} isMe scoreLabel={scoreLabel} />
              </>
            )}
          </div>
        )}

      </div>
    </main>
  );
}
