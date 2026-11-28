import { NextRequest, NextResponse } from "next/server";
import { appOrigin, noStore, sessionAuthorization } from "@/lib/account-server";

const uuid = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";
const readRoutes = new RegExp(
  `^(agents|projects|projects/${uuid}/(?:threads|repository)|threads/${uuid}(?:/(?:worktree|files|file|diff|checkpoints))?)$`,
);
const writeRoutes = new RegExp(
  `^(project-sources|projects|chat|projects/${uuid}/(?:threads|repository|clone|actions|action-suggestions)|threads/${uuid}/(?:task|worktree|file|checkpoints|restore))$`,
);

function error(message: string, status: number) {
  return NextResponse.json({ message }, { status, headers: noStore });
}

async function proxy(request: NextRequest, context: RouteContext<"/api/workspace/[...path]">) {
  const { path } = await context.params;
  const action = path.join("/");
  const writing = request.method === "POST";
  if (!(writing ? writeRoutes : readRoutes).test(action)) return error("Workspace action not found.", 404);
  const session = sessionAuthorization(request);
  if (!session) return error("Sign in to open a workspace.", 401);
  if (writing && request.headers.get("origin") !== appOrigin(request)) return error("Open Readcode directly to continue.", 403);

  const base = process.env.READCODE_API_URL ?? "http://127.0.0.1:8000";
  const apiPath = action === "projects" || action === "chat" ? action : `workspace/${action}`;
  const upstream = new URL(`/v1/${apiPath}`, base);
  if (!writing && action.endsWith("/file")) upstream.searchParams.set("path", request.nextUrl.searchParams.get("path") ?? "");

  try {
    let body: string | undefined;
    if (writing) {
      const reader = request.body?.getReader();
      if (!reader || !request.headers.get("content-type")?.startsWith("application/json")) return error("Send a JSON request.", 415);
      const decoder = new TextDecoder("utf-8", { fatal: true });
      body = "";
      let size = 0;
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          size += value.byteLength;
          if (size > 3_200_000) return error("This request is too large.", 413);
          body += decoder.decode(value, { stream: true });
        }
        body += decoder.decode();
      } finally {
        void reader.cancel().catch(() => {});
      }
    }
    const result = await fetch(upstream, {
      method: request.method,
      headers: { ...session, ...(writing && { "Content-Type": "application/json" }) },
      body, cache: "no-store", redirect: "error", signal: AbortSignal.timeout(105_000),
    });
    const data = await result.json();
    if (!result.ok) return error(typeof data.detail === "string" ? data.detail : "Check your workspace input and try again.", result.status);
    return NextResponse.json(data, { status: result.status, headers: noStore });
  } catch {
    return error("Could not reach the Readcode workspace API.", 503);
  }
}

export const GET = proxy;
export const POST = proxy;
