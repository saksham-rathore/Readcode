"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowUpIcon, CaretDownIcon, FolderSimpleIcon, GitBranchIcon, MagnifyingGlassIcon, NotePencilIcon, PaperclipIcon, SidebarSimpleIcon, SignOutIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { SmileyLogo } from "@/components/ui";
import { workspaceRequest, type Agent, type History, type Project, type TaskStatus, type Thread } from "./api";
import RepositoryPanel from "./RepositoryPanel";
import ModelPicker from "./ModelPicker";
import ProjectSourcePicker from "./ProjectSourcePicker";
import "./workspace.css";

function MessageContent({ content }: { content: string }) {
  return <div>{content.split(/```[^\n]*\n([\s\S]*?)```/g).map((part, index) => (
    index % 2 ? <pre className="workspace-code" key={index}><code>{part.trimEnd()}</code></pre> : <span key={index}>{part}</span>
  ))}</div>;
}

export default function Workspace() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [agents, setAgents] = useState<Agent[] | null>(null);
  const [modelError, setModelError] = useState("");
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
  const [creatingThread, setCreatingThread] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [savingTask, setSavingTask] = useState(false);
  const [draftAgent, setDraftAgent] = useState("default");
  const [search, setSearch] = useState("");
  const [showNav, setShowNav] = useState(false);
  const [repoPreference, setRepoPreference] = useState<boolean>();
  const messages = useRef<HTMLDivElement>(null);
  const shell = useRef<HTMLElement>(null);
  const createdThreadId = useRef("");

  const project = projects.find(item => item.id === projectId);
  const thread = threads.find(item => item.id === threadId);
  const showRepo = repoPreference ?? !thread;
  const history = histories[threadId];
  const draftId = threadId || `new:${projectId}`;
  const prompt = drafts[draftId] ?? "";
  const agentId = thread?.agent_id ?? draftAgent;
  const modelAvailable = agents?.some(agent => agent.id === agentId && agent.available);
  const visibleThreads = threads.filter(item =>
    item.project_id === projectId && item.title.toLowerCase().includes(search.trim().toLowerCase()),
  );
  const workingThreads = visibleThreads.filter(item => pending[item.id] || item.task_status === "in_progress");
  const openThreads = visibleThreads.filter(item => !pending[item.id] && item.task_status === "open");
  const settledThreads = visibleThreads.filter(item => !pending[item.id] && item.task_status === "done");

  useEffect(() => {
    if (messages.current) messages.current.scrollTop = messages.current.scrollHeight;
  }, [history, threadId]);

  useEffect(() => {
    const controller = new AbortController();
    workspaceRequest<Project[]>("projects", undefined, controller.signal)
      .then(items => {
        if (controller.signal.aborted) return;
        setProjects(items);
        setProjectId(items[0]?.id ?? "");
      })
      .catch((error: Error) => { if (!controller.signal.aborted) setNotice(error.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    workspaceRequest<Agent[]>("agents", undefined, controller.signal)
      .then(items => {
        if (controller.signal.aborted) return;
        setAgents(items);
        setDraftAgent(items.find(agent => agent.available)?.id ?? "default");
      })
      .catch((error: Error) => { if (!controller.signal.aborted) setModelError(error.message); });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!projectId) return;
    const controller = new AbortController();
    workspaceRequest<Thread[]>(`projects/${projectId}/threads`, undefined, controller.signal)
      .then(items => {
        if (controller.signal.aborted) return;
        setThreads(current => [...current.filter(item => !items.some(loaded => loaded.id === item.id)), ...items]);
      })
      .catch((error: Error) => { if (!controller.signal.aborted) setNotice(error.message); });
    return () => controller.abort();
  }, [projectId]);

  useEffect(() => {
    if (!threadId) return;
    if (threadId === createdThreadId.current) {
      createdThreadId.current = "";
      return;
    }
    const controller = new AbortController();
    workspaceRequest<History>(`threads/${threadId}`, undefined, controller.signal)
      .then(result => {
        if (controller.signal.aborted) return;
        setHistories(current => ({ ...current, [threadId]: result }));
        setChatErrors(current => ({ ...current, [threadId]: "" }));
      })
      .catch((error: Error) => {
        if (!controller.signal.aborted) setChatErrors(current => ({ ...current, [threadId]: error.message }));
      });
    return () => controller.abort();
  }, [threadId]);

  function addProject(created: Project) {
    setNotice("");
    setProjects(items => [created, ...items]);
    setThreadId("");
    setProjectId(created.id);
    setRepoPreference(true);
    setShowNav(false);
  }

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = prompt.trim();
    if (!canSend) return;
    let id = threadId;
    setChatErrors(items => ({ ...items, [draftId]: "" }));
    try {
      if (!id) {
        setCreatingThread(true);
        const title = Array.from(text.replace(/\s+/g, " ")).slice(0, 80).join("");
        const created = await workspaceRequest<Thread>(`projects/${projectId}/threads`, { title, agent_id: draftAgent });
        id = created.id;
        setThreads(items => [created, ...items.filter(item => item.id !== created.id)]);
        setHistories(items => ({ ...items, [id]: { ...created, messages: [] } }));
        setDrafts(items => ({ ...items, [draftId]: "", [id]: prompt }));
        createdThreadId.current = id;
        setThreadId(id);
        setCreatingThread(false);
      }
      setPending(items => ({ ...items, [id]: true }));
      await workspaceRequest("chat", { conversation_id: id, prompt: text });
      setDrafts(items => ({ ...items, [id]: "" }));
      const result = await workspaceRequest<History>(`threads/${id}`);
      setHistories(items => ({ ...items, [id]: result }));
    } catch (error) {
      setChatErrors(items => ({ ...items, [id || draftId]: (error as Error).message }));
    } finally {
      if (id) setPending(items => ({ ...items, [id]: false }));
      setCreatingThread(false);
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


  function renderThreads(items: Thread[]) {
    return (
      <ul className="workspace-list workspace-threads">
        {items.map(item => (
          <li key={item.id}>
            <button
              aria-current={item.id === threadId ? "page" : undefined}
              disabled={creatingThread}
              onClick={() => { setThreadId(item.id); setShowNav(false); }}
            >
              <span className="workspace-thread-meta">
                <span className="workspace-thread-project"><FolderSimpleIcon size={14} /> {project?.name}</span>
                {pending[item.id] && <span className="workspace-thread-running" role="status">Reply in progress</span>}
              </span>
              <strong>{item.title}</strong>
            </button>
          </li>
        ))}
      </ul>
    );
  }

  const canSend = project && prompt.trim() && modelAvailable && !creatingThread && !pending[threadId] && !savingTask && (!threadId || history);

  return (
    <main className="workspace-shell" ref={shell}>
      <aside className="workspace-nav" aria-label="Projects and threads" data-open={showNav}>
        <Link className="workspace-brand" href="/"><SmileyLogo width={19} height={19} /> Readcode</Link>
        <div className="workspace-sidebar-tools">
          <label className="workspace-search">
            <MagnifyingGlassIcon size={16} />
            <input type="search" aria-label="Search threads" placeholder="Search" value={search} onChange={event => setSearch(event.target.value)} />
          </label>
          <ProjectSourcePicker open={adding} onOpenChange={setAdding} disabled={loading || creatingThread} portal={shell} onCreated={addProject} />
          <button className="workspace-icon" disabled={!project || creatingThread} aria-label="New thread" title="New thread" onClick={() => { setThreadId(""); setShowNav(false); }}><NotePencilIcon size={17} /></button>
        </div>
        {loading && <p className="workspace-muted">Loading projects…</p>}
        <div className="workspace-thread-scroll">
          {renderThreads(openThreads)}
          {search.trim() && !visibleThreads.length && <p className="workspace-muted">No matching threads.</p>}
        </div>
        {workingThreads.length > 0 && (
          <details className="workspace-thread-group" open>
            <summary>Working <span>{workingThreads.length}<CaretDownIcon size={12} /></span></summary>
            <div className="workspace-thread-group-list">{renderThreads(workingThreads)}</div>
          </details>
        )}
        {project && (
          <details key={project.id} className="workspace-thread-group" open={search.trim() ? true : undefined}>
            <summary>Settled <span>{settledThreads.length}<CaretDownIcon size={12} /></span></summary>
            <div className="workspace-thread-group-list">
              {settledThreads.length > 0 ? renderThreads(settledThreads) : <p className="workspace-muted">No settled threads.</p>}
            </div>
          </details>
        )}
        <footer className="workspace-nav-footer">
          <button className="workspace-icon" onClick={signOut} disabled={loggingOut} aria-label="Sign out" title="Sign out"><SignOutIcon size={17} /></button>
          {project && <button className="workspace-icon" aria-label="Repository" title="Repository" aria-expanded={showRepo} onClick={() => {
            setRepoPreference(!showRepo);
            setShowNav(false);
          }}><GitBranchIcon size={17} /></button>}
        </footer>
      </aside>

      <header className="workspace-bar">
        <button className="workspace-icon workspace-nav-toggle" aria-label="Toggle threads" aria-expanded={showNav} onClick={() => setShowNav(value => !value)}><SidebarSimpleIcon size={18} /></button>
        <label className="workspace-project-select">
          <FolderSimpleIcon size={15} />
          <select aria-label="Project" value={projectId} disabled={creatingThread || !projects.length} onChange={event => {
            setProjectId(event.target.value);
            setThreadId("");
            setNotice("");
          }}>
            {!projects.length && <option value="">Workspace</option>}
            {projects.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        <span className="workspace-slash" aria-hidden="true">/</span>
        <strong className="workspace-location">{thread?.title ?? "New thread"}</strong>
        {project && <button className="workspace-icon workspace-repo-toggle" aria-label="Toggle repository panel" title="Repository tools" aria-expanded={showRepo} onClick={() => setRepoPreference(!showRepo)}><GitBranchIcon size={17} /></button>}
      </header>

      <div className="workspace-layout">
        {notice && <p className="workspace-alert workspace-notice" role="alert">{notice}</p>}
        <section className="workspace-chat" aria-label="Coding chat" data-empty={!thread || history?.messages.length === 0}>
          {(!thread || history?.messages.length === 0) && (
            <div className="workspace-welcome">
              <h1>{project ? `What should we build in ${project.name}?` : "What should we build?"}</h1>
              {!project && !loading && <button className="workspace-quiet workspace-add-first" onClick={() => setAdding(true)}>Add a project</button>}
            </div>
          )}
          <div className="workspace-messages" aria-live="polite" ref={messages}>
            {thread && !history && !chatErrors[draftId] && <p className="workspace-muted">Loading the thread…</p>}
            {history?.messages.map(message => (
              <article key={message.id} className="workspace-message" data-role={message.role}>
                <h2>{message.role === "user" ? "You" : "Readcode"}</h2>
                <MessageContent content={message.content} />
              </article>
            ))}
            {pending[threadId] && <p className="workspace-muted">Waiting for the assistant…</p>}
          </div>
          <form className="workspace-composer" onSubmit={send}>
            {chatErrors[draftId] && <p className="workspace-alert" role="alert">{chatErrors[draftId]}</p>}
            <div className="workspace-composer-box">
              <textarea aria-label="Message" value={prompt} maxLength={12000} rows={2} placeholder="Ask anything about your project" disabled={!project || creatingThread || (Boolean(thread) && !history) || pending[threadId]} onChange={event => {
                const value = event.target.value;
                setDrafts(items => ({ ...items, [draftId]: value }));
              }} />
              <div className="workspace-composer-tools">
                {thread && <button className="workspace-icon" type="button" aria-label="Show repository files" title="Show repository files" onClick={() => setRepoPreference(true)}><PaperclipIcon size={17} /></button>}
                <ModelPicker agents={agents} error={modelError} selectedId={agentId} locked={creatingThread || savingTask || Boolean(pending[threadId])} onSelect={id => {
                  if (thread) {
                    if (id !== thread.agent_id) void updateTask(id, thread.task_status);
                  } else setDraftAgent(id);
                }} />
                <button className="workspace-send" aria-label="Send message" title="Send message" disabled={!canSend}><ArrowUpIcon size={17} weight="bold" /></button>
              </div>
            </div>
            {project && <div className="workspace-composer-meta">
              <span><FolderSimpleIcon size={14} /> {project.name}</span>
              {thread && <select aria-label="Task status" value={thread.task_status} disabled={savingTask || pending[threadId]} onChange={event => void updateTask(thread.agent_id, event.target.value as TaskStatus)}>
                <option value="open">Open</option><option value="in_progress">Working</option><option value="done">Settled</option>
              </select>}
            </div>}
          </form>
        </section>

        {project && <div className="workspace-repo-slot" hidden={!showRepo}>
          <RepositoryPanel key={thread?.id ?? project.id} project={project} threadId={thread?.id} onConnect={updated => {
            setProjects(items => items.map(item => item.id === updated.id ? updated : item));
          }} onAttach={({ path, content }) => {
            const snippet = `File: ${path}\n\n${content}`;
            const next = prompt ? `${prompt}\n\n${snippet}` : snippet;
            if (next.length > 12000 || pending[threadId]) {
              setChatErrors(items => ({ ...items, [threadId]: "Wait for the active reply or shorten the draft before adding the file." }));
              return;
            }
            setDrafts(items => ({ ...items, [draftId]: next }));
          }} />
        </div>}
      </div>
    </main>
  );
}
