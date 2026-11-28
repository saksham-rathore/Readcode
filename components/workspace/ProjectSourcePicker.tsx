"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent, type RefObject } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { ArrowLeftIcon, FolderPlusIcon, FolderSimpleIcon, LinkSimpleIcon, MagnifyingGlassIcon, XIcon } from "@phosphor-icons/react";
import { workspaceRequest, type Project } from "./api";

const sources = [
  { id: "new", label: "New project", detail: "Start a new Git repository from a name", icon: FolderPlusIcon },
  { id: "local", label: "Local folder", detail: "Import files from a folder on this device", icon: FolderSimpleIcon },
  { id: "git", label: "Git URL", detail: "Clone a public repository over HTTPS", icon: LinkSimpleIcon },
] as const;

type Source = typeof sources[number];
const folderLimit = 2 * 1024 * 1024;

async function folderFiles(files: File[]) {
  if (!files.length) throw new Error("Choose a folder with at least one file.");
  if (files.length > 500 || files.reduce((size, file) => size + file.size, 0) > folderLimit) {
    throw new Error("Choose a folder with at most 500 files and 2 MiB total.");
  }
  return Promise.all(files.map(async file => {
    const path = file.webkitRelativePath.split("/").slice(1).join("/");
    const bytes = new Uint8Array(await file.arrayBuffer());
    let binary = "";
    for (let offset = 0; offset < bytes.length; offset += 8192) {
      binary += String.fromCharCode(...bytes.subarray(offset, offset + 8192));
    }
    return { path, content: btoa(binary) };
  }));
}

export default function ProjectSourcePicker({ open, onOpenChange, disabled, portal, onCreated }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  disabled: boolean;
  portal: RefObject<HTMLElement | null>;
  onCreated: (project: Project) => void;
}) {
  const searchInput = useRef<HTMLInputElement>(null);
  const nameInput = useRef<HTMLInputElement>(null);
  const rows = useRef<Array<HTMLButtonElement | null>>([]);
  const submitting = useRef(false);
  const [source, setSource] = useState<Source>();
  const [search, setSearch] = useState("");
  const [active, setActive] = useState(0);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [name, setName] = useState("");
  const [remote, setRemote] = useState("");
  const matches = sources.filter(item => `${item.label} ${item.detail}`.toLowerCase().includes(search.trim().toLowerCase()));

  useEffect(() => {
    if (!open) return;
    if (!source) searchInput.current?.focus();
    else nameInput.current?.focus();
  }, [open, source]);

  function changeOpen(value: boolean) {
    if (!value && submitting.current) return;
    onOpenChange(value);
    setSource(undefined);
    setSearch("");
    setActive(0);
    setError("");
  }

  function choose(item?: Source) {
    setSource(item);
    setError("");
    setName("");
    setRemote("");
    setFiles([]);
  }

  function navigate(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" && matches[active]) {
      event.preventDefault();
      choose(matches[active]);
    } else if ((event.key === "ArrowDown" || event.key === "ArrowUp") && matches.length) {
      event.preventDefault();
      const next = (active + (event.key === "ArrowDown" ? 1 : -1) + matches.length) % matches.length;
      setActive(next);
      rows.current[next]?.scrollIntoView({ block: "nearest" });
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!source || submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setError("");
    try {
      const localFiles = source.id === "local" ? await folderFiles(files) : undefined;
      const project = await workspaceRequest<Project>("project-sources", {
        source: source.id, name: name.trim(), remote: remote.trim(), files: localFiles,
      });
      submitting.current = false;
      changeOpen(false);
      onCreated(project);
    } catch (problem) {
      setError((problem as Error).message);
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }

  return (
      <Dialog.Root open={open} onOpenChange={changeOpen}>
        <Dialog.Trigger className="workspace-icon" aria-label="Add project" title="Add project" disabled={disabled}><FolderPlusIcon size={17} /></Dialog.Trigger>
        <Dialog.Portal container={portal}>
          <Dialog.Backdrop className="workspace-source-backdrop" />
          <Dialog.Popup className="workspace-source-popup">
            <div className="workspace-source-top">
              {source ? (
                <>
                  <button className="workspace-icon" aria-label="Back to sources" onClick={() => choose()} disabled={busy}><ArrowLeftIcon size={17} /></button>
                  <Dialog.Title>{source.label}</Dialog.Title>
                </>
              ) : (
                <>
                  <Dialog.Title className="workspace-source-sr-only">Add project</Dialog.Title>
                  <MagnifyingGlassIcon size={17} aria-hidden="true" />
                  <input ref={searchInput} type="search" aria-label="Search sources" placeholder="Search sources…" value={search} onChange={event => {
                    setSearch(event.target.value);
                    setActive(0);
                  }} onKeyDown={navigate} />
                </>
              )}
              <Dialog.Close className="workspace-icon" aria-label="Close source picker" disabled={busy}><XIcon size={16} /></Dialog.Close>
            </div>
            {!source ? (
              <>
                <p className="workspace-source-list-label">Sources</p>
                <ul className="workspace-source-list">
                  {matches.map((item, index) => (
                    <li key={item.id}>
                      <button ref={element => { rows.current[index] = element; }} type="button" data-active={active === index}
                        onFocus={() => setActive(index)} onClick={() => choose(item)}>
                        <item.icon size={18} aria-hidden="true" />
                        <span><strong>{item.label}</strong><small>{item.detail}</small></span>
                      </button>
                    </li>
                  ))}
                  {!matches.length && <li className="workspace-muted">No matching sources.</li>}
                </ul>
                <div className="workspace-source-keys"><span><kbd>↑</kbd> <kbd>↓</kbd> Navigate</span><span><kbd>Enter</kbd> Select</span><span><kbd>Esc</kbd> Close</span></div>
              </>
            ) : (
              <form className="workspace-stack workspace-source-form" onSubmit={submit}>
                <label>Project name<input ref={nameInput} value={name} maxLength={120} required disabled={busy} onChange={event => setName(event.target.value)} /></label>
                {source.id === "git" && <label>Public repository URL<input type="url" value={remote} maxLength={2048} required disabled={busy} placeholder="https://github.com/owner/repo" onChange={event => setRemote(event.target.value)} /><small>GitHub, GitLab.com, or Codeberg over HTTPS</small></label>}
                {source.id === "local" && <label>Folder to import<input type="file" multiple disabled={busy} ref={input => {
                  input?.setAttribute("webkitdirectory", "");
                }} onChange={event => {
                  const selected = Array.from(event.target.files ?? []);
                  setFiles(selected.filter(file => !file.webkitRelativePath.toLowerCase().split("/").includes(".git")));
                  setName(current => current || selected[0]?.webkitRelativePath.split("/")[0] || "");
                  setError("");
                }} /><small>Up to 500 files and 2 MiB. Git history stays on your device.</small></label>}
                {error && <p className="workspace-alert" role="alert">{error}</p>}
                <button className="workspace-action" disabled={busy}>{busy ? "Adding project…" : source.id === "local" ? "Import folder" : "Add project"}</button>
              </form>
            )}
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
  );
}
