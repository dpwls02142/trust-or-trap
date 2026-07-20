import type { Metadata, Viewport } from "next";
import {
  siteDescription,
  siteOgSubtitle,
  siteTagline,
  siteTitle,
  siteUrl,
} from "@/lib/brand/site-brand";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: siteTitle,
    template: `%s | ${siteTitle}`,
  },
  description: siteDescription,
  applicationName: siteTitle,
  keywords: [
    "피싱",
    "디지털 스캠",
    "보이스피싱",
    "사기 예방",
    "시뮬레이션",
    "Trust or Trap",
  ],
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    siteName: siteTitle,
    locale: "ko_KR",
    type: "website",
    images: [
      {
        url: "/opengraph.png",
        width: 1200,
        height: 630,
        alt: `${siteTitle} — ${siteOgSubtitle}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteTagline,
    images: ["/opengraph.png"],
  },
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
