import Link from "next/link";

const SECTIONS = [
  {
    href: "/practice/math",
    emoji: "📐",
    label: "Math",
    description: "Algebra, Advanced Math, Data Analysis, Geometry",
    accent: "bg-blue-600",
    ring: "ring-blue-100",
    hover: "hover:border-blue-200",
    badge: "bg-blue-50 text-blue-600",
  },
  {
    href: "/practice/reading-writing",
    emoji: "📖",
    label: "Reading & Writing",
    description: "Information & Ideas, Craft & Structure, Conventions",
    accent: "bg-violet-600",
    ring: "ring-violet-100",
    hover: "hover:border-violet-200",
    badge: "bg-violet-50 text-violet-600",
  },
];

export default function PracticePage() {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">
            ← Home
          </Link>
          <h1 className="mt-3 text-3xl font-bold text-gray-900">Practice</h1>
          <p className="mt-1 text-sm text-gray-500">
            Drill any topic at your own pace.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {SECTIONS.map(({ href, emoji, label, description, accent, ring, hover, badge }) => (
            <Link
              key={href}
              href={href}
              className={`group flex flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm ring-1 ${ring} transition-all hover:-translate-y-0.5 hover:shadow-md ${hover}`}
            >
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${accent} text-2xl shadow-sm`}
              >
                {emoji}
              </span>
              <h2 className="mt-4 text-lg font-bold text-gray-900">{label}</h2>
              <p className="mt-1 text-sm text-gray-500">{description}</p>
              <span
                className={`mt-4 self-start rounded-full px-3 py-0.5 text-xs font-semibold ${badge}`}
              >
                4 topics
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
