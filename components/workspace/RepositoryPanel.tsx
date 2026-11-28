"use client";

import { useEffect, useState, type FormEvent } from "react";
import { GitBranchIcon } from "@phosphor-icons/react";
import { workspaceRequest, type Project } from "./api";

type Worktree = { imported: boolean; ready: boolean; branch: string | null };
type FileContent = { path: string; content: string };
type Changes = { status: string; diff: string };
type Checkpoint = { id: string; title: string };

export default function RepositoryPanel({ project, threadId, onConnect, onAttach }: {
  project: Project;
  threadId?: string;
  onConnect: (project: Project) => void;
  onAttach: (file: FileContent) => void;
}) {
  const [worktree, setWorktree] = useState<Worktree>();
  const [files, setFiles] = useState<string[]>([]);
  const [file, setFile] = useState<FileContent>();
  const [original, setOriginal] = useState<string | null>(null);
  const [diff, setDiff] = useState<Changes>();
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [target, setTarget] = useState("");
  const [tab, setTab] = useState<"files" | "changes" | "checkpoints">("files");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [statusAttempt, setStatusAttempt] = useState(0);
  const thread = `threads/${threadId}`;
  const repository = `projects/${project.id}/repository`;
  const statusPath = threadId ? `${thread}/worktree` : repository;

  useEffect(() => {
    const controller = new AbortController();
    workspaceRequest<Worktree>(statusPath, undefined, controller.signal)
      .then(async result => {
        if (controller.signal.aborted) return;
        setWorktree(result);
        if (result.ready) setFiles(await workspaceRequest<string[]>(`${thread}/files`, undefined, controller.signal));
      })
      .catch((error: Error) => { if (!controller.signal.aborted) setNotice(error.message); });
    return () => controller.abort();
  }, [project.repository_url, statusPath, statusAttempt, thread]);

  async function run(operation: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setNotice("");
    try { await operation(); }
    catch (error) { setNotice((error as Error).message); }
    finally { setBusy(false); }
  }

  function connect(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const repository_url = String(new FormData(event.currentTarget).get("repository_url")).trim();
    if (!repository_url) return;
    void run(async () => onConnect(await workspaceRequest<Project>(repository, { repository_url })));
  }

  function clone() {
    void run(async () => {
      setWorktree(await workspaceRequest<Worktree>(`projects/${project.id}/clone`, { approved: true }));
    });
  }

  function openWorktree() {
    void run(async () => {
      setWorktree(await workspaceRequest<Worktree>(`${thread}/worktree`, { approved: true }));
      setFiles(await workspaceRequest<string[]>(`${thread}/files`));
    });
  }

  function read(path: string) {
    if (!path) return;
    if (file && file.content !== (original ?? "") && !window.confirm("Discard the unsaved edit?")) return;
    void run(async () => {
      const result = await workspaceRequest<FileContent>(`${thread}/file?${new URLSearchParams({ path })}`);
      setFile(result);
      setOriginal(result.content);
    });
  }

  function createFile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const path = String(new FormData(event.currentTarget).get("path")).trim();
    if (!path || (file && file.content !== (original ?? "") && !window.confirm("Discard the unsaved edit?"))) return;
    setFile({ path, content: "" });
    setOriginal(null);
    event.currentTarget.reset();
  }

  function saveFile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) return;
    void run(async () => {
      await workspaceRequest(`${thread}/file`, { ...file, expected: original, approved: true });
      setOriginal(file.content);
      setFiles(await workspaceRequest<string[]>(`${thread}/files`));
      setNotice("File saved.");
    });
  }

  function selectTab(value: typeof tab) {
    setTab(value);
    if (value === "changes") void run(async () => setDiff(await workspaceRequest<Changes>(`${thread}/diff`)));
    if (value === "checkpoints") void run(async () => setCheckpoints(await workspaceRequest<Checkpoint[]>(`${thread}/checkpoints`)));
  }

  function saveCheckpoint(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const title = String(new FormData(form).get("title")).trim();
    if (!title) return;
    void run(async () => {
      setCheckpoints(await workspaceRequest<Checkpoint[]>(`${thread}/checkpoints`, { title, approved: true }));
      form.reset();
      setNotice("Changes committed to this thread’s branch.");
    });
  }

  function restore() {
    if (!target || !window.confirm("Restore this checkpoint in the thread’s worktree?")) return;
    void run(async () => {
      setDiff(await workspaceRequest<Changes>(`${thread}/restore`, { commit: target, approved: true }));
      setFiles(await workspaceRequest<string[]>(`${thread}/files`));
      setFile(undefined);
      setOriginal(null);
      setTab("changes");
    });
  }

  return (
    <aside className="workspace-repo" aria-label="Repository tools" aria-busy={busy}>
      <div className="workspace-section-heading"><h2><GitBranchIcon size={17} aria-hidden="true" /> {threadId ? "Worktree" : "Repository"}</h2></div>
      {worktree?.branch && <code className="workspace-branch" title={worktree.branch}>{worktree.branch}</code>}
      {notice && <p className="workspace-repo-notice" role="status">{notice}</p>}
      {worktree && !worktree.imported && !project.repository_url && <form className="workspace-stack" onSubmit={connect}>
        <label>Public repository URL<input name="repository_url" type="url" maxLength={2048} placeholder="https://github.com/owner/repo" required /><small>GitHub, GitLab.com, or Codeberg over HTTPS</small></label>
        <button className="workspace-action" disabled={busy}>{busy ? "Connecting…" : "Connect repository"}</button>
      </form>}
      {project.repository_url && <p className="workspace-muted workspace-repo-url">{project.repository_url}</p>}
      {!worktree && (notice
        ? <button className="workspace-quiet" onClick={() => { setNotice(""); setStatusAttempt(attempt => attempt + 1); }}>Retry connection</button>
        : <p className="workspace-muted" role="status">Checking repository…</p>)}
      {project.repository_url && worktree && !worktree.imported && <button className="workspace-action" disabled={busy} onClick={clone}>{busy ? "Cloning…" : "Clone repository"}</button>}
      {worktree?.imported && !threadId && <p className="workspace-muted">Repository ready. Open a thread to set up its worktree.</p>}
      {threadId && worktree?.imported && !worktree.ready && <button className="workspace-action" disabled={busy} onClick={openWorktree}>{busy ? "Opening…" : "Open thread worktree"}</button>}
      {worktree?.ready && <>
        <div className="workspace-repo-tabs" aria-label="Worktree views">
          {(["files", "changes", "checkpoints"] as const).map(value => <button key={value} aria-pressed={tab === value} disabled={busy} onClick={() => selectTab(value)}>{value}</button>)}
        </div>
        {tab === "files" && <div className="workspace-stack">
          <label>Open file<select value={files.includes(file?.path ?? "") ? file?.path : ""} disabled={busy} onChange={event => read(event.target.value)}>
            <option value="">Choose a file</option>{files.map(path => <option key={path}>{path}</option>)}
          </select></label>
          <form className="workspace-inline" onSubmit={createFile}>
            <input name="path" aria-label="New file path" placeholder="New file path" maxLength={600} required />
            <button className="workspace-quiet" disabled={busy}>New</button>
          </form>
          {file && <form className="workspace-stack" onSubmit={saveFile}>
            <label>{file.path}<textarea className="workspace-editor" value={file.content} rows={12} maxLength={262144} disabled={busy} onChange={event => setFile({ ...file, content: event.target.value })} /></label>
            <div className="workspace-inline">
              <button className="workspace-action" disabled={busy || file.content === original}>Save file</button>
              <button type="button" className="workspace-quiet" disabled={busy || file.content.length > 10000} onClick={() => onAttach(file)}>Add to draft</button>
            </div>
          </form>}
        </div>}
        {tab === "changes" && <div className="workspace-stack">
          <button className="workspace-quiet" disabled={busy} onClick={() => selectTab("changes")}>Refresh changes</button>
          {diff && (diff.status ? <><pre className="workspace-diff">{diff.status}</pre><pre className="workspace-diff">{diff.diff || "No tracked changes to compare. New files are listed above."}</pre></> : <p className="workspace-muted">No changes in this worktree.</p>)}
        </div>}
        {tab === "checkpoints" && <div className="workspace-stack">
          <form className="workspace-inline" onSubmit={saveCheckpoint}>
            <input aria-label="Checkpoint title" name="title" placeholder="Commit message" maxLength={120} required />
            <button className="workspace-action" disabled={busy}>Commit</button>
          </form>
          <label>Restore checkpoint<select value={target} disabled={busy} onChange={event => setTarget(event.target.value)}>
            <option value="">Choose a checkpoint</option>{checkpoints.map(item => <option key={item.id} value={item.id}>{item.id.slice(0, 7)} · {item.title}</option>)}
          </select></label>
          <button className="workspace-quiet" disabled={busy || !target} onClick={restore}>Restore changes</button>
        </div>}
      </>}
    </aside>
  );
}
