"use client";

import { useState, type FormEvent, type RefObject } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { BrowserIcon, FolderSimpleIcon, GithubLogoIcon, LightningIcon, TerminalWindowIcon, XIcon } from "@phosphor-icons/react";
import { workspaceRequest, type Project } from "./api";

const actions = {
  browser: { label: "Browser", description: "Open the repository website", icon: BrowserIcon },
  github: { label: "GitHub", description: "Open repository issues", icon: GithubLogoIcon },
  files: { label: "Workspace files", description: "List files in the thread’s worktree", icon: FolderSimpleIcon },
  terminal: { label: "Terminal", description: "Run Git status and recent log", icon: TerminalWindowIcon },
} as const;

type Action = keyof typeof actions;
type Result = { url: string | null; output: string | null };

export default function WorkspaceActions({
  project, threadId, portal, agentId, modelAvailable, onAttach,
}: {
  project: Project;
  threadId: string;
  portal: RefObject<HTMLElement | null>;
  agentId: string;
  modelAvailable: boolean;
  onAttach: (text: string) => boolean;
}) {
  const [request, setRequest] = useState("");
  const [proposal, setProposal] = useState<Action | null>(null);
  const [result, setResult] = useState<{ action: Action; data: Result }>();
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<"suggest" | "run">();
  const endpoint = `projects/${project.id}`;

  async function suggest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !modelAvailable || !request.trim()) return;
    setBusy("suggest");
    setError("");
    setNotice("");
    setProposal(null);
    setResult(undefined);
    try {
      const response = await workspaceRequest<{ action: Action | null }>(`${endpoint}/action-suggestions`, {
        agent_id: agentId, thread_id: threadId || null, prompt: request.trim(),
      });
      if (response.action) setProposal(response.action);
      else setNotice("No available workspace action matches this request.");
    } catch (problem) {
      setError((problem as Error).message);
    } finally {
      setBusy(undefined);
    }
  }

  async function run(action: Action) {
    if (busy) return;
    setBusy("run");
    setError("");
    setNotice("");
    setProposal(null);
    setResult(undefined);
    try {
      const data = await workspaceRequest<Result>(`${endpoint}/actions`, { action, thread_id: threadId || null });
      setResult({ action, data });
    } catch (problem) {
      setError((problem as Error).message);
    } finally {
      setBusy(undefined);
    }
  }

  function enabled(action: Action) {
    if (action === "browser") return Boolean(project.repository_url);
    if (action === "github") return /^https:\/\/github\.com\//i.test(project.repository_url ?? "");
    return Boolean(threadId);
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger className="workspace-icon workspace-actions-toggle" title="Workspace actions" aria-label="Workspace actions">
        <LightningIcon size={17} />
      </Dialog.Trigger>
      <Dialog.Portal container={portal}>
        <Dialog.Backdrop className="workspace-source-backdrop" />
        <Dialog.Popup className="workspace-source-popup workspace-actions-popup">
          <div className="workspace-source-top">
            <Dialog.Title>Workspace actions</Dialog.Title>
            <Dialog.Close className="workspace-icon" aria-label="Close workspace actions"><XIcon size={16} /></Dialog.Close>
          </div>
          <div className="workspace-source-form workspace-actions-body">
            <ul className="workspace-action-options">
              {(Object.keys(actions) as Action[]).map(action => {
                const { label, description, icon: Icon } = actions[action];
                return <li key={action}><button type="button" className="workspace-quiet" disabled={Boolean(busy) || !enabled(action)} onClick={() => void run(action)}>
                  <Icon size={18} aria-hidden="true" />
                  <span><strong>{label}</strong><small>{description}</small></span>
                </button></li>;
              })}
            </ul>
            <form className="workspace-stack workspace-action-suggestion" onSubmit={suggest}>
              <label>Ask AI to suggest an action
                <input value={request} onChange={event => setRequest(event.target.value)} maxLength={3000} placeholder="For example, show recent commits" disabled={Boolean(busy)} />
              </label>
              {!modelAvailable && <small>Select an available model to ask AI for a suggestion.</small>}
              <button className="workspace-action" disabled={!modelAvailable || Boolean(busy) || !request.trim()}>
                {busy === "suggest" ? "Asking AI…" : "Suggest action"}
              </button>
            </form>
            {proposal && <div className="workspace-stack workspace-action-review">
              <div><strong>Approve AI suggestion</strong><p>{actions[proposal].description}</p></div>
              <div className="workspace-inline">
                <button className="workspace-action" onClick={() => void run(proposal)}>Approve and run</button>
                <button className="workspace-quiet" onClick={() => setProposal(null)}>Dismiss</button>
              </div>
            </div>}
            {busy === "run" && <p role="status">Running action…</p>}
            {error && <p className="workspace-alert" role="alert">{error}</p>}
            {notice && <p role="status">{notice}</p>}
            {result && <div className="workspace-stack workspace-action-review">
              <strong>{actions[result.action].label}</strong>
              {result.data.url && <a className="workspace-quiet workspace-action-link" href={result.data.url} target="_blank" rel="noopener noreferrer">Open in browser ↗</a>}
              {result.data.output && <><pre className="workspace-code">{result.data.output}</pre>
                <button className="workspace-quiet" onClick={() => {
                  const added = onAttach(`${actions[result.action].label} result:\n${result.data.output}`);
                  setNotice(added ? "Added to the composer." : "Shorten the draft or wait for the current reply before adding this result.");
                }}>Add result to draft</button>
              </>}
            </div>}
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
