import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { accountBackend, cookieOptions, setSession, validSession } from "@/lib/account-server";
import { accountRedirect, isOAuthProvider, oauthCookie } from "@/lib/account-oauth";

const tokenPattern = /^[A-Za-z0-9_-]{43}$/;

export async function GET(request: NextRequest, context: RouteContext<"/api/account/oauth/[provider]/callback">) {
  const { provider } = await context.params;
  if (!isOAuthProvider(provider)) return new NextResponse(null, { status: 404 });
  const cookie = oauthCookie(provider);
  const [storedMode, expectedState, verifier] = request.cookies.get(cookie)?.value.split(".") ?? [];
  const mode = storedMode === "sign-up" ? "sign-up" : "sign-in";
  const state = request.nextUrl.searchParams.get("state") ?? "";
  if (!expectedState || !verifier || !tokenPattern.test(expectedState) || !tokenPattern.test(verifier) ||
    !tokenPattern.test(state) || !timingSafeEqual(Buffer.from(expectedState), Buffer.from(state))) {
    return accountRedirect(request, mode, "expired");
  }

  function finish(error?: string) {
    const response = accountRedirect(request, mode, error);
    response.cookies.set(cookie, "", { ...cookieOptions, maxAge: 0 });
    return response;
  }

  const code = request.nextUrl.searchParams.get("code");
  if (request.nextUrl.searchParams.has("error")) return finish("cancelled");
  if (!code || code.length > 2048) return finish("failed");
  try {
    const upstream = await accountBackend(`oauth/${provider}/exchange`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, verifier }),
    }, 25000);
    if (upstream.status === 409) return finish("account_exists");
    if (upstream.status === 422) return finish("email_required");
    if (upstream.status === 429) return finish("limited");
    if (!upstream.ok) return finish("failed");
    const session: unknown = await upstream.json();
    if (!validSession(session)) return finish("failed");
    const response = finish();
    setSession(response, session.token, session.expires_in);
    return response;
  } catch {
    return finish("failed");
  }
}
