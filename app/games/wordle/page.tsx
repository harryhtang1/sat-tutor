"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

type TileState = "empty" | "filled" | "green" | "yellow" | "gray";

const KEYBOARD_ROWS = [
  ["Q","W","E","R","T","Y","U","I","O","P"],
  ["A","S","D","F","G","H","J","K","L"],
  ["ENTER","Z","X","C","V","B","N","M","⌫"],
];

// Priority: green > yellow > gray (for key color upgrades)
const COLOR_RANK: Record<string, number> = { green: 3, yellow: 2, gray: 1 };

const TILE_STYLE: Record<TileState, string> = {
  empty:  "border-2 border-gray-200 bg-white text-gray-900",
  filled: "border-2 border-gray-500 bg-white text-gray-900",
  green:  "border-2 border-green-500 bg-green-500 text-white",
  yellow: "border-2 border-yellow-400 bg-yellow-400 text-white",
  gray:   "border-2 border-gray-400 bg-gray-400 text-white",
};

const KEY_STYLE: Record<string, string> = {
  unused: "bg-gray-200 text-gray-800 hover:bg-gray-300",
  green:  "bg-green-500 text-white",
  yellow: "bg-yellow-400 text-white",
  gray:   "bg-gray-400 text-white",
};

const EMOJI: Record<string, string> = { green: "🟩", yellow: "🟨", gray: "⬛" };

function scoreGuess(guess: string, answer: string): ("green" | "yellow" | "gray")[] {
  const result: ("green" | "yellow" | "gray")[] = Array(answer.length).fill("gray");
  const ansArr = answer.split("");
  const gArr = guess.split("");
  // First pass: greens
  for (let i = 0; i < answer.length; i++) {
    if (gArr[i] === ansArr[i]) {
      result[i] = "green";
      ansArr[i] = "#";
      gArr[i] = "*";
    }
  }
  // Second pass: yellows
  for (let i = 0; i < answer.length; i++) {
    if (gArr[i] === "*") continue;
    const idx = ansArr.indexOf(gArr[i]);
    if (idx !== -1) {
      result[i] = "yellow";
      ansArr[idx] = "#";
    }
  }
  return result;
}

function getTileSize(wordLen: number) {
  if (wordLen <= 5) return "h-14 w-14 text-2xl";
  if (wordLen <= 7) return "h-12 w-12 text-xl";
  return "h-10 w-10 text-base";
}

export default function WordlePage() {
  const [word, setWord]             = useState("");
  const [definition, setDefinition] = useState("");
  const [guesses, setGuesses]       = useState<string[]>([]);
  const [rowColors, setRowColors]   = useState<("green" | "yellow" | "gray")[][]>([]);
  const [current, setCurrent]       = useState("");
  const [keyColors, setKeyColors]   = useState<Record<string, "green" | "yellow" | "gray">>({});
  const [status, setStatus]         = useState<"playing" | "won" | "lost">("playing");
  const [shake, setShake]           = useState(false);
  const [toast, setToast]           = useState<string | null>(null);
  const [loading, setLoading]       = useState(true);
  const [notFound, setNotFound]     = useState(false);
  const [copied, setCopied]         = useState(false);

  // Ref pattern: keyboard listener stays registered once, always calls fresh logic
  const handleKeyRef = useRef<(key: string) => void>(() => {});

  useEffect(() => {
    const today = new Date();
    const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    supabase
      .from("wordle_puzzles")
      .select("word, definition")
      .eq("puzzle_date", localDate)
      .single()
      .then(({ data }) => {
        if (!data) { setNotFound(true); setLoading(false); return; }
        setWord(data.word.toUpperCase().trim());
        setDefinition(data.definition ?? "");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      handleKeyRef.current(e.key);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 1800);
  }

  function triggerShake() {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  }

  // Rebuild handleKey every render so the ref always has fresh state
  function handleKey(rawKey: string) {
    if (!word || status !== "playing") return;
    const key = rawKey.toUpperCase();

    if (key === "ENTER") {
      if (current.length !== word.length) {
        triggerShake();
        showToast(`Word must be ${word.length} letters`);
        return;
      }
      const scored = scoreGuess(current, word);
      const newGuessCount = guesses.length + 1;

      setGuesses(g => [...g, current]);
      setRowColors(c => [...c, scored]);
      setCurrent("");

      setKeyColors(prev => {
        const next = { ...prev };
        current.split("").forEach((letter, i) => {
          const existing = next[letter];
          if (!existing || COLOR_RANK[scored[i]] > (COLOR_RANK[existing] ?? 0)) {
            next[letter] = scored[i];
          }
        });
        return next;
      });

      if (current === word) setStatus("won");
      else if (newGuessCount >= 6) setStatus("lost");
      return;
    }

    if (key === "BACKSPACE" || key === "⌫") {
      setCurrent(prev => prev.slice(0, -1));
      return;
    }

    if (/^[A-Z]$/.test(key) && current.length < word.length) {
      setCurrent(prev => prev + key);
    }
  }

  handleKeyRef.current = handleKey;

  function buildShareText(): string {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const result = status === "won" ? `${guesses.length}/6` : "X/6";
    const grid = rowColors.map(row => row.map(c => EMOJI[c]).join("")).join("\n");
    return `SAT Wordle ${dateStr} ${result}\n\n${grid}`;
  }

  function handleShare() {
    navigator.clipboard.writeText(buildShareText()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-400">Loading…</p>
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <p className="text-4xl">🔤</p>
          <p className="mt-3 text-base font-bold text-gray-900">No puzzle today</p>
          <p className="mt-1 text-sm text-gray-500">Check back tomorrow!</p>
        </div>
      </main>
    );
  }

  const wordLen = word.length;
  const tileSize = getTileSize(wordLen);

  // Build 6 display rows
  const rows = Array.from({ length: 6 }, (_, i) => {
    if (i < guesses.length) {
      return guesses[i].split("").map((letter, j) => ({
        letter,
        state: rowColors[i][j] as TileState,
      }));
    }
    if (i === guesses.length && status === "playing") {
      return Array.from({ length: wordLen }, (_, j) => ({
        letter: current[j] ?? "",
        state: (current[j] ? "filled" : "empty") as TileState,
      }));
    }
    return Array.from({ length: wordLen }, () => ({ letter: "", state: "empty" as TileState }));
  });

  const winMsg = guesses.length <= 1 ? "Genius!" : guesses.length <= 2 ? "Magnificent!" : guesses.length <= 3 ? "Great job!" : guesses.length <= 4 ? "Nice!" : "Phew!";

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto flex max-w-md flex-col items-center gap-5">

        {/* Header */}
        <div className="w-full">
          <h1 className="text-2xl font-bold text-gray-900">SAT Wordle</h1>
          <p className="mt-1 text-sm text-gray-500">Guess the SAT vocabulary word in 6 tries.</p>
        </div>

        {/* Toast */}
        {toast && (
          <div className="fixed top-20 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold text-white shadow-lg">
            {toast}
          </div>
        )}

        {/* Letter grid */}
        <div className="flex flex-col gap-1.5">
          {rows.map((row, ri) => {
            const isCurrentShaking = ri === guesses.length && shake;
            return (
              <div key={ri} className={`flex gap-1.5 ${isCurrentShaking ? "animate-shake" : ""}`}>
                {row.map((cell, ci) => (
                  <div
                    key={ci}
                    className={`flex items-center justify-center font-bold uppercase transition-colors ${tileSize} ${TILE_STYLE[cell.state]}`}
                  >
                    {cell.letter}
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {/* Result card */}
        {status !== "playing" && (
          <div className="w-full rounded-2xl bg-white p-5 ring-1 ring-gray-100 space-y-3 text-center">
            {status === "won" ? (
              <>
                <p className="text-2xl">🎉</p>
                <p className="text-base font-bold text-gray-900">{winMsg}</p>
                <p className="text-sm text-gray-500">Solved in {guesses.length}/6</p>
              </>
            ) : (
              <>
                <p className="text-2xl">😔</p>
                <p className="text-sm text-gray-500">The word was</p>
                <p className="text-3xl font-extrabold tracking-[0.15em] text-gray-900">{word}</p>
              </>
            )}
            {definition && (
              <p className="rounded-xl bg-gray-50 px-3 py-2.5 text-sm italic text-gray-600 text-left">
                &ldquo;{definition}&rdquo;
              </p>
            )}
            <button
              onClick={handleShare}
              className="w-full rounded-xl bg-gray-800 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-700"
            >
              {copied ? "Copied!" : "Share Result"}
            </button>
          </div>
        )}

        {/* On-screen keyboard */}
        <div className="flex w-full flex-col items-center gap-1.5 pb-4">
          {KEYBOARD_ROWS.map((row, ri) => (
            <div key={ri} className="flex gap-1">
              {row.map((key) => {
                const color = keyColors[key] ?? "unused";
                const isWide = key === "ENTER" || key === "⌫";
                return (
                  <button
                    key={key}
                    onClick={() => handleKeyRef.current(key === "⌫" ? "BACKSPACE" : key)}
                    className={`flex h-14 items-center justify-center rounded font-bold uppercase transition-colors select-none
                      ${isWide ? "w-14 text-xs" : "w-9 text-sm"}
                      ${KEY_STYLE[color] ?? KEY_STYLE.unused}
                    `}
                  >
                    {key}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}
