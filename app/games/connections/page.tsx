"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Category {
  name: string;
  color: "yellow" | "green" | "blue" | "purple";
  words: string[];
}

interface Puzzle {
  puzzle_date: string;
  categories: Category[];
}

const COLOR_BG: Record<string, string> = {
  yellow: "bg-yellow-400",
  green:  "bg-green-500",
  blue:   "bg-blue-500",
  purple: "bg-purple-500",
};

const COLOR_TEXT: Record<string, string> = {
  yellow: "text-yellow-900",
  green:  "text-white",
  blue:   "text-white",
  purple: "text-white",
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function WordLinksPage() {
  const [puzzle, setPuzzle]     = useState<Puzzle | null>(null);
  const [words, setWords]       = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [solved, setSolved]     = useState<Category[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [shaking, setShaking]   = useState(false);
  const [hint, setHint]         = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const today = new Date();
    const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    console.log("Fetching puzzle for date:", localDate);
    supabase
      .from("connections_puzzles")
      .select("puzzle_date, categories")
      .eq("puzzle_date", localDate)
      .single()
      .then(({ data, error }) => {
        console.log("Puzzle data:", data, "Error:", error);
        if (!data) { setNotFound(true); setLoading(false); return; }
        setPuzzle(data as Puzzle);
        setWords(shuffle((data as Puzzle).categories.flatMap((c) => c.words)));
        setLoading(false);
      });
  }, []);

  function toggleWord(word: string) {
    if (shaking || gameOver) return;
    setHint(null);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(word)) {
        next.delete(word);
      } else if (next.size < 4) {
        next.add(word);
      }
      return next;
    });
  }

  function handleSubmit() {
    if (!puzzle || selected.size !== 4 || shaking) return;
    const sel = Array.from(selected);
    const remaining = puzzle.categories.filter((c) => !solved.find((s) => s.name === c.name));
    const match = remaining.find((c) => sel.every((w) => c.words.includes(w)));

    if (match) {
      const newSolved = [...solved, match];
      setSolved(newSolved);
      setSelected(new Set());
      setHint(null);
      setWords((prev) => prev.filter((w) => !match.words.includes(w)));
      if (newSolved.length === 4) setGameOver(true);
      return;
    }

    // Check "one away"
    const maxOverlap = Math.max(...remaining.map((c) => sel.filter((w) => c.words.includes(w)).length));
    if (maxOverlap === 3) setHint("One away!");

    setShaking(true);
    setTimeout(() => {
      setShaking(false);
      const next = mistakes + 1;
      setMistakes(next);
      setSelected(new Set());
      if (next >= 4) setGameOver(true);
    }, 600);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-400">Loading…</p>
      </main>
    );
  }

  if (notFound || !puzzle) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <p className="text-4xl">🔌</p>
          <p className="mt-3 text-base font-bold text-gray-900">No puzzle today</p>
          <p className="mt-1 text-sm text-gray-500">Check back tomorrow!</p>
        </div>
      </main>
    );
  }

  const unsolvedCategories = puzzle.categories.filter(
    (c) => !solved.find((s) => s.name === c.name)
  );

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-lg space-y-5">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">WordLinks</h1>
          <p className="mt-1 text-sm text-gray-500">Find four groups of four related words.</p>
        </div>

        {/* Solved category banners */}
        {solved.length > 0 && (
          <div className="space-y-2">
            {solved.map((cat) => (
              <div
                key={cat.name}
                className={`rounded-xl px-4 py-3 text-center ${COLOR_BG[cat.color]} ${COLOR_TEXT[cat.color]}`}
              >
                <p className="text-xs font-bold uppercase tracking-widest opacity-80">{cat.name}</p>
                <p className="mt-0.5 text-sm font-semibold">{cat.words.join(", ")}</p>
              </div>
            ))}
          </div>
        )}

        {/* Word grid */}
        {!gameOver && words.length > 0 && (
          <div className="grid grid-cols-4 gap-2">
            {words.map((word) => {
              const isSel = selected.has(word);
              return (
                <button
                  key={word}
                  onClick={() => toggleWord(word)}
                  className={`rounded-xl py-5 px-1 text-center text-xs font-bold uppercase tracking-wide transition-all select-none
                    ${isSel
                      ? `bg-gray-700 text-white scale-95 ${shaking ? "animate-shake" : ""}`
                      : "bg-white text-gray-800 ring-1 ring-gray-200 hover:ring-2 hover:ring-gray-400"
                    }`}
                >
                  {word}
                </button>
              );
            })}
          </div>
        )}

        {/* Game over — reveal unsolved categories */}
        {gameOver && unsolvedCategories.length > 0 && (
          <div className="space-y-2">
            {unsolvedCategories.map((cat) => (
              <div
                key={cat.name}
                className={`rounded-xl px-4 py-3 text-center opacity-60 ${COLOR_BG[cat.color]} ${COLOR_TEXT[cat.color]}`}
              >
                <p className="text-xs font-bold uppercase tracking-widest">{cat.name}</p>
                <p className="mt-0.5 text-sm font-semibold">{cat.words.join(", ")}</p>
              </div>
            ))}
          </div>
        )}

        {/* Hint */}
        {hint && !gameOver && (
          <p className="text-center text-sm font-semibold text-orange-500 animate-pulse">
            {hint}
          </p>
        )}

        {/* Mistake dots */}
        <div className="flex items-center justify-center gap-2">
          <span className="text-xs text-gray-400">Mistakes remaining:</span>
          <div className="flex gap-1.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className={`h-3 w-3 rounded-full transition-colors ${
                  i < mistakes ? "bg-gray-800" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Controls */}
        {!gameOver && (
          <div className="flex justify-center gap-2">
            <button
              onClick={() => setWords((prev) => shuffle(prev))}
              className="rounded-full border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Shuffle
            </button>
            <button
              onClick={() => setSelected(new Set())}
              disabled={selected.size === 0}
              className="rounded-full border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Deselect All
            </button>
            <button
              onClick={handleSubmit}
              disabled={selected.size !== 4 || shaking}
              className="rounded-full bg-gray-800 px-5 py-2 text-sm font-semibold text-white hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Submit
            </button>
          </div>
        )}

        {/* Game over result */}
        {gameOver && (
          <div className="rounded-2xl bg-white p-6 text-center ring-1 ring-gray-100">
            {mistakes >= 4 ? (
              <>
                <p className="text-3xl">😔</p>
                <p className="mt-2 text-base font-bold text-gray-900">Better luck next time!</p>
                <p className="mt-1 text-sm text-gray-500">You used all four mistakes.</p>
              </>
            ) : (
              <>
                <p className="text-3xl">🎉</p>
                <p className="mt-2 text-base font-bold text-gray-900">
                  {mistakes === 0 ? "Perfect solve!" : "Solved!"}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {mistakes === 0
                    ? "No mistakes — impressive."
                    : `${mistakes} mistake${mistakes > 1 ? "s" : ""}`}
                </p>
              </>
            )}
          </div>
        )}

      </div>
    </main>
  );
}
