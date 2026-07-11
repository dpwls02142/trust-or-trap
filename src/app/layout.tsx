import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trust or Trap",
  description: "몰입형 피싱·스캠 예방 시뮬레이션",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
