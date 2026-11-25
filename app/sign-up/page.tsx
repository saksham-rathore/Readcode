import type { Metadata } from "next";
import AccountScreen from "@/components/auth/AccountScreen";

export const metadata: Metadata = { title: "Sign up | Readcode" };

export default function SignUpPage() {
  return <AccountScreen mode="sign-up" />;
}
