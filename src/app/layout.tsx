import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ワスレナイ — 忘却曲線で最強の暗記を",
  description: "脳科学に基づいて最適なタイミングで復習。受験生の暗記を科学する。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="scanline grid-bg">{children}</body>
    </html>
  );
}
