import "server-only";

import crypto from "node:crypto";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { constantTimeCompare, createHmacSignature } from "@/lib/security";

const SESSION_COOKIE = "downloader_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 12;

type SessionPayload = {
  exp: number;
  iat: number;
  nonce: string;
};

function getAdminToken() {
  const token = process.env.ADMIN_TOKEN;

  if (!token) {
    throw new Error("ADMIN_TOKEN is not configured.");
  }

  return token;
}

function encodePayload(payload: SessionPayload) {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function decodePayload(value: string) {
  const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
  if (
    typeof parsed.exp !== "number" ||
    typeof parsed.iat !== "number" ||
    typeof parsed.nonce !== "string"
  ) {
    return null;
  }

  return parsed as SessionPayload;
}

export function verifyAdminToken(token: string) {
  return constantTimeCompare(token, getAdminToken());
}

export function createSessionValue(now = Date.now()) {
  const payload = encodePayload({
    exp: now + SESSION_TTL_SECONDS * 1000,
    iat: now,
    nonce: crypto.randomUUID(),
  });
  const signature = createHmacSignature(payload, getAdminToken());
  return `${payload}.${signature}`;
}

export function verifySessionValue(value: string | undefined) {
  if (!value) {
    return false;
  }

  const [payload, signature, extra] = value.split(".");
  if (!payload || !signature || extra) {
    return false;
  }

  const expected = createHmacSignature(payload, getAdminToken());
  if (!constantTimeCompare(signature, expected)) {
    return false;
  }

  try {
    const decoded = decodePayload(payload);
    return Boolean(decoded && decoded.exp > Date.now());
  } catch {
    return false;
  }
}

export async function hasAdminSession() {
  const cookieStore = await cookies();
  return verifySessionValue(cookieStore.get(SESSION_COOKIE)?.value);
}

export function hasAdminSessionFromRequest(request: Request) {
  const cookie = request.headers
    .get("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE}=`));

  return verifySessionValue(cookie?.slice(SESSION_COOKIE.length + 1));
}

export function setAdminSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE, createSessionValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export function clearAdminSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
}
