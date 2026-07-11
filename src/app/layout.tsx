import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trust or Trap",
  description:
    "실제 스마트폰 환경을 재현한 몰입형 피싱/디지털 스캠 예방 시뮬레이션",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0a0a0f",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body className="min-h-dvh bg-[#0a0a0f] text-white">{children}</body>
    </html>
  );
}
