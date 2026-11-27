import { NextRequest, NextResponse } from "next/server";
import { accountBackend as backend, appOrigin, noStore, sessionAuthorization, setSession, validSession } from "@/lib/account-server";

function error(message: string, status: number) {
  return NextResponse.json({ message }, { status, headers: noStore });
}

function sameOrigin(request: NextRequest) {
  return request.headers.get("origin") === appOrigin(request);
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

function signedOut(clearCookie = false) {
  const response = NextResponse.json({ account: null }, { headers: noStore });
  if (clearCookie) setSession(response, "", 0);
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
    const session: unknown = await upstream.json();
    if (!validSession(session)) return error("Account access is temporarily unavailable.", 503);
    const { account, token, expires_in: maxAge } = session;
    const response = NextResponse.json({ account: { email: account.email } }, { headers: noStore });
    setSession(response, token, maxAge);
    return response;
  } catch {
    return error("Could not reach the Readcode API. Try again in a moment.", 503);
  }
}

export async function GET(request: NextRequest) {
  const headers = sessionAuthorization(request);
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
  const headers = sessionAuthorization(request);
  if (!headers) return signedOut(true);
  try {
    const upstream = await backend("sign-out", { method: "POST", headers });
    if (upstream.ok || upstream.status === 401) return signedOut(true);
  } catch {
    return error("Could not sign out. Please try again.", 503);
  }
  return error("Could not sign out. Please try again.", 503);
}
