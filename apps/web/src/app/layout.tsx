import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Deplyx",
  description: "Find deprecated AI models and packages across your repos before they break.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900 antialiased">{children}</body>
    </html>
  );
}
