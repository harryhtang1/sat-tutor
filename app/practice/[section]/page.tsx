import Link from "next/link";
import { notFound } from "next/navigation";
import { getSectionConfig } from "@/lib/practice";
import { getQuestions } from "@/lib/questions";

const TOPIC_ICONS: Record<string, string> = {
  "algebra": "ƒ",
  "advanced-math": "∑",
  "problem-solving-data": "📊",
  "geometry-trigonometry": "△",
  "information-ideas": "💡",
  "craft-structure": "✍️",
  "expression-ideas": "🗣️",
  "standard-english-conventions": "📝",
};

export default function SectionPage({
  params,
}: {
  params: { section: string };
}) {
  const config = getSectionConfig(params.section);
  if (!config) notFound();

  const allQuestions = getQuestions();
  const isBlue = config.accent === "blue";

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-2xl">
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center gap-2 text-sm text-gray-400">
          <Link href="/practice" className="hover:text-gray-600">
            Practice
          </Link>
          <span>/</span>
          <span className="text-gray-600">{config.label}</span>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {config.emoji} {config.label}
          </h1>
          <p className="mt-1 text-sm text-gray-500">Choose a topic to drill.</p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {config.topics.map(({ label, slug }) => {
            const count = allQuestions.filter((q) => q.slug === slug).length;
            const icon = TOPIC_ICONS[slug] ?? "•";

            return (
              <Link
                key={slug}
                href={`/practice/${params.section}/${slug}`}
                className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg font-bold ${
                    isBlue
                      ? "bg-blue-50 text-blue-600 group-hover:bg-blue-100"
                      : "bg-violet-50 text-violet-600 group-hover:bg-violet-100"
                  } transition-colors`}
                >
                  {icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900">{label}</p>
                  <p className="text-xs text-gray-400">
                    {count > 0 ? `${count} question${count !== 1 ? "s" : ""}` : "Coming soon"}
                  </p>
                </div>
                <svg
                  className="h-4 w-4 shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
