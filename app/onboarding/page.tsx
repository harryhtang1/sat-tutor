"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";

const SUBJECTS = ["Math", "Reading & Writing"] as const;
type Subject = (typeof SUBJECTS)[number];

type Status = "idle" | "loading" | "error";

export default function OnboardingPage() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [testDate, setTestDate] = useState("");
  const [weakSubjects, setWeakSubjects] = useState<Subject[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function validateUsername(value: string): string {
    if (value.length < 3) return "At least 3 characters required";
    if (value.length > 20) return "Maximum 20 characters";
    if (!/^[a-zA-Z0-9_]+$/.test(value)) return "Letters, numbers and underscores only";
    return "";
  }

  function toggleSubject(subject: Subject) {
    setWeakSubjects((prev) =>
      prev.includes(subject)
        ? prev.filter((s) => s !== subject)
        : [...prev, subject]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;

    const uErr = validateUsername(username);
    if (uErr) { setUsernameError(uErr); return; }

    setStatus("loading");
    setErrorMsg("");

    const { error } = await supabase.from("profiles").upsert(
      {
        user_id: userId,
        display_name: username.trim(),
        test_date: testDate,
        weak_subjects: weakSubjects,
      },
      { onConflict: "user_id" }
    );

    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
    } else {
      router.push("/dashboard");
    }
  }

  if (!isLoaded || !userId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-400">Loading…</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-8">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-100"
      >
        <h1 className="text-2xl font-bold text-gray-900">Let&apos;s get you set up</h1>
        <p className="mt-1 text-sm text-gray-500">
          Tell us a bit about yourself so we can personalise your study plan.
        </p>

        <div className="mt-8 space-y-6">
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Choose a username
            </label>
            <input
              id="username"
              type="text"
              required
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (usernameError) setUsernameError(validateUsername(e.target.value));
              }}
              onBlur={() => setUsernameError(validateUsername(username))}
              placeholder="e.g. alex_studies"
              className={`mt-1.5 block w-full rounded-lg border px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 ${
                usernameError
                  ? "border-red-300 focus:border-red-400 focus:ring-red-400"
                  : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              }`}
            />
            {usernameError ? (
              <p className="mt-1 text-xs text-red-500">{usernameError}</p>
            ) : (
              <p className="mt-1 text-xs text-gray-400">3–20 characters · letters, numbers, underscores</p>
            )}
          </div>

          {/* Test date */}
          <div>
            <label
              htmlFor="test-date"
              className="block text-sm font-medium text-gray-700"
            >
              When is your test?
            </label>
            <input
              id="test-date"
              type="date"
              required
              value={testDate}
              onChange={(e) => setTestDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="mt-1.5 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Weak subjects */}
          <div>
            <p className="block text-sm font-medium text-gray-700">
              Which subjects do you want to improve?
            </p>
            <div className="mt-2 space-y-2">
              {SUBJECTS.map((subject) => (
                <label
                  key={subject}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 transition-colors hover:bg-gray-50 has-[:checked]:border-blue-300 has-[:checked]:bg-blue-50"
                >
                  <input
                    type="checkbox"
                    checked={weakSubjects.includes(subject)}
                    onChange={() => toggleSubject(subject)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-800">{subject}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {status === "error" && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {errorMsg}
          </p>
        )}

        <button
          type="submit"
          disabled={status === "loading"}
          className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === "loading" ? "Saving…" : "Continue →"}
        </button>
      </form>
    </main>
  );
}
