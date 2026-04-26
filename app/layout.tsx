import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import {
  defaultDescription,
  defaultTitle,
  getPublicBaseUrl,
  seoKeywords,
  siteName,
} from "@/lib/seo";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: getPublicBaseUrl(),
  applicationName: siteName,
  title: {
    default: defaultTitle,
    template: `%s | ${siteName}`,
  },
  description: defaultDescription,
  keywords: seoKeywords,
  authors: [{ name: "Mak5er", url: "https://github.com/Mak5er" }],
  creator: "Mak5er",
  publisher: "Mak5er",
  category: "utility",
  classification: "Telegram bot, media downloader, public dashboard",
  referrer: "strict-origin-when-cross-origin",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
  manifest: "/manifest.webmanifest",
  formatDetection: {
    address: false,
    email: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName,
    title: defaultTitle,
    description: defaultDescription,
    url: "/",
    locale: "en_US",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "MaxLoad Telegram downloader bot",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: ["/opengraph-image"],
  },
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
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
