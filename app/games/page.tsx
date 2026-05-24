import Link from "next/link";

const GAMES = [
  {
    href: "/games/connections",
    icon: "🔗",
    title: "WordLinks",
    description: "Find four groups of four related words",
    cardClass: "border-purple-100 bg-purple-50 hover:border-purple-300",
    iconClass: "bg-purple-100",
    titleClass: "group-hover:text-purple-700",
  },
  {
    href: "/games/wordle",
    icon: "🔤",
    title: "SAT Wordle",
    description: "Guess the SAT vocabulary word in 6 tries",
    cardClass: "border-green-100 bg-green-50 hover:border-green-300",
    iconClass: "bg-green-100",
    titleClass: "group-hover:text-green-700",
  },
];

export default function GamesPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Games</h1>
          <p className="mt-1 text-sm text-gray-500">
            Practice your SAT skills with daily word games.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {GAMES.map(({ href, icon, title, description, cardClass, iconClass, titleClass }) => (
            <Link
              key={href}
              href={href}
              className={`group flex gap-4 rounded-2xl border p-5 transition-all hover:-translate-y-0.5 hover:shadow-md ${cardClass}`}
            >
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl ${iconClass}`}
              >
                {icon}
              </div>
              <div className="min-w-0">
                <h2 className={`text-base font-bold text-gray-900 transition-colors ${titleClass}`}>
                  {title}
                </h2>
                <p className="mt-0.5 text-sm text-gray-500">{description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
