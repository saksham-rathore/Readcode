import type { Metadata } from "next";
import AccountScreen from "@/components/auth/AccountScreen";

export const metadata: Metadata = { title: "Sign in | Readcode" };

export default function SignInPage() {
  return <AccountScreen mode="sign-in" />;
}
