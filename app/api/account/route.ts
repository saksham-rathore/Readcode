import { NextRequest, NextResponse } from "next/server";

const secureCookie = process.env.NODE_ENV === "production";
const sessionCookie = secureCookie ? "__Host-readcode_session" : "readcode_session";
const noStore = { "Cache-Control": "no-store" };
const cookieOptions = {
  httpOnly: true,
  secure: secureCookie,
  sameSite: "lax" as const,
  path: "/",
};

function error(message: string, status: number) {
  return NextResponse.json({ message }, { status, headers: noStore });
}

function sameOrigin(request: NextRequest) {
  const origin = process.env.READCODE_APP_ORIGIN ?? request.nextUrl.origin;
  return request.headers.get("origin") === origin;
}

function backend(path: "sign-in" | "sign-up" | "session" | "sign-out", options: RequestInit = {}) {
  const origin = process.env.READCODE_API_URL ?? "http://127.0.0.1:8000";
  return fetch(new URL(`/v1/auth/${path}`, origin), {
    ...options,
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(10000),
  });
}

async function readBody(request: NextRequest): Promise<unknown> {
  const reader = request.body?.getReader();
  if (!reader) return null;
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let size = 0;
  let text = "";
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) return JSON.parse(text + decoder.decode());
      size += value.byteLength;
      if (size > 4096) return null;
      text += decoder.decode(value, { stream: true });
    }
  } catch {
    return null;
  } finally {
    void reader.cancel().catch(() => {});
  }
}

function validCredentials(body: unknown): body is {
  mode: "sign-in" | "sign-up";
  email: string;
  password: string;
} {
  return !!body && typeof body === "object" &&
    "mode" in body && (body.mode === "sign-in" || body.mode === "sign-up") &&
    "email" in body && typeof body.email === "string" &&
    "password" in body && typeof body.password === "string";
}

function authorization(request: NextRequest) {
  const token = request.cookies.get(sessionCookie)?.value;
  return token && /^[A-Za-z0-9_-]{43}$/.test(token) ? { Authorization: `Bearer ${token}` } : undefined;
}

function signedOut(clearCookie = false) {
  const response = NextResponse.json({ account: null }, { headers: noStore });
  if (clearCookie) response.cookies.set(sessionCookie, "", { ...cookieOptions, maxAge: 0 });
  return response;
}

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return error("Open Readcode directly to continue.", 403);
  const credentials = await readBody(request);
  if (!validCredentials(credentials)) return error("Enter your email and password.", 422);
  const { mode, email, password } = credentials;

  try {
    const upstream = await backend(mode, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!upstream.ok) {
      if (upstream.status === 401) return error("The email or password is incorrect.", 401);
      if (upstream.status === 409) return error("Unable to create an account with these details.", 409);
      if (upstream.status === 422) return error(mode === "sign-up" ? "Enter a valid email and a password between 15 and 128 characters." : "Check your email and password.", 422);
      if (upstream.status === 429) return error("Too many attempts. Try again in a few minutes.", 429);
      return error("Account access is temporarily unavailable.", 503);
    }
    const { account, token, expires_in: maxAge } = await upstream.json();
    if (typeof account?.email !== "string" || typeof token !== "string" ||
      !/^[A-Za-z0-9_-]{43}$/.test(token) || !Number.isInteger(maxAge) || maxAge <= 0) {
      return error("Account access is temporarily unavailable.", 503);
    }
    const response = NextResponse.json({ account: { email: account.email } }, { headers: noStore });
    response.cookies.set(sessionCookie, token, { ...cookieOptions, maxAge });
    return response;
  } catch {
    return error("Could not reach the Readcode API. Try again in a moment.", 503);
  }
}

export async function GET(request: NextRequest) {
  const headers = authorization(request);
  if (!headers) return signedOut();
  try {
    const upstream = await backend("session", { headers });
    if (upstream.status === 401) return signedOut();
    if (!upstream.ok) return error("Could not check your session.", 503);
    const account = await upstream.json();
    if (typeof account?.email !== "string") return error("Could not check your session.", 503);
    return NextResponse.json({ account: { email: account.email } }, { headers: noStore });
  } catch {
    return error("Could not check your session.", 503);
  }
}

export async function DELETE(request: NextRequest) {
  if (!sameOrigin(request)) return error("Open Readcode directly to continue.", 403);
  const headers = authorization(request);
  if (!headers) return signedOut(true);
  try {
    const upstream = await backend("sign-out", { method: "POST", headers });
    if (upstream.ok || upstream.status === 401) return signedOut(true);
  } catch {
    return error("Could not sign out. Please try again.", 503);
  }
  return error("Could not sign out. Please try again.", 503);
}
