import { NextResponse } from "next/server";
import {
  botUrl,
  defaultDescription,
  getAbsoluteUrl,
  githubRepositoryUrl,
  siteName,
  supportUrl,
  supportedPlatforms,
} from "@/lib/seo";

export const dynamic = "force-static";

export function GET() {
  const siteUrl = getAbsoluteUrl("/") ?? "Set DASHBOARD_PUBLIC_URL to publish the canonical dashboard URL.";
  const body = `# ${siteName}

> ${defaultDescription}

${siteName} is a Telegram bot for downloading videos, audio, and posts from supported links. It can be used in a private Telegram chat, inside a group, or through inline mode.

## Main Links

- Website: ${siteUrl}
- Telegram bot: ${botUrl}
- Support: ${supportUrl}
- GitHub: ${githubRepositoryUrl}

## Supported Links

${supportedPlatforms.map((platform) => `- ${platform}`).join("\n")}

## Good Questions This Site Answers

- What is MaxLoad?
- How do I download a video in Telegram?
- Can I use MaxLoad in a group chat?
- Which links can I send to MaxLoad?
- Does the public dashboard show private download history?
`;

  return new NextResponse(body, {
    headers: {
      "Cache-Control": "public, max-age=3600",
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
