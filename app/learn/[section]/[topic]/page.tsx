import Link from "next/link";
import { notFound } from "next/navigation";
import { getSectionConfig, getTopicLabel } from "@/lib/practice";
import { getLesson } from "@/lib/lessons";

export default function LessonPage({
  params,
}: {
  params: { section: string; topic: string };
}) {
  const { section, topic } = params;

  const sectionConfig = getSectionConfig(section);
  if (!sectionConfig) notFound();

  const lesson = getLesson(topic);
  if (!lesson) notFound();

  const topicLabel = getTopicLabel(section, topic);
  const isBlue = sectionConfig.accent === "blue";

  const accentText = isBlue ? "text-blue-600" : "text-violet-600";
  const accentBg = isBlue ? "bg-blue-600" : "bg-violet-600";
  const accentLight = isBlue ? "bg-blue-50" : "bg-violet-50";
  const accentBorder = isBlue ? "border-blue-200" : "border-violet-200";
  const accentRing = isBlue ? "ring-blue-100" : "ring-violet-100";
  const accentBadge = isBlue
    ? "bg-blue-100 text-blue-700"
    : "bg-violet-100 text-violet-700";
  const accentExampleBorder = isBlue ? "border-l-blue-400" : "border-l-violet-400";
  const accentExampleBg = isBlue ? "bg-blue-50/60" : "bg-violet-50/60";

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-2xl">

        {/* Breadcrumb */}
        <div className="mb-8 flex flex-wrap items-center gap-2 text-sm text-gray-400">
          <Link href="/learn" className="hover:text-gray-600">Learn</Link>
          <span>/</span>
          <Link href={`/learn/${section}`} className="hover:text-gray-600">
            {sectionConfig.label}
          </Link>
          <span>/</span>
          <span className="text-gray-600">{topicLabel}</span>
        </div>

        {/* Header */}
        <div className={`mb-8 rounded-2xl border ${accentBorder} ${accentLight} p-6 ring-1 ${accentRing}`}>
          <span className={`text-xs font-bold uppercase tracking-widest ${accentText}`}>
            {sectionConfig.label}
          </span>
          <h1 className="mt-1 text-3xl font-extrabold text-gray-900">
            {topicLabel}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-gray-600">
            {lesson.intro}
          </p>
        </div>

        {/* Concepts */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">
            Key Concepts
          </h2>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${accentBadge}`}>
            {lesson.concepts.length}
          </span>
        </div>

        <div className="space-y-4">
          {lesson.concepts.map((concept, i) => (
            <div
              key={concept.title}
              className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
            >
              {/* Concept title row */}
              <div className="flex items-start gap-3">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${accentBadge}`}
                >
                  {i + 1}
                </span>
                <h3 className="pt-0.5 text-base font-bold text-gray-900">
                  {concept.title}
                </h3>
              </div>

              {/* Explanation */}
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                {concept.explanation}
              </p>

              {/* Example */}
              <div
                className={`mt-4 rounded-xl border-l-4 ${accentExampleBorder} ${accentExampleBg} px-4 py-3`}
              >
                <p className={`mb-1.5 text-xs font-bold uppercase tracking-wide ${accentText}`}>
                  Example
                </p>
                <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-gray-700">
                  {concept.example}
                </pre>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href={`/practice/${section}/${topic}`}
            className={`flex w-full items-center justify-center gap-2 rounded-xl ${accentBg} px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:opacity-90 hover:shadow-md sm:w-auto`}
          >
            Practice this topic →
          </Link>
          <Link
            href={`/learn/${section}`}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-600 transition-all hover:border-gray-300 hover:bg-gray-50 sm:w-auto"
          >
            ← Back to {sectionConfig.label}
          </Link>
        </div>

      </div>
    </main>
  );
}
