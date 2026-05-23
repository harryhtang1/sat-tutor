"use client";

import { useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
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

const OPTIONS: AnswerKey[] = ["a", "b", "c", "d"];
const LABEL: Record<AnswerKey, string> = { a: "A", b: "B", c: "C", d: "D" };

const DIFFICULTY_BADGE: Record<string, string> = {
  easy: "bg-green-100 text-green-700",
  medium: "bg-amber-100 text-amber-700",
  hard: "bg-red-100 text-red-700",
};

function getOptionText(q: Question, option: AnswerKey): string {
  return q[`option_${option}` as keyof Question] as string;
}

export default function TopicPage({
  params,
}: {
  params: { section: string; topic: string };
}) {
  const { section, topic } = params;

  const sectionConfig = getSectionConfig(section);
  if (!sectionConfig) notFound();

  const topicLabel = getTopicLabel(section, topic);
  const questions = (allQuestionsData as Question[]).filter(
    (q) => q.slug === topic
  );

  const isBlue = sectionConfig.accent === "blue";
  const accentRing = isBlue ? "ring-blue-200" : "ring-violet-200";
  const accentText = isBlue ? "text-blue-600" : "text-violet-600";
  const accentBg = isBlue ? "bg-blue-600" : "bg-violet-600";
  const accentBorder = isBlue ? "border-blue-400 bg-blue-50" : "border-violet-400 bg-violet-50";

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, AnswerKey>>({});

  function toggle(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  async function handleAnswer(q: Question, answer: AnswerKey) {
    if (answers[q.id]) return;
    const isCorrect = answer === q.correct_answer;
    setAnswers((prev) => ({ ...prev, [q.id]: answer }));
    await supabase.from("attempts").insert({
      question_id: q.id,
      selected_answer: answer,
      is_correct: isCorrect,
    });
  }

  const answeredCount = Object.keys(answers).length;

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-2xl">
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center gap-2 text-sm text-gray-400">
          <Link href="/practice" className="hover:text-gray-600">
            Practice
          </Link>
          <span>/</span>
          <Link
            href={`/practice/${section}`}
            className="hover:text-gray-600"
          >
            {sectionConfig.label}
          </Link>
          <span>/</span>
          <span className="text-gray-600">{topicLabel}</span>
        </div>

        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{topicLabel}</h1>
            <p className="mt-1 text-sm text-gray-500">
              {questions.length > 0
                ? `${questions.length} question${questions.length !== 1 ? "s" : ""}`
                : "No questions yet"}
              {answeredCount > 0 && (
                <span className={`ml-2 font-medium ${accentText}`}>
                  · {answeredCount} answered
                </span>
              )}
            </p>
          </div>
          {answeredCount > 0 && (
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${accentRing} ${accentText} bg-white`}
            >
              {answeredCount}/{questions.length}
            </span>
          )}
        </div>

        {/* Empty state */}
        {questions.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
            <p className="text-2xl">🚧</p>
            <p className="mt-2 text-sm font-medium text-gray-500">
              Questions coming soon
            </p>
            <p className="mt-1 text-xs text-gray-400">
              We&apos;re working on adding questions for this topic.
            </p>
          </div>
        )}

        {/* Question list */}
        <div className="space-y-3">
          {questions.map((q, index) => {
            const selected = answers[q.id] ?? null;
            const isExpanded = expandedId === q.id;
            const isAnswered = selected !== null;
            const isCorrect = selected === q.correct_answer;

            return (
              <div
                key={q.id}
                className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition-all ${
                  isAnswered
                    ? isCorrect
                      ? "border-green-200"
                      : "border-red-200"
                    : "border-gray-100"
                }`}
              >
                {/* Row header — always visible */}
                <button
                  onClick={() => toggle(q.id)}
                  className="flex w-full items-start gap-3 p-4 text-left"
                >
                  {/* Index + status dot */}
                  <span
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      isAnswered
                        ? isCorrect
                          ? "bg-green-500 text-white"
                          : "bg-red-400 text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {isAnswered ? (isCorrect ? "✓" : "✗") : index + 1}
                  </span>

                  {/* Question preview */}
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm font-medium text-gray-900 ${
                        !isExpanded ? "line-clamp-2" : ""
                      } whitespace-pre-line`}
                    >
                      {q.question}
                    </p>
                  </div>

                  {/* Right side: difficulty + chevron */}
                  <div className="flex shrink-0 items-center gap-2">
                    <span
                      className={`hidden rounded-full px-2 py-0.5 text-xs font-medium sm:inline ${
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
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="border-t border-gray-100 px-4 pb-5 pt-4">
                    {/* Difficulty badge (mobile — shown here since header hides it) */}
                    <span
                      className={`mb-3 inline-block rounded-full px-2 py-0.5 text-xs font-medium sm:hidden ${
                        DIFFICULTY_BADGE[q.difficulty] ?? "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {q.difficulty}
                    </span>

                    {/* Answer options */}
                    <div className="space-y-2">
                      {OPTIONS.map((option) => {
                        let rowStyle =
                          "flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 text-sm transition-colors";
                        let badgeStyle =
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold";

                        if (!isAnswered) {
                          rowStyle += " border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50";
                          badgeStyle += " border-gray-300 text-gray-500";
                        } else if (option === q.correct_answer) {
                          rowStyle += " border-green-400 bg-green-50 text-green-900";
                          badgeStyle += " border-green-500 bg-green-500 text-white";
                        } else if (option === selected) {
                          rowStyle += " border-red-300 bg-red-50 text-red-900";
                          badgeStyle += " border-red-400 bg-red-400 text-white";
                        } else {
                          rowStyle += " border-gray-100 bg-white text-gray-400";
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
                            <span className="pt-0.5 text-left">
                              {getOptionText(q, option)}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {isAnswered && (
                      <div
                        className={`mt-4 rounded-xl border p-4 ${
                          isCorrect
                            ? "border-green-200 bg-green-50"
                            : "border-red-200 bg-red-50"
                        }`}
                      >
                        <p
                          className={`text-xs font-semibold uppercase tracking-wide ${
                            isCorrect ? "text-green-700" : "text-red-600"
                          }`}
                        >
                          {isCorrect ? "Correct!" : "Incorrect"}
                        </p>
                        <p className="mt-1 text-sm text-gray-700">
                          {q.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Completion summary */}
        {questions.length > 0 && answeredCount === questions.length && (
          <div className={`mt-6 rounded-2xl p-5 text-center ring-1 ${accentRing} ${accentBorder}`}>
            <p className="text-base font-bold text-gray-900">
              All done! 🎉
            </p>
            <p className={`mt-0.5 text-sm font-semibold ${accentText}`}>
              {Object.values(answers).filter((a, i) => a === questions[i]?.correct_answer).length}
              /{questions.length} correct
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
