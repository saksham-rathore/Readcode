"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowUpIcon, ChatCircleIcon, FolderSimpleIcon, PlusIcon, SignOutIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { SmileyLogo } from "@/components/ui";
import { workspaceRequest, type Agent, type History, type Project, type TaskStatus, type Thread } from "./api";
import RepositoryPanel from "./RepositoryPanel";
import "./workspace.css";

function MessageContent({ content }: { content: string }) {
  return <div>{content.split(/```[^\n]*\n([\s\S]*?)```/g).map((part, index) => (
    index % 2 ? <pre className="workspace-code" key={index}><code>{part.trimEnd()}</code></pre> : <span key={index}>{part}</span>
  ))}</div>;
}

export default function Workspace() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [projectId, setProjectId] = useState("");
  const [threads, setThreads] = useState<Thread[]>([]);
  const [threadId, setThreadId] = useState("");
  const [histories, setHistories] = useState<Record<string, History>>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [pending, setPending] = useState<Record<string, boolean>>({});
  const [chatErrors, setChatErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [creatingProject, setCreatingProject] = useState(false);
  const [creatingThread, setCreatingThread] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [savingTask, setSavingTask] = useState(false);
  const messages = useRef<HTMLDivElement>(null);

  const project = projects.find(item => item.id === projectId);
  const thread = threads.find(item => item.id === threadId);
  const history = histories[threadId];
  const prompt = drafts[threadId] ?? "";
  const activeRuns = Object.values(pending).filter(Boolean).length;

  useEffect(() => {
    if (messages.current) messages.current.scrollTop = messages.current.scrollHeight;
  }, [history, threadId]);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      workspaceRequest<Project[]>("projects", undefined, controller.signal),
      workspaceRequest<Agent[]>("agents", undefined, controller.signal),
    ])
      .then(([items, available]) => {
        setProjects(items);
        setAgents(available);
        setProjectId(items[0]?.id ?? "");
      })
      .catch((error: Error) => { if (!controller.signal.aborted) setNotice(error.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!projectId) return;
    const controller = new AbortController();
    workspaceRequest<Thread[]>(`projects/${projectId}/threads`, undefined, controller.signal)
      .then(items => {
        if (controller.signal.aborted) return;
        setThreads(current => [...current.filter(item => !items.some(loaded => loaded.id === item.id)), ...items]);
        setThreadId(current => current || items[0]?.id || "");
      })
      .catch((error: Error) => { if (!controller.signal.aborted) setNotice(error.message); });
    return () => controller.abort();
  }, [projectId]);

  useEffect(() => {
    if (!threadId) return;
    const controller = new AbortController();
    workspaceRequest<History>(`threads/${threadId}`, undefined, controller.signal)
      .then(result => setHistories(current => ({ ...current, [threadId]: result })))
      .catch((error: Error) => {
        if (!controller.signal.aborted) setChatErrors(current => ({ ...current, [threadId]: error.message }));
      });
    return () => controller.abort();
  }, [threadId]);

  async function addProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name")).trim();
    if (!name || creatingProject) return;
    setCreatingProject(true);
    setNotice("");
    try {
      const created = await workspaceRequest<Project>("projects", { name, repository_url: String(data.get("repo")).trim() || null });
      setProjects(items => [created, ...items]);
      setThreadId("");
      setProjectId(created.id);
      setAdding(false);
    } catch (error) {
      setNotice((error as Error).message);
    } finally {
      setCreatingProject(false);
    }
  }

  async function addThread(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const title = String(new FormData(form).get("title")).trim();
    if (!title || !projectId || creatingThread) return;
    setCreatingThread(true);
    setNotice("");
    try {
      const created = await workspaceRequest<Thread>(`projects/${projectId}/threads`, { title });
      setThreads(items => [created, ...items.filter(item => item.id !== created.id)]);
      setHistories(items => ({ ...items, [created.id]: { ...created, messages: [] } }));
      setThreadId(created.id);
      form.reset();
    } catch (error) {
      setNotice((error as Error).message);
    } finally {
      setCreatingThread(false);
    }
  }

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = prompt.trim();
    if (!history || !text || pending[threadId] || savingTask) return;
    const id = threadId;
    setPending(items => ({ ...items, [id]: true }));
    setChatErrors(items => ({ ...items, [id]: "" }));
    try {
      await workspaceRequest("chat", { conversation_id: id, prompt: text });
      const result = await workspaceRequest<History>(`threads/${id}`);
      setHistories(items => ({ ...items, [id]: result }));
      setDrafts(items => ({ ...items, [id]: "" }));
    } catch (error) {
      setChatErrors(items => ({ ...items, [id]: (error as Error).message }));
    } finally {
      setPending(items => ({ ...items, [id]: false }));
    }
  }

  async function updateTask(agentId: string, status: TaskStatus) {
    if (!thread || savingTask || pending[threadId]) return;
    setSavingTask(true);
    setNotice("");
    try {
      const updated = await workspaceRequest<Thread>(`threads/${thread.id}/task`, { agent_id: agentId, task_status: status });
      setThreads(items => items.map(item => item.id === updated.id ? updated : item));
    } catch (error) {
      setNotice((error as Error).message);
    } finally {
      setSavingTask(false);
    }
  }

  async function signOut() {
    setLoggingOut(true);
    try {
      const response = await fetch("/api/account", { method: "DELETE" });
      if (!response.ok) throw new Error("Could not sign out. Try again.");
      window.location.replace("/sign-in");
    } catch (error) {
      setNotice((error as Error).message);
      setLoggingOut(false);
    }
  }

  return (
    <main className="workspace-shell">
      <header className="workspace-bar">
        <Link className="workspace-brand" href="/"><SmileyLogo width={26} height={26} /> readcode</Link>
        {activeRuns > 0 && <span role="status" className="workspace-running">{activeRuns} {activeRuns === 1 ? "reply" : "replies"} in progress</span>}
        <button className="workspace-quiet workspace-logout" onClick={signOut} disabled={loggingOut}><SignOutIcon size={17} aria-hidden="true" /> Sign out</button>
      </header>
      {notice && <p className="workspace-alert" role="alert">{notice}</p>}
      <div className="workspace-layout">
        <aside className="workspace-nav" aria-label="Projects and threads">
          <div className="workspace-section-heading"><h2>Projects</h2><button className="workspace-icon" onClick={() => setAdding(value => !value)} aria-label="Add project" aria-expanded={adding}><PlusIcon size={18} aria-hidden="true" /></button></div>
          {(adding || (!loading && !projects.length)) && (
            <form className="workspace-stack workspace-project-form" onSubmit={addProject}>
              <label>Project name<input name="name" maxLength={120} required placeholder="My project" /></label>
              <label>GitHub URL (optional)<input name="repo" type="url" placeholder="https://github.com/owner/repo" /></label>
              <button className="workspace-action" disabled={creatingProject}>Add project</button>
            </form>
          )}
          {loading && <p className="workspace-muted">Loading projects…</p>}
          <ul className="workspace-list">
            {projects.map(item => <li key={item.id}>
              <button aria-current={item.id === projectId ? "true" : undefined} onClick={() => {
                if (item.id === projectId || creatingThread) return;
                setThreadId(""); setProjectId(item.id); setNotice("");
              }}><FolderSimpleIcon size={17} aria-hidden="true" /> <span>{item.name}</span></button>
            </li>)}
          </ul>
          {project && <>
            <div className="workspace-section-heading workspace-thread-heading"><h2>Threads</h2></div>
            <form className="workspace-inline" onSubmit={addThread}>
              <input aria-label="New thread title" name="title" placeholder="New thread title" maxLength={180} required />
              <button className="workspace-icon" aria-label="Create thread" disabled={creatingThread}><PlusIcon size={17} aria-hidden="true" /></button>
            </form>
            <ul className="workspace-list">
              {threads.filter(item => item.project_id === projectId).map(item => <li key={item.id}>
                <button aria-current={item.id === threadId ? "true" : undefined} onClick={() => setThreadId(item.id)}><ChatCircleIcon size={17} aria-hidden="true" /> <span>{item.title}</span>{pending[item.id] && <span className="workspace-dot" aria-label="Reply in progress" />}</button>
              </li>)}
            </ul>
          </>}
        </aside>

        <section className="workspace-chat" aria-label="Coding chat">
          <header className="workspace-chat-header">
            <span>{project?.name ?? "Workspace"}</span><h1>{thread?.title ?? "Coding chat"}</h1>
            {thread && <div className="workspace-task-controls">
              <label>Assistant<select value={thread.agent_id} disabled={savingTask || pending[threadId]} onChange={event => void updateTask(event.target.value, thread.task_status)}>
                {!agents.some(agent => agent.id === thread.agent_id) && <option value={thread.agent_id}>Unavailable assistant</option>}
                {agents.map(agent => <option key={agent.id} value={agent.id}>{agent.label} · {agent.model}</option>)}
              </select></label>
              <label>Task status<select value={thread.task_status} disabled={savingTask || pending[threadId]} onChange={event => void updateTask(thread.agent_id, event.target.value as TaskStatus)}>
                <option value="open">Open</option><option value="in_progress">In progress</option><option value="done">Done</option>
              </select></label>
            </div>}
          </header>
          <div className="workspace-messages" aria-live="polite" ref={messages}>
            {!project && !loading && <p className="workspace-empty">Add a project to start a coding conversation.</p>}
            {project && !thread && <p className="workspace-empty">Create a thread for your first task.</p>}
            {thread && !history && !chatErrors[threadId] && <p className="workspace-empty">Loading the thread…</p>}
            {history?.messages.length === 0 && <p className="workspace-empty">Ask about a change, sketch an implementation, or paste code you want to review.</p>}
            {history?.messages.map(message => <article key={message.id} className="workspace-message" data-role={message.role}>
              <h2>{message.role === "user" ? "You" : "Readcode"}</h2><MessageContent content={message.content} />
            </article>)}
            {pending[threadId] && <p className="workspace-muted">Waiting for the assistant…</p>}
          </div>
          {thread && <form className="workspace-composer" onSubmit={send}>
            {chatErrors[threadId] && <p className="workspace-alert" role="alert">{chatErrors[threadId]}</p>}
            <label htmlFor="workspace-prompt">Message</label>
            <textarea id="workspace-prompt" value={prompt} maxLength={12000} rows={3} placeholder="Ask Readcode…" disabled={!history || pending[threadId]} onChange={event => setDrafts(items => ({ ...items, [threadId]: event.target.value }))} />
            <button className="workspace-action" disabled={!history || !prompt.trim() || pending[threadId] || savingTask}>Send <ArrowUpIcon size={16} aria-hidden="true" /></button>
          </form>}
        </section>

        {project && thread && <RepositoryPanel key={thread.id} project={project} threadId={thread.id} onAttach={({ path, content }) => {
          const snippet = `File: ${path}\n\n${content}`;
          const next = prompt ? `${prompt}\n\n${snippet}` : snippet;
          if (next.length > 12000 || pending[threadId]) {
            setChatErrors(items => ({ ...items, [threadId]: "Wait for the active reply or shorten the draft before adding the file." }));
            return;
          }
          setDrafts(items => ({ ...items, [threadId]: next }));
        }} />}
      </div>
    </main>
  );
}
