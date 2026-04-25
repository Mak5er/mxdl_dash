import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

function getMetadataBase() {
  const value = process.env.DASHBOARD_PUBLIC_URL?.trim();
  if (!value) {
    return undefined;
  }

  const normalizedValue = /^https?:\/\//i.test(value) ? value : `https://${value}`;

  try {
    return new URL(normalizedValue);
  } catch {
    return undefined;
  }
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  applicationName: "MaxLoad",
  title: {
    default: "MaxLoad",
    template: "%s | MaxLoad",
  },
  description:
    "Telegram media downloads with a quiet live dashboard for service activity, file types, and delivery health.",
  keywords: [
    "MaxLoad",
    "Telegram bot",
    "Telegram downloader",
    "media downloads",
    "download dashboard",
  ],
  authors: [{ name: "Mak5er" }],
  creator: "Mak5er",
  publisher: "Mak5er",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    siteName: "MaxLoad",
    title: "MaxLoad",
    description:
      "A fast Telegram download flow with live public service stats.",
    images: [
      {
        url: "/maxload-hero.svg",
        width: 1200,
        height: 630,
        alt: "MaxLoad Telegram download dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MaxLoad",
    description:
      "A fast Telegram download flow with live public service stats.",
    images: ["/maxload-hero.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
