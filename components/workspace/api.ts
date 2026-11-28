export type Project = { id: string; name: string; repository_url: string | null };
export type TaskStatus = "open" | "in_progress" | "done";
export type Agent = { id: string; label: string; model: string; available: boolean };
export type Thread = { id: string; project_id: string; title: string; agent_id: string; task_status: TaskStatus };
export type Message = { id: string; role: string; content: string };
export type History = Thread & { messages: Message[] };

export async function workspaceRequest<T>(path: string, data?: object, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`/api/workspace/${path}`, {
    ...(data && { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }),
    signal,
  });
  if (response.status === 401) {
    window.location.replace("/sign-in");
    throw new Error("Sign in to continue.");
  }
  const result = await response.json();
  if (!response.ok) throw new Error(result.message ?? "Could not complete this request.");
  return result as T;
}
