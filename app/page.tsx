import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-24">
      <h1 className="text-4xl font-bold">Welcome</h1>
      <nav className="flex gap-4">
        <Link href="/onboarding" className="text-blue-600 hover:underline">
          Onboarding
        </Link>
        <Link href="/dashboard" className="text-blue-600 hover:underline">
          Dashboard
        </Link>
        <Link href="/challenge" className="text-blue-600 hover:underline">
          Challenge
        </Link>
      </nav>
    </main>
  );
}
