// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LexAI | Enterprise Contract Auditor",
  description: "AI-powered compliance automation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className="min-h-screen flex flex-col font-sans">
        {/* The 'flex flex-col' ensures content flows correctly under the nav if you add one here globally, 
            or just handles full height pages better */}
        {children}
      </body>
    </html>
  );
}