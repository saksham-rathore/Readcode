"use client";

import { useState, type FormEvent, type ReactNode } from "react";

const suggestions = [
  "Explain this codebase",
  "Find and fix a bug",
  "Build a new feature",
];

function Mark() {
  return <span className="brand-mark" aria-hidden="true"><span>t</span><span>3</span></span>;
}

function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };
  const paths: Record<string, ReactNode> = {
    plus: <><path d="M12 5v14M5 12h14" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4 4" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    spark: <><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-2-5.8L4 11l6-2.2L12 3Z" /><path d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z" /></>,
    file: <><path d="M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10Z" /><path d="M13 3v7h7M8 14h8M8 18h6" /></>,
    terminal: <><path d="m4 17 5-5-5-5M12 19h8" /></>,
    globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    send: <><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></>,
    panel: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M14 4v16" /></>,
  };
  return <svg {...common}>{paths[name] ?? paths.spark}</svg>;
}

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [sentPrompt, setSentPrompt] = useState("");
  const [activeTab, setActiveTab] = useState("Preview");

  function submitPrompt(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!prompt.trim()) return;
    setSentPrompt(prompt.trim());
    setPrompt("");
  }

  return (
    <main>
      <div className="announcement"><span className="announcement-dot" /> A new way to build with AI <a href="#workspace">Take a look <Icon name="arrow" size={14} /></a></div>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="T3 Code home"><Mark /><span>t3<span className="brand-light">code</span></span></a>
        <nav className="top-nav" aria-label="Main navigation">
          <a href="#workspace">Workspace</a><a href="#features">Features</a><a href="#how-it-works">How it works</a>
        </nav>
        <div className="header-actions"><a className="login-link" href="#workspace">Sign in</a><a className="header-cta" href="#workspace">Try the demo <Icon name="arrow" size={15} /></a></div>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-icon"><Icon name="spark" size={14} /></span> YOUR AI CODING WORKSPACE</div>
          <h1>Big ideas.<br /><span>Less busywork.</span></h1>
          <p className="hero-description">Meet your new coding partner. Explore a project, work through a tricky bug, and turn your next idea into code with a little help from AI.</p>
          <form className="hero-prompt" onSubmit={submitPrompt}>
            <label className="prompt-label" htmlFor="prompt">What are we building today?</label>
            <textarea id="prompt" rows={2} placeholder="Ask T3 Code anything about your project…" value={prompt} onChange={(event) => setPrompt(event.target.value)} />
            <div className="prompt-footer"><span><span className="online-dot" /> Ready when you are</span><button className="send-button" type="submit" aria-label="Send prompt"><Icon name="send" size={16} /></button></div>
          </form>
          <div className="suggestion-row"><span>Try:</span>{suggestions.map((item) => <button key={item} type="button" onClick={() => setPrompt(item)}>{item}</button>)}</div>
          <div className="hero-footnote"><span className="avatar-stack"><i>J</i><i>A</i><i>M</i></span><span>Built for curious minds and ambitious projects</span></div>
        </div>

        <div className="workspace-stage" id="workspace">
          <div className="stage-glow" />
          <div className="app-window">
            <div className="window-topbar"><div className="window-dots"><i /><i /><i /></div><div className="window-title"><span className="tiny-mark">t3</span> Readcode <Icon name="chevron" size={13} /></div><div className="window-controls"><Icon name="panel" size={15} /><span className="user-avatar">S</span></div></div>
            <div className="workspace-layout">
              <aside className="workspace-sidebar">
                <div className="workspace-brand"><Mark /><span>Readcode</span><button aria-label="New conversation"><Icon name="plus" size={16} /></button></div>
                <button className="sidebar-search"><Icon name="search" size={15} /><span>Search anything</span><kbd>⌘ K</kbd></button>
                <div className="sidebar-label">WORKSPACE</div>
                <div className="sidebar-project"><span className="project-icon"><Icon name="file" size={14} /></span><span>readcode-app</span><Icon name="chevron" size={13} /></div>
                <div className="sidebar-label recent-label">RECENT CHATS <button aria-label="New chat"><Icon name="plus" size={13} /></button></div>
                <button className="chat-link active-chat"><span className="chat-bullet" />Polish the onboarding flow</button>
                <button className="chat-link"><span className="chat-bullet" />Add dark mode support</button>
                <button className="chat-link"><span className="chat-bullet" />Understand auth middleware</button>
                <div className="sidebar-spacer" />
                <div className="sidebar-plan"><span className="plan-spark"><Icon name="spark" size={15} /></span><div><b>Your ideas, in motion.</b><small>Start a conversation to begin.</small></div></div>
                <div className="sidebar-profile"><span className="profile-avatar">S</span><span><b>Sam</b><small>Personal workspace</small></span><span className="profile-dots">···</span></div>
              </aside>
              <section className="chat-area">
                <div className="chat-top"><div><span className="crumb-muted">readcode-app</span><Icon name="chevron" size={13} /><span>Polish the onboarding flow</span></div><button className="share-button">Share <Icon name="arrow" size={13} /></button></div>
                <div className="chat-body">
                  <div className="date-label"><span /> TODAY <span /></div>
                  <div className="user-message"><span className="message-avatar">S</span><p>Can you make the onboarding feel simpler and more welcoming?</p></div>
                  <div className="assistant-message"><span className="assistant-avatar"><Icon name="spark" size={15} /></span><div className="assistant-content"><div className="assistant-name">T3 Code <span>just now</span></div><p>Absolutely. I’d make the first step feel lighter by focusing on one clear action and showing progress along the way.</p><div className="change-card"><div className="change-card-top"><span className="change-icon"><Icon name="file" size={14} /></span><b>Suggested changes</b><span className="change-count">2 files</span></div><div className="file-change"><span className="filetype tsx">TS</span><span>app/onboarding/page.tsx</span><span className="additions">+18</span></div><div className="file-change"><span className="filetype css">CS</span><span>app/globals.css</span><span className="additions">+6</span></div><button className="review-changes">Review changes <Icon name="arrow" size={13} /></button></div><div className="answer-actions"><button>↻ &nbsp;Try another</button><button>♡ &nbsp;Helpful</button><span>·</span><button>Copy</button></div></div></div>
                  {sentPrompt && <div className="user-message latest-message"><span className="message-avatar">S</span><p>{sentPrompt}</p></div>}
                  <form className="chat-composer" onSubmit={submitPrompt}><textarea rows={2} placeholder="Ask a follow-up or describe a change…" aria-label="Ask T3 Code a follow-up" value={prompt} onChange={(event) => setPrompt(event.target.value)} /><div className="composer-tools"><button type="button"><Icon name="plus" size={15} /> Add context</button><span>Demo workspace · <b>GPT-4o</b></span><button type="submit" className="composer-send" aria-label="Send message"><Icon name="arrow" size={15} /></button></div></form>
                  <div className="demo-note">Interactive preview · Responses are illustrative</div>
                </div>
              </section>
            </div>
          </div>
          <div className="floating-chip chip-top"><span className="chip-check"><Icon name="check" size={13} /></span> Context stays with your project</div>
          <div className="floating-chip chip-bottom"><span className="chip-pulse" /> One workspace, many possibilities</div>
        </div>
      </section>

      <section className="trust-strip"><span>ONE CALM PLACE TO</span><div><Icon name="search" size={16} /> Understand your code</div><div><Icon name="spark" size={16} /> Make a plan</div><div><Icon name="file" size={16} /> Shape what comes next</div><div className="trust-last"><Icon name="check" size={16} /> Keep you in control</div></section>

      <section className="features-section" id="features">
        <div className="section-heading"><div className="eyebrow"><span className="eyebrow-icon"><Icon name="spark" size={14} /></span> A BETTER WAY TO BUILD</div><h2>From “where do I start?”<br /><span>to “look what I made.”</span></h2><p>Bring your project and your questions. T3 Code helps you find the next step, then makes it easier to take.</p></div>
        <div className="feature-grid">
          <article className="feature-card feature-wide"><div className="feature-copy"><span className="feature-icon violet"><Icon name="search" size={18} /></span><h3>Get oriented, faster</h3><p>Ask how a project works, trace a feature, or find the right file. Start with a question instead of a scavenger hunt.</p><a href="#how-it-works">Explore a codebase <Icon name="arrow" size={14} /></a></div><div className="mini-code-card"><div className="mini-code-top"><span className="filetype ts">TS</span> auth/middleware.ts <span className="mini-dot" /></div><div className="mini-code-lines"><span><i>01</i> <b>export async function</b> middleware(req) {'{'}</span><span><i>02</i> &nbsp; <em>const</em> session = getSession(req)</span><span><i>03</i> &nbsp; <b>if</b> (!session) {'{'}</span><span><i>04</i> &nbsp;&nbsp; <b>return</b> redirect(<u>"/login"</u>)</span><span><i>05</i> &nbsp; {'}'}</span><span><i>06</i> {'}'}</span></div><div className="code-insight"><span><Icon name="spark" size={14} /></span><div><b>Here’s the short version</b><small>This checks for a session before protected pages load.</small></div></div></div></article>
          <article className="feature-card"><span className="feature-icon peach"><Icon name="spark" size={18} /></span><h3>Think it through together</h3><p>Talk through tradeoffs, break a big change into small steps, and keep the whole thread attached to your project.</p><div className="feature-micro"><span className="micro-avatar">T3</span><span>Let’s make a plan…</span><span className="micro-cursor" /></div></article>
          <article className="feature-card"><span className="feature-icon mint"><Icon name="file" size={18} /></span><h3>Make the next move</h3><p>Use AI suggestions to shape new code, review a change, or unblock the part you’ve been stuck on.</p><div className="mini-diff"><span>onboarding.tsx</span><b>+18</b><i>Change ready to review <Icon name="arrow" size={12} /></i></div></article>
        </div>
      </section>

      <section className="how-section" id="how-it-works"><div className="how-copy"><div className="eyebrow"><span className="eyebrow-icon"><Icon name="clock" size={14} /></span> SIMPLE BY DESIGN</div><h2>Your project.<br /><span>Your pace.</span></h2><p>No complicated setup to understand the idea. Bring a project, ask a question, and decide what to do with the answer.</p><a href="#workspace" className="text-link">Try the workspace <Icon name="arrow" size={15} /></a></div><div className="steps-list"><div className="step-item"><span className="step-number">01</span><div><h3>Choose a project</h3><p>Start a project space so conversations stay organized around what you’re building.</p></div><span className="step-icon"><Icon name="file" size={17} /></span></div><div className="step-item"><span className="step-number">02</span><div><h3>Ask in plain language</h3><p>Ask for an explanation, a plan, a review, or help with the next bit of code.</p></div><span className="step-icon"><Icon name="spark" size={17} /></span></div><div className="step-item"><span className="step-number">03</span><div><h3>Stay in the driver’s seat</h3><p>Read the suggestion, decide what fits, and keep shaping the project your way.</p></div><span className="step-icon"><Icon name="check" size={17} /></span></div></div></section>

      <section className="closing-cta"><div className="cta-orb"><Icon name="spark" size={22} /></div><h2>Ready to make something?</h2><p>Bring your next question. We’ll take it from there.</p><a href="#workspace">Explore the demo <Icon name="arrow" size={15} /></a><div className="cta-scribble">your next idea starts here <span>↗</span></div></section>
      <footer className="site-footer"><a className="brand footer-brand" href="#top"><Mark /><span>t3<span className="brand-light">code</span></span></a><span>Built for the joy of making things.</span><a href="#top">Back to top ↑</a></footer>
    </main>
  );
}
