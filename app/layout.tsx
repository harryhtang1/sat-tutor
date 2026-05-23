import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "ScoreUp",
  description: "The AI-powered SAT tutor that actually explains your mistakes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider afterSignUpUrl="/onboarding" afterSignInUrl="/dashboard">
          <Navbar />
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
