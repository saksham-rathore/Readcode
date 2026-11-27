import type { NextRequest, NextResponse } from "next/server";

export const secureCookie = process.env.NODE_ENV === "production";
export const sessionCookie = secureCookie ? "__Host-readcode_session" : "readcode_session";
export const noStore = { "Cache-Control": "no-store" };
export const cookieOptions = { httpOnly: true, secure: secureCookie, sameSite: "lax" as const, path: "/" };

export function appOrigin(request: NextRequest) {
  return process.env.READCODE_APP_ORIGIN ?? request.nextUrl.origin;
}

export function accountBackend(path: string, options: RequestInit = {}, timeout = 10000) {
  const origin = process.env.READCODE_API_URL ?? "http://127.0.0.1:8000";
  return fetch(new URL(`/v1/auth/${path}`, origin), {
    ...options, cache: "no-store", redirect: "error", signal: AbortSignal.timeout(timeout),
  });
}

export function validSession(value: unknown): value is { account: { email: string }; token: string; expires_in: number } {
  if (!value || typeof value !== "object") return false;
  const { account, token, expires_in } = value as Record<string, unknown>;
  return !!account && typeof account === "object" && "email" in account && typeof account.email === "string" &&
    typeof token === "string" && /^[A-Za-z0-9_-]{43}$/.test(token) &&
    typeof expires_in === "number" && Number.isInteger(expires_in) && expires_in > 0;
}

export function setSession(response: NextResponse, token: string, maxAge: number) {
  response.cookies.set(sessionCookie, token, { ...cookieOptions, maxAge });
}
