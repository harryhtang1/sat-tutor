"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import allQuestionsData from "@/data/questions.json";
import { getSectionConfig, getTopicLabel } from "@/lib/practice";
import { supabase } from "@/lib/supabase";

interface Question {
  id: string;
  subject: string;
  topic: string;
  slug: string;
  difficulty: "easy" | "medium" | "hard";
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation: string;
}

type AnswerKey = "a" | "b" | "c" | "d";
type DiffFilter = "all" | "easy" | "medium" | "hard";

const OPTIONS: AnswerKey[] = ["a", "b", "c", "d"];
const LABEL: Record<AnswerKey, string> = { a: "A", b: "B", c: "C", d: "D" };

const DIFFICULTY_BADGE: Record<string, string> = {
  easy:   "bg-green-100 text-green-700",
  medium: "bg-amber-100 text-amber-700",
  hard:   "bg-red-100 text-red-700",
};

function getOptionText(q: Question, option: AnswerKey): string {
  return q[`option_${option}` as keyof Question] as string;
}

const PAGE_SIZE = 20;

export default function TopicPage({
  params,
}: {
  params: { section: string; topic: string };
}) {
  const { userId } = useAuth();
  const { section, topic } = params;

  const sectionConfig = getSectionConfig(section);
  if (!sectionConfig) notFound();

  const topicLabel = getTopicLabel(section, topic);
  const questions = (allQuestionsData as Question[]).filter((q) => q.slug === topic);

  const isBlue     = sectionConfig.accent === "blue";
  const accentRing = isBlue ? "ring-blue-200"    : "ring-violet-200";
  const accentText = isBlue ? "text-blue-600"    : "text-violet-600";
  const accentBg   = isBlue ? "bg-blue-600"      : "bg-violet-600";
  const accentBar  = isBlue ? "bg-blue-500"      : "bg-violet-500";
  const accentBorder = isBlue
    ? "border-blue-400 bg-blue-50"
    : "border-violet-400 bg-violet-50";
  const accentTabBorder = isBlue ? "border-blue-500 text-blue-600" : "border-violet-500 text-violet-600";

  const [expandedId, setExpandedId]       = useState<string | null>(null);
  const [answers, setAnswers]             = useState<Record<string, AnswerKey>>({});
  const [pendingAnswers, setPendingAnswers] = useState<Record<string, AnswerKey>>({});
  const [diffFilter, setDiffFilter]       = useState<DiffFilter>("all");
  const [prevAttempts, setPrevAttempts]   = useState<Record<string, "correct" | "incorrect">>({});
  const [visibleCount, setVisibleCount]   = useState(PAGE_SIZE);

  // Fetch this user's previous attempts for these questions
  useEffect(() => {
    if (!userId || questions.length === 0) return;
    const qIds = questions.map((q) => q.id);
    supabase
      .from("attempts")
      .select("question_id, is_correct")
      .eq("user_id", userId)
      .in("question_id", qIds)
      .then(({ data }) => {
        const map: Record<string, "correct" | "incorrect"> = {};
        for (const row of data ?? []) {
          // "correct" wins: once mastered, always green
          if (row.is_correct) map[row.question_id] = "correct";
          else if (!map[row.question_id]) map[row.question_id] = "incorrect";
        }
        setPrevAttempts(map);
      });
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Merged status: current-session answer takes priority over DB history
  function getStatus(q: Question): "correct" | "incorrect" | null {
    if (answers[q.id] !== undefined) {
      return answers[q.id] === q.correct_answer ? "correct" : "incorrect";
    }
    return prevAttempts[q.id] ?? null;
  }

  function toggle(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  function handleAnswer(q: Question, answer: AnswerKey) {
    if (answers[q.id]) return;
    setPendingAnswers((prev) => ({ ...prev, [q.id]: answer }));
  }

  async function handleSubmit(q: Question) {
    const answer = pendingAnswers[q.id];
    if (!answer || answers[q.id]) return;
    const isCorrect = answer === q.correct_answer;
    setAnswers((prev) => ({ ...prev, [q.id]: answer }));
    // Reflect immediately in prevAttempts so sort/badge updates live
    setPrevAttempts((prev) => ({
      ...prev,
      [q.id]: isCorrect ? "correct" : (prev[q.id] === "correct" ? "correct" : "incorrect"),
    }));
    // Auto-collapse after 2 s so the user can read the explanation first
    setTimeout(() => setExpandedId((prev) => (prev === q.id ? null : prev)), 2000);

    const today = new Date().toISOString().split("T")[0];

    await supabase.from("attempts").insert({
      user_id: userId,
      question_id: q.id,
      selected_answer: answer,
      is_correct: isCorrect,
    });

    await supabase.from("daily_completions").insert({
      user_id: userId,
      completed_date: today,
      questions_answered: 1,
    });

    const { data: prof } = await supabase
      .from("profiles")
      .select("streak, last_active")
      .eq("user_id", userId)
      .single();

    if (prof && prof.last_active !== today) {
      const lastActive: string | null = prof.last_active ?? null;
      let newStreak: number;
      if (!lastActive) {
        newStreak = 1;
      } else {
        const diffDays = Math.round(
          (new Date(today).getTime() - new Date(lastActive).getTime()) / 86_400_000
        );
        if (diffDays === 1) newStreak = (prof.streak ?? 0) + 1;
        else newStreak = 1;
      }
      await supabase
        .from("profiles")
        .update({ streak: newStreak, last_active: today })
        .eq("user_id", userId);
    }
  }

  // Counts per difficulty
  const diffCounts: Record<DiffFilter, number> = {
    all:    questions.length,
    easy:   questions.filter((q) => q.difficulty === "easy").length,
    medium: questions.filter((q) => q.difficulty === "medium").length,
    hard:   questions.filter((q) => q.difficulty === "hard").length,
  };

  // Filter → sort (unanswered first) → paginate
  const filtered = diffFilter === "all"
    ? questions
    : questions.filter((q) => q.difficulty === diffFilter);

  const sorted = [...filtered].sort((a, b) => {
    const aAnswered = getStatus(a) !== null;
    const bAnswered = getStatus(b) !== null;
    if (aAnswered === bAnswered) return 0;
    return aAnswered ? 1 : -1;
  });

  const visibleQuestions = sorted.slice(0, visibleCount);
  const hasMore = sorted.length > visibleCount;

  // Progress over all questions (not just filtered view)
  const totalAnswered = questions.filter((q) => getStatus(q) !== null).length;
  const progressPct   = questions.length > 0
    ? Math.round((totalAnswered / questions.length) * 100)
    : 0;

  function applyFilter(f: DiffFilter) {
    setDiffFilter(f);
    setVisibleCount(PAGE_SIZE);
  }

  const DIFF_TABS: { key: DiffFilter; label: string }[] = [
    { key: "all",    label: "All" },
    { key: "easy",   label: "Easy" },
    { key: "medium", label: "Medium" },
    { key: "hard",   label: "Hard" },
  ];

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-2xl">
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center gap-2 text-sm text-gray-400">
          <Link href="/practice" className="hover:text-gray-600">Practice</Link>
          <span>/</span>
          <Link href={`/practice/${section}`} className="hover:text-gray-600">
            {sectionConfig.label}
          </Link>
          <span>/</span>
          <span className="text-gray-600">{topicLabel}</span>
        </div>

        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{topicLabel}</h1>
            <p className="mt-1 text-sm text-gray-500">
              {questions.length > 0
                ? `${questions.length} question${questions.length !== 1 ? "s" : ""}`
                : "No questions yet"}
            </p>
          </div>
          {totalAnswered > 0 && (
            <span className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${accentRing} ${accentText} bg-white`}>
              {totalAnswered}/{questions.length}
            </span>
          )}
        </div>

        {/* Progress bar */}
        {questions.length > 0 && (
          <div className="mb-5">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-xs text-gray-400">
                {totalAnswered} of {questions.length} answered
              </span>
              <span className="text-xs font-semibold text-gray-500">{progressPct}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className={`h-full rounded-full transition-all ${accentBar}`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}

        {/* Difficulty filter tabs */}
        {questions.length > 0 && (
          <div className="mb-5 flex border-b border-gray-200">
            {DIFF_TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => applyFilter(key)}
                className={`-mb-px px-3 pb-2 pt-1 text-sm font-medium transition-colors ${
                  diffFilter === key
                    ? `border-b-2 ${accentTabBorder}`
                    : "border-b-2 border-transparent text-gray-400 hover:text-gray-700"
                }`}
              >
                {label}
                <span className="ml-1 text-xs opacity-60">({diffCounts[key]})</span>
              </button>
            ))}
          </div>
        )}

        {/* Empty state */}
        {questions.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
            <p className="text-2xl">🚧</p>
            <p className="mt-2 text-sm font-medium text-gray-500">Questions coming soon</p>
            <p className="mt-1 text-xs text-gray-400">
              We&apos;re working on adding questions for this topic.
            </p>
          </div>
        )}

        {/* Empty filtered state */}
        {questions.length > 0 && sorted.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center">
            <p className="text-sm text-gray-400">No {diffFilter} questions for this topic.</p>
          </div>
        )}

        {/* Question list */}
        <div className="space-y-3">
          {visibleQuestions.map((q, index) => {
            const selected   = answers[q.id] ?? null;
            const pending    = pendingAnswers[q.id] ?? null;
            const isExpanded = expandedId === q.id;
            const isAnswered = selected !== null;
            const isCorrect  = selected === q.correct_answer;
            const status     = getStatus(q);

            // Display index in the sorted list (for unanswered questions)
            const displayIndex = sorted.indexOf(q) + 1;

            return (
              <div
                key={q.id}
                className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition-all ${
                  status !== null ? "opacity-60" : ""
                } ${
                  status === "correct"
                    ? "border-green-200"
                    : status === "incorrect"
                    ? "border-red-200"
                    : "border-gray-100"
                }`}
              >
                {/* Row header */}
                <button
                  onClick={() => toggle(q.id)}
                  className="flex w-full items-center gap-3 p-4 text-left"
                >
                  {/* Status badge */}
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      status === "correct"
                        ? "bg-green-500 text-white"
                        : status === "incorrect"
                        ? "bg-red-400 text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {status === "correct" ? "✓" : status === "incorrect" ? "✗" : displayIndex}
                  </span>

                  {/* Question preview — truncated to one line */}
                  <p className="min-w-0 flex-1 truncate text-sm font-medium text-gray-900">
                    {q.question}
                  </p>

                  {/* Right side: difficulty + chevron */}
                  <div className="flex shrink-0 items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        DIFFICULTY_BADGE[q.difficulty] ?? "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {q.difficulty}
                    </span>
                    <svg
                      className={`h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="border-t border-gray-100 px-4 pb-5 pt-4">
                    {/* Full question text */}
                    <p className="mb-4 text-sm font-medium text-gray-900 whitespace-pre-line">
                      {q.question}
                    </p>

                    {/* Answer options */}
                    <div className="space-y-2">
                      {OPTIONS.map((option) => {
                        let rowStyle =
                          "flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 text-sm transition-colors";
                        let badgeStyle =
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold";

                        if (!isAnswered) {
                          if (option === pending) {
                            rowStyle   += " border-blue-400 bg-blue-50 text-blue-900";
                            badgeStyle += " border-blue-500 bg-blue-500 text-white";
                          } else {
                            rowStyle   += " border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50";
                            badgeStyle += " border-gray-300 text-gray-500";
                          }
                        } else if (option === q.correct_answer) {
                          rowStyle   += " border-green-400 bg-green-50 text-green-900";
                          badgeStyle += " border-green-500 bg-green-500 text-white";
                        } else if (option === selected) {
                          rowStyle   += " border-red-300 bg-red-50 text-red-900";
                          badgeStyle += " border-red-400 bg-red-400 text-white";
                        } else {
                          rowStyle   += " border-gray-100 bg-white text-gray-400";
                          badgeStyle += " border-gray-200 text-gray-400";
                        }

                        return (
                          <button
                            key={option}
                            disabled={isAnswered}
                            onClick={() => handleAnswer(q, option)}
                            className={`w-full ${rowStyle}`}
                          >
                            <span className={badgeStyle}>{LABEL[option]}</span>
                            <span className="pt-0.5 text-left">{getOptionText(q, option)}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Submit */}
                    {!isAnswered && pending && (
                      <button
                        onClick={() => handleSubmit(q)}
                        className={`mt-3 w-full rounded-lg ${accentBg} px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90`}
                      >
                        Submit Answer
                      </button>
                    )}

                    {/* Explanation */}
                    {isAnswered && (
                      <div
                        className={`mt-4 rounded-xl border p-4 ${
                          isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                        }`}
                      >
                        <p
                          className={`text-xs font-semibold uppercase tracking-wide ${
                            isCorrect ? "text-green-700" : "text-red-600"
                          }`}
                        >
                          {isCorrect ? "Correct!" : "Incorrect"}
                        </p>
                        <p className="mt-1 text-sm text-gray-700">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Load more */}
        {hasMore && (
          <button
            onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
            className="mt-4 w-full rounded-2xl border border-gray-200 bg-white py-3 text-sm font-medium text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-700"
          >
            Load more ({sorted.length - visibleCount} remaining)
          </button>
        )}

        {/* Completion summary */}
        {questions.length > 0 && totalAnswered === questions.length && (
          <div className={`mt-6 rounded-2xl p-5 text-center ring-1 ${accentRing} ${accentBorder}`}>
            <p className="text-base font-bold text-gray-900">All done! 🎉</p>
            <p className={`mt-0.5 text-sm font-semibold ${accentText}`}>
              {questions.filter((q) => getStatus(q) === "correct").length}/{questions.length} correct
            </p>
            <Link
              href={`/practice/${section}`}
              className={`mt-4 inline-block rounded-lg ${accentBg} px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90`}
            >
              Try another topic →
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
