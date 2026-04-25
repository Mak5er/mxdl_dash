import { NextResponse } from "next/server";
import { hasAdminSessionFromRequest } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { sendTelegramMessage } from "@/lib/telegram";
import { sendMessageSchema } from "@/lib/validators";

const noStoreHeaders = { "cache-control": "no-store" };

export async function POST(request: Request) {
  if (!hasAdminSessionFromRequest(request)) {
    return NextResponse.json(
      { error: "Unauthorized." },
      { status: 401, headers: noStoreHeaders },
    );
  }

  const ip = getClientIp(request);
  const limit = checkRateLimit(`telegram-send:${ip}`, {
    windowSeconds: 60,
    maxRequests: 10,
  });

  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Message rate limit exceeded." },
      {
        status: 429,
        headers: { ...noStoreHeaders, "retry-after": String(limit.retryAfter) },
      },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = sendMessageSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid message payload." },
      { status: 400, headers: noStoreHeaders },
    );
  }

  const result = await sendTelegramMessage(parsed.data.userId, parsed.data.message);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error ?? "Message failed." },
      { status: 502, headers: noStoreHeaders },
    );
  }

  console.info("Telegram admin message sent", {
    userId: parsed.data.userId,
    length: parsed.data.message.length,
  });

  return NextResponse.json({ ok: true }, { headers: noStoreHeaders });
}
