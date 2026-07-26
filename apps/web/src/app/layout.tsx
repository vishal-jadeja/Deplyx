import type { Metadata } from "next";
import { jetbrainsMono, spaceGrotesk } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Deplyx",
  description: "Find deprecated AI models and packages across your repos before they break.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
