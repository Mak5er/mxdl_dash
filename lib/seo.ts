export const siteName = "MaxLoad";
export const botHandle = "MaxLoadBot";
export const supportHandle = "mak5er";
export const botUrl = `https://t.me/${botHandle}`;
export const supportUrl = `https://t.me/${supportHandle}`;
export const githubRepositoryUrl = "https://github.com/Mak5er/Downloader-Bot";
export const githubIssuesUrl = `${githubRepositoryUrl}/issues`;

export const supportedPlatforms = [
  "TikTok",
  "Instagram",
  "YouTube",
  "SoundCloud",
  "Pinterest",
  "X",
] as const;

export const defaultTitle = "MaxLoad - Download videos and audio in Telegram";
export const defaultDescription =
  "Paste a TikTok, Instagram, YouTube, SoundCloud, Pinterest, or X link into MaxLoad. The bot sends the file back in Telegram.";
export const plainDescription =
  "MaxLoad is a Telegram bot that downloads videos, audio, and posts from supported links you send. It works in private chats, group chats, and inline mode.";

export const seoKeywords = [
  "MaxLoad",
  "MaxLoad bot",
  "MaxLoad Telegram bot",
  "Telegram downloader bot",
  "TikTok downloader Telegram",
  "Instagram downloader Telegram",
  "YouTube downloader Telegram",
  "SoundCloud downloader Telegram",
  "Pinterest downloader Telegram",
  "X Twitter downloader Telegram",
  "download videos in Telegram",
  "download audio in Telegram",
  "social media downloader",
  "Telegram media downloader",
];

export function getPublicBaseUrl() {
  const value = [
    process.env.DASHBOARD_PUBLIC_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_URL,
  ].find((candidate) => candidate?.trim())?.trim();

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

export function getAbsoluteUrl(path = "/") {
  const baseUrl = getPublicBaseUrl();
  if (!baseUrl) {
    return undefined;
  }

  return new URL(path, baseUrl).toString();
}

export function jsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
