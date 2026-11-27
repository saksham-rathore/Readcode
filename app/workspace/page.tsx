import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sessionCookie } from "@/lib/account-server";
import Workspace from "@/components/workspace/Workspace";

export const metadata: Metadata = { title: "Workspace | Readcode" };
export const instant = false;

export default async function WorkspacePage() {
  const session = (await cookies()).get(sessionCookie)?.value;
  if (!session || !/^[A-Za-z0-9_-]{43}$/.test(session)) redirect("/sign-in");
  return <Workspace />;
}
