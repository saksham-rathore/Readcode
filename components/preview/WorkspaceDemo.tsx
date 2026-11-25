"use client";
import { useEffect, useState } from "react";
import { ArrowUp, Check, GitBranch, MagnifyingGlass, Pause, Play, Plus } from "@phosphor-icons/react";
import { SmileyLogo } from "@/components/ui";
import { AgentAvatar, type AgentShape } from "@/components/ui/AgentAvatar";
const agents = ["Readcode", "Builder", "Reviewer", "Scout", "Terminal"];
const agentShapes: AgentShape[] = ["clover", "star", "flower", "ghost", "mech"];
const notes = ["Your project, all in one place", "Building your next idea", "Ready for your review", "Found the files you need", "All checks passed"];
const prompt = "Build a beautiful first-run dashboard.";
export default function WorkspaceDemo() {
  const [playing, setPlaying] = useState(true);
  const [tick, setTick] = useState(0);
  const [selected, setSelected] = useState(0);
  const [draft, setDraft] = useState("");
  const [message, setMessage] = useState("");
  const [tab, setTab] = useState("Details");
  const [review, setReview] = useState(true);
  const [search, setSearch] = useState(false);
  const [query, setQuery] = useState("");
  useEffect(() => {
    if (!playing || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setTick(t => (t + 1) % 160), 100);
    return () => window.clearInterval(timer);
  }, [playing]);
  const phase = tick < 20 ? 0 : tick < 70 ? 1 : tick < 90 ? 2 : tick < 120 ? 3 : 4;
  const agent = playing && phase > 0 ? 1 : selected;
  const typing = playing && phase === 1 ? prompt.slice(0, Math.max(0, tick - 24)) : draft;
  const sent = message || (playing && phase >= 2 ? prompt : "");
  const stop = () => { setSelected(agent); setPlaying(false); };
  return <div className="rc-scene" id="demo"><div className="rc-window">
    <header className="rc-top"><span className="rc-lights"><i/><i/><i/></span><span>readcode</span><button onClick={() => { setPlaying(!playing); setTick(0); }} aria-label={playing ? "Pause animated demo" : "Play animated demo"}>{playing ? <Pause size={12}/> : <Play size={12}/>} a live demo. click around.</button></header>
    <div className="rc-body"><aside className="rc-sidebar">
      <div className="rc-tools"><button aria-label="Search agents" onClick={() => { stop(); setSearch(!search); }}><MagnifyingGlass size={19}/></button><button aria-label="New conversation" onClick={() => { stop(); setMessage(""); setDraft(""); }}><Plus size={20}/></button></div>
      {search && <input className="rc-search" aria-label="Find an agent" placeholder="Find an agent" value={query} onChange={e => setQuery(e.target.value)}/>}
      {agents.map((name, i) => name.toLowerCase().includes(query.toLowerCase()) && <button key={name} aria-label={name} className={`rc-agent tone-${i} ${agent === i ? "selected" : ""}`} onClick={() => { stop(); setSelected(i); }}><AgentAvatar type={agentShapes[i]} size={40} seed={i / 5}/><span><b>{name}</b><small>{notes[i]}</small></span>{agent === i && <i/>}</button>)}
      <div className="rc-project"><GitBranch size={14}/> readcode-app <code>main</code></div><div className="rc-sidebar-foot"><span>S</span> Personal workspace <i/></div>
    </aside><section className="rc-chat">
      <div className="rc-chat-head"><AgentAvatar type={agentShapes[agent]} size={24}/><b>{agents[agent]}</b><i/></div>
      <div className="rc-conversation"><div className="rc-timestamp">YOUR IDEAS. A LITTLE MOMENTUM.</div><div className="rc-bubble">Your project is ready. What shall we build today?</div>
      <div className="rc-summary">{["Mapped your codebase", "Checked the latest changes", "Ready for your next idea"].map((text, i) => <div key={text}><span>{["Scout", "Reviewer", "Builder"][i]}</span><span>{text}</span><Check size={14}/></div>)}</div>
      {sent ? <><div className="rc-bubble rc-outgoing">{sent}</div><div className="rc-bubble rc-response" key={phase >= 4 ? "ready" : "working"}>{playing && phase === 3 ? <span className="rc-thinking">Reading your files <i/><i/><i/></span> : <><strong>A clearer place to start.</strong><p>Your projects, recent activity, and next steps in one simple dashboard.</p></>}</div>{(!playing || phase >= 4) && <div className="rc-result"><div><Check size={18}/><strong>Dashboard ready to review</strong></div><p>3 files changed <span>+128 / -24</span></p><button onClick={() => { stop(); setTab("Changes"); }}>Review changes <span>↗</span></button></div>}</> : <div className="rc-suggestion"><strong>Small idea. Great place to start.</strong><p>Let&apos;s make your dashboard feel a little more like home.</p><button onClick={() => { stop(); setMessage(prompt); }}><span>A</span> Build the dashboard <span>↗</span></button><button onClick={() => { stop(); setTab("Project"); }}><span>B</span> Explore my codebase</button></div>}
      </div><form className="rc-composer" onSubmit={e => { e.preventDefault(); if (draft.trim()) { stop(); setMessage(draft.trim()); setDraft(""); } }}><Plus size={18}/><input aria-label="Message Readcode" placeholder="Ask anything, build something." value={typing} onFocus={stop} onChange={e => setDraft(e.target.value)}/><button aria-label="Send message"><ArrowUp size={18}/></button></form>
    </section><aside className="rc-details"><div className="rc-identity"><AgentAvatar type={agentShapes[agent]} size={78}/><h3>{agents[agent]}</h3><p>Your coding companion.</p></div><div className="rc-detail-tabs">{["Details", "Project", "Changes"].map(item => <button key={item} className={tab === item ? "active" : ""} onClick={() => { stop(); setTab(item); }}>{item}</button>)}</div>
    {tab === "Details" ? <><h4>Workspace</h4><div className="rc-detail-card"><div><span><b>Review before applying</b><small>You stay in control</small></span><button role="switch" aria-checked={review} aria-label="Review before applying" className={`rc-toggle ${review ? "on" : ""}`} onClick={() => { stop(); setReview(!review); }}/></div><div><span><b>Project context</b><small>Always in the loop</small></span><i className="rc-online"/></div></div><div className="rc-detail-card"><div><b>Model</b><span>✳ Codex</span></div><div><b>Context</b><span>8% used</span></div><div className="rc-meter"><i/></div><small>Plenty of room for your next idea.</small></div></> : <><h4>{tab === "Project" ? "readcode-app" : "Proposed changes"}</h4><div className="rc-detail-card rc-files"><b>{tab === "Project" ? "Project files" : "Dashboard update"}</b><span>app/page.tsx</span><span>components/dashboard.tsx</span><span>app/globals.css</span><small>{tab === "Project" ? "Next.js / TypeScript" : "Demo changes · ready for review"}</small></div></>}
    <p className="rc-details-foot">A little help. A lot of possibility.</p></aside></div>
    {playing && <div className={`rc-cursor phase-${phase}`} aria-hidden="true"><svg width="25" height="30" viewBox="0 0 25 30"><path d="M3 2L22 17L13 18L9 27Z" fill="#24242b" stroke="white" strokeWidth="2" strokeLinejoin="round"/></svg><span><SmileyLogo width={15} height={15}/> you</span></div>}
  </div></div>;
}
