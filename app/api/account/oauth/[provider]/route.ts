import { createHash, randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { accountBackend, cookieOptions } from "@/lib/account-server";
import { accountRedirect, isOAuthProvider, oauthCookie, oauthProviders, oauthRedirectHeaders } from "@/lib/account-oauth";

export async function GET(request: NextRequest, context: RouteContext<"/api/account/oauth/[provider]">) {
  const { provider } = await context.params;
  if (!isOAuthProvider(provider)) return new NextResponse(null, { status: 404 });
  const mode = request.nextUrl.searchParams.get("mode") === "sign-up" ? "sign-up" : "sign-in";
  const state = randomBytes(32).toString("base64url");
  const verifier = randomBytes(32).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  try {
    const query = new URLSearchParams({ state, challenge });
    const upstream = await accountBackend(`oauth/${provider}/authorize?${query}`);
    if (!upstream.ok) return accountRedirect(request, mode, "unavailable");
    const { url } = await upstream.json();
    const destination = new URL(url);
    if (destination.origin !== oauthProviders[provider]) return accountRedirect(request, mode, "failed");
    const response = NextResponse.redirect(destination, { headers: oauthRedirectHeaders });
    response.cookies.set(oauthCookie(provider), `${mode}.${state}.${verifier}`, { ...cookieOptions, maxAge: 600 });
    return response;
  } catch {
    return accountRedirect(request, mode, "unavailable");
  }
}
