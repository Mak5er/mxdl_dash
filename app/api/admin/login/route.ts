import { NextResponse } from "next/server";
import { setAdminSessionCookie, verifyAdminToken } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validators";

const noStoreHeaders = { "cache-control": "no-store" };

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limit = checkRateLimit(`admin-login:${ip}`, {
    windowSeconds: 60,
    maxRequests: 8,
  });

  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      {
        status: 429,
        headers: { ...noStoreHeaders, "retry-after": String(limit.retryAfter) },
      },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid login payload." },
      { status: 400, headers: noStoreHeaders },
    );
  }

  let verified = false;
  try {
    verified = verifyAdminToken(parsed.data.token);
  } catch (error) {
    console.error("Admin login failed before verification", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      { error: "Admin auth is not configured." },
      { status: 500, headers: noStoreHeaders },
    );
  }

  if (!verified) {
    return NextResponse.json(
      { error: "Invalid admin token." },
      { status: 401, headers: noStoreHeaders },
    );
  }

  const response = NextResponse.json({ ok: true }, { headers: noStoreHeaders });
  setAdminSessionCookie(response);
  return response;
}
