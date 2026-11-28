"use client";

import { useRef, useState } from "react";
import { Popover } from "@base-ui/react/popover";
import { CaretDownIcon, CheckIcon, MagnifyingGlassIcon, RobotIcon } from "@phosphor-icons/react";
import type { Agent } from "./api";

export default function ModelPicker({ agents, error, selectedId, locked, onSelect }: {
  agents: Agent[] | null;
  error: string;
  selectedId: string;
  locked: boolean;
  onSelect: (agentId: string) => void;
}) {
  const portalContainer = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const selected = agents?.find(agent => agent.id === selectedId);
  const missing = agents && !selected;
  const query = search.trim().toLowerCase();
  const models = agents?.filter(agent => `${agent.model} ${agent.label}`.toLowerCase().includes(query));

  function changeOpen(value: boolean) {
    setOpen(value);
    if (!value) setSearch("");
  }

  return (
    <div className="workspace-model-control" ref={portalContainer}>
      <Popover.Root open={open} onOpenChange={changeOpen}>
        <Popover.Trigger className="workspace-model-trigger" type="button" aria-label={selected ? `Models, current model ${selected.model}` : "Models"}>
          <RobotIcon size={17} />
          <span>{selected?.model ?? "Models"}</span>
          {selected && !selected.available && <small>Setup required</small>}
          <CaretDownIcon size={13} />
        </Popover.Trigger>
        <Popover.Portal container={portalContainer}>
          <Popover.Positioner className="workspace-model-positioner" side="top" align="end" sideOffset={9} collisionPadding={12}>
            <Popover.Popup className="workspace-model-popup">
              <div className="workspace-model-heading">
                <Popover.Title>Models</Popover.Title>
                {agents && <span>{agents.filter(agent => agent.available).length} of {agents.length} available</span>}
              </div>
              <label className="workspace-model-search">
                <MagnifyingGlassIcon size={16} />
                <input type="search" aria-label="Search models" placeholder="Search models…" value={search}
                  onChange={event => setSearch(event.target.value)} onKeyDown={event => {
                    if (event.key === "Enter") event.preventDefault();
                  }} />
              </label>
              {error && <p className="workspace-model-message" role="status">{error}</p>}
              {!agents && !error && <p className="workspace-model-message" role="status">Loading models…</p>}
              {missing && <p className="workspace-model-message">The saved model is unavailable. Choose an available model to continue.</p>}
              {locked && <p className="workspace-model-message">Model selection is paused while the thread updates.</p>}
              {models?.length === 0 && <p className="workspace-model-message" role="status">{query ? "No matching models." : "No models are configured."}</p>}
              {Boolean(models?.length) && (
                <ul className="workspace-model-list">
                  {models?.map(agent => (
                    <li key={agent.id}>
                      <button type="button" aria-pressed={agent.id === selectedId} aria-disabled={!agent.available || locked}
                        onClick={() => {
                          if (!agent.available || locked) return;
                          onSelect(agent.id);
                          changeOpen(false);
                        }}>
                        <span className="workspace-model-name">
                          <strong>{agent.model}</strong>
                          {agent.label !== agent.model && <small>{agent.label}</small>}
                        </span>
                        <span className="workspace-model-status" data-available={agent.available}>
                          {agent.available ? "Available" : "Setup required"}
                        </span>
                        <CheckIcon size={16} className="workspace-model-check" aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
