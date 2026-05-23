"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import allQuestionsData from "@/data/questions.json";

interface Question {
  id: string;
  subject: string;
  topic: string;
  difficulty: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation: string;
}

type AnswerKey = "a" | "b" | "c" | "d";
type Phase = "loading" | "quiz" | "summary";

interface Result {
  question_id: string;
  selected_answer: string;
  is_correct: boolean;
}

const OPTIONS: AnswerKey[] = ["a", "b", "c", "d"];
const LABEL: Record<AnswerKey, string> = { a: "A", b: "B", c: "C", d: "D" };
const XP_PER_CORRECT = 10;

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function getOptionText(q: Question, option: AnswerKey): string {
  return q[`option_${option}` as keyof Question] as string;
}

export default function ChallengePage() {
  const { userId, isLoaded } = useAuth();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<AnswerKey | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [phase, setPhase] = useState<Phase>("loading");
  const [profileId, setProfileId] = useState<string | null>(null);
  const [finalScore, setFinalScore] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);

  useEffect(() => {
    if (!isLoaded || !userId) return;

    async function init() {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, weak_subjects")
        .eq("user_id", userId)
        .single();

      if (profile?.id) setProfileId(profile.id);

      const weakSubjects: string[] = profile?.weak_subjects ?? [];
      const all = allQuestionsData as Question[];

      const pool =
        weakSubjects.length > 0
          ? all.filter((q) => weakSubjects.includes(q.subject))
          : all;

      const padded =
        pool.length >= 10
          ? pool
          : [...pool, ...all.filter((q) => !pool.some((p) => p.id === q.id))];

      setQuestions(shuffle(padded).slice(0, 10));
      setPhase("quiz");
    }

    init();
  }, [isLoaded, userId]);

  async function handleAnswer(answer: AnswerKey) {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(answer);

    const current = questions[currentIndex];
    const isCorrect = answer === current.correct_answer;

    setResults((prev) => [
      ...prev,
      { question_id: current.id, selected_answer: answer, is_correct: isCorrect },
    ]);

    await supabase.from("attempts").insert({
      question_id: current.id,
      selected_answer: answer,
      is_correct: isCorrect,
      user_id: userId,
    });
  }

  async function handleNext() {
    const isLast = currentIndex + 1 >= questions.length;

    if (isLast) {
      const correctCount = results.filter((r) => r.is_correct).length;
      const xp = correctCount * XP_PER_CORRECT;
      setFinalScore(correctCount);
      setXpEarned(xp);

      if (profileId) {
        const { data: current } = await supabase
          .from("profiles")
          .select("xp")
          .eq("id", profileId)
          .single();

        await supabase
          .from("profiles")
          .update({ xp: (current?.xp ?? 0) + xp })
          .eq("id", profileId);
      }

      setPhase("summary");
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
    }
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (phase === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-400">Loading your challenge…</p>
      </main>
    );
  }

  // ── Summary ──────────────────────────────────────────────────────────────
  if (phase === "summary") {
    const total = questions.length;
    const pct = Math.round((finalScore / total) * 100);

    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 p-8">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-100">
          <h1 className="text-2xl font-bold text-gray-900">Challenge complete!</h1>
          <p className="mt-1 text-sm text-gray-500">Here&apos;s how you did</p>

          <div className="mt-8">
            <p className="text-7xl font-bold text-blue-600">
              {finalScore}
              <span className="text-3xl text-gray-400">/{total}</span>
            </p>
            <p className="mt-1 text-sm text-gray-500">{pct}% correct</p>
          </div>

          <div className="mt-6 rounded-xl bg-amber-50 p-4 ring-1 ring-amber-100">
            <p className="text-3xl font-bold text-amber-500">+{xpEarned} XP</p>
            <p className="mt-0.5 text-sm text-amber-700">earned this session</p>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Play again →
          </button>
        </div>
      </main>
    );
  }

  // ── Quiz ─────────────────────────────────────────────────────────────────
  const current = questions[currentIndex];
  const total = questions.length;
  const answered = selectedAnswer !== null;
  const isCorrect = selectedAnswer === current.correct_answer;

  function optionClass(option: AnswerKey): string {
    const base = "flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors";
    if (!answered) return `${base} border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 cursor-pointer`;
    if (option === current.correct_answer) return `${base} border-green-400 bg-green-50 text-green-900`;
    if (option === selectedAnswer) return `${base} border-red-300 bg-red-50 text-red-900`;
    return `${base} border-gray-100 bg-white text-gray-400`;
  }

  function badgeClass(option: AnswerKey): string {
    const base = "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold";
    if (!answered) return `${base} border-gray-300 text-gray-500`;
    if (option === current.correct_answer) return `${base} border-green-500 bg-green-500 text-white`;
    if (option === selectedAnswer) return `${base} border-red-400 bg-red-400 text-white`;
    return `${base} border-gray-200 text-gray-400`;
  }

  return (
    <main className="flex min-h-screen items-start justify-center bg-gray-50 p-8">
      <div className="w-full max-w-xl">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Question {currentIndex + 1} of {total}</span>
            <span>{current.subject} · {current.topic}</span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <p className="text-sm font-medium leading-relaxed text-gray-900 whitespace-pre-line">
            {current.question}
          </p>

          <div className="mt-5 space-y-2.5">
            {OPTIONS.map((option) => (
              <button
                key={option}
                onClick={() => handleAnswer(option)}
                disabled={answered}
                className={optionClass(option)}
              >
                <span className={badgeClass(option)}>{LABEL[option]}</span>
                <span className="pt-0.5">{getOptionText(current, option)}</span>
              </button>
            ))}
          </div>

          {answered && (
            <div
              className={`mt-5 rounded-xl border p-4 ${
                isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
              }`}
            >
              <p className={`text-xs font-semibold uppercase tracking-wide ${isCorrect ? "text-green-700" : "text-red-600"}`}>
                {isCorrect ? "Correct!" : "Incorrect"}
              </p>
              <p className="mt-1 text-sm text-gray-700">{current.explanation}</p>
            </div>
          )}

          {answered && (
            <button
              onClick={handleNext}
              className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              {currentIndex + 1 >= total ? "See results →" : "Next question →"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
