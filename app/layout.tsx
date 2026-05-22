import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "First Website",
  description: "Next.js 14 app with Supabase",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
