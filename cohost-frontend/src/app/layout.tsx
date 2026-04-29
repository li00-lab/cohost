import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cohost — AI Travel Planner",
  description: "Plan your perfect trip with AI, powered by Google ADK",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
