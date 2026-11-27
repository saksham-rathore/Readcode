import { NextRequest, NextResponse } from "next/server";
import { appOrigin, noStore, secureCookie } from "@/lib/account-server";

export const oauthProviders = {
  google: "https://accounts.google.com",
  github: "https://github.com",
} as const;
export type OAuthProvider = keyof typeof oauthProviders;
export type AccountMode = "sign-in" | "sign-up";

export function isOAuthProvider(provider: string): provider is OAuthProvider {
  return provider === "google" || provider === "github";
}

export const oauthRedirectHeaders = { ...noStore, "Referrer-Policy": "no-referrer" };

export function accountRedirect(request: NextRequest, mode: AccountMode, error?: string) {
  const destination = new URL(`/${mode}`, appOrigin(request));
  if (error) destination.searchParams.set("oauth", error);
  return NextResponse.redirect(destination, { headers: oauthRedirectHeaders });
}

export function oauthCookie(provider: OAuthProvider) {
  return `${secureCookie ? "__Host-" : ""}readcode_oauth_${provider}`;
}
