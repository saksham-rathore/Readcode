"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import "./landing.css";
import CloudSky from "@/components/pixel-perfect/cloud-sky";
import { GithubStar, SmileyLogo } from "@/components/ui";
import { brand, nav, navCta, hero, features, models, steps, plans, faq, footer } from "./content";

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && (e.target.classList.add("in"), io.unobserve(e.target))),
      { threshold: 0.12 }
    );
    root.querySelectorAll(".rv").forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);
  return ref;
}

function AppWindow() {
  return (
    <div className="hero-scene" id="demo">
      <CloudSky className="hero-scene-bg" />
      <div className="win" aria-label="Readcode coding workspace preview">
        <div className="win-bar"><span className="traffic"><i /><i /><i /></span><span className="window-product">readcode</span><span className="window-caption">a preview of your coding workspace.</span></div>
        <div className="win-body">
          <aside className="preview-contacts">
            <div className="contact-tools"><span>⌕</span><span>+</span></div>
            <div className="contact selected"><span className="contact-avatar gray">R</span><div><b>Readcode</b><small>Plan ready to review</small></div></div>
            <div className="contact"><span className="contact-avatar purple">P</span><div><b>Patch</b><small>Found the login issue</small></div></div>
            <div className="contact"><span className="contact-avatar pink">S</span><div><b>Scout</b><small>Mapped the API flow</small></div></div>
            <div className="contact"><span className="contact-avatar blue">B</span><div><b>Builder</b><small>Settings screen drafted</small></div></div>
          </aside>
          <div className="preview-chat">
            <div className="preview-chat-title"><span className="contact-avatar gray">R</span> Readcode</div>
            <div className="preview-date">Today, 10:42</div>
            <div className="preview-prompt">Make the first-run dashboard useful for a new project.</div>
            <div className="preview-reply">I found three small changes that would make the first step clearer.</div>
            <div className="preview-plan"><b>First-run dashboard plan</b><div><span>01</span> Welcome users to their project <em>app/page.tsx</em></div><div><span>02</span> Offer a useful first prompt <em>components/</em></div><div><span>03</span> Show the next step clearly <em>styles/</em></div></div>
            <div className="preview-reply">Want me to draft the first screen? You can review every suggestion.</div>
            <div className="preview-composer">Message Readcode <span>+</span></div>
          </div>
          <div className="preview-details"><SmileyLogo width={58} height={58} /><b>Readcode</b><div className="detail-tabs"><span>Details</span><span>Project</span><span>Settings</span></div><small>Project context</small><div className="detail-card"><b>readcode-app</b><span>Python API · Next.js frontend</span><span>4 conversations</span></div><small>Current task</small><div className="detail-card"><b>Onboarding flow</b><span>Plan ready for review</span></div></div>
        </div>
      </div>
    </div>
  );
}

const botJobs = [
  { icon: "🔎", tone: "blue", title: "researcher", body: "Reads the docs and source so you get a grounded answer with links to the right files." },
  { icon: "🧰", tone: "orange", title: "code reviewer", body: "Checks a change for bugs, explains what it found, and suggests a practical fix." },
  { icon: "🗺️", tone: "purple", title: "project guide", body: "Maps unfamiliar parts of your codebase and shows you where to make your next change." },
  { icon: "💬", tone: "pink", title: "inbox helper", body: "Turns long issue threads into a clear summary and a draft reply you can review." },
  { icon: "📚", tone: "green", title: "documentation writer", body: "Keeps setup notes and project docs clear as your code and decisions evolve." },
  { icon: "✨", tone: "gold", title: "task planner", body: "Breaks a feature into small steps and keeps the important context close at hand." },
];

function BotJobsShowcase() {
  return (
    <section className="bot-jobs wrap" aria-labelledby="bot-jobs-title">
      <p className="bot-jobs-intro rv">
        Give every assistant a clear role. It learns your project, keeps the context, and helps you move from question to working code.
      </p>
      <div className="bot-jobs-scene rv">
        <article className="bot-jobs-card">
          <span className="bot-jobs-kicker">YOUR PROJECT, WITH A LITTLE HELP</span>
          <h2 id="bot-jobs-title">give each bot a job.</h2>
          <p className="bot-jobs-subtitle">One assistant, one useful role. Start with a question and build from there.</p>
          <div className="bot-jobs-grid">
            {botJobs.map((job) => (
              <div className="bot-job" key={job.title}>
                <span className={`bot-job-icon ${job.tone}`} aria-hidden="true">{job.icon}</span>
                <div><h3>{job.title}</h3><p>{job.body}</p></div>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

function ManyBotsShowcase() {
  return (
    <section className="many-bots wrap" aria-labelledby="many-bots-title">
      <div className="many-bots-heading rv">
        <h2 id="many-bots-title">work with many<br className="many-bots-break" /> bots at once.</h2>
        <p>Start with one. Add another when the work grows. Each has its own chat, job, and memory, and they can all work at the same time.</p>
      </div>
      <div className="many-bots-grid">
        <article className="many-bot-card rv">
          <h3>each bot gets its own computer</h3>
          <p>A browser and a desktop it can use to move through a task. Watch it work, then take control when you like.</p>
          <div className="bot-computer-preview" role="img" aria-label="Preview of a bot working in a browser">
            <div className="bot-preview-top"><span className="mini-bot blue">▣</span><b>nova’s computer</b><span className="live-badge"><i /> live</span><span className="mouse-pill">take the mouse</span></div>
            <code className="browser-address">google.com/travel/flights</code>
            <div className="flight-title"><b>mumbai to lisbon</b><span>cheapest first</span></div>
            <div className="flight-row"><b>9:40</b><span>one stop</span><strong>€84</strong><span className="flight-status held">held</span></div>
            <div className="flight-row"><b>13:05</b><span>direct</span><strong>€112</strong><span className="flight-status">hold</span></div>
            <div className="flight-row"><b>18:20</b><span>direct</span><strong>€139</strong><span className="flight-status">hold</span></div>
          </div>
        </article>

        <article className="many-bot-card rv">
          <h3>ask once and it becomes a routine</h3>
          <p>Run a task on a schedule or when something happens. Your routines keep working in the background.</p>
          <div className="routine-preview" role="img" aria-label="Preview of scheduled bot routines">
            <div className="routine-prompt">summarise my inbox every weekday at 8.</div>
            <div className="routine-row"><span className="mini-bot pink">▣</span><div><b>inbox summary</b><code>every weekday at 8:00</code></div><span className="toggle-on" /></div>
            <div className="routine-row"><span className="mini-bot blue">▣</span><div><b>competitor prices</b><code>every monday at 9:00</code></div><span className="toggle-on" /></div>
            <div className="routine-row"><span className="mini-bot orange">▣</span><div><b>triage new issues</b><code>when a github issue opens</code></div><span className="toggle-on" /></div>
          </div>
        </article>

        <article className="many-bot-card rv">
          <h3>every bot has a memory</h3>
          <p>It keeps notes on your preferences and project. Every note is yours to read and edit.</p>
          <div className="memory-preview" role="img" aria-label="Preview of editable assistant memories">
            <div className="memory-heading"><span className="mini-bot blue">▣</span><b>nova’s notes on you</b><code>3 so far</code><span className="edit-pill">↗ edit</span></div>
            <div className="memory-list">
              <div><p><mark>aisle seat, always.</mark></p><code><mark className="new-tag">new</mark> you said it in chat, just now</code></div>
              <div><p>dana signs off on anything over €500.</p><code>from dana’s email, on tuesday</code></div>
              <div><p>no flights before 7:00. ever.</p><code>you said it twice, last week</code></div>
            </div>
          </div>
        </article>

        <article className="many-bot-card rv">
          <h3>put bots in a group</h3>
          <p>Give several bots one thread and let them hand work to each other. You step in when they need a yes.</p>
          <div className="group-preview" role="img" aria-label="Preview of bots collaborating in a group chat">
            <div className="group-heading"><b># launch</b><code>3 bots and you</code><span><i className="mini-bot orange">▣</i><i className="mini-bot gold">♟</i><i className="mini-bot pink">▣</i></span></div>
            <div className="group-message"><span className="mini-bot orange">▣</span><div><b>rivet <code>9:12</code></b><p>fix is live <mark className="mention gold-mention">@echo</mark> you’re up</p><small>♟　♥ 2</small></div></div>
            <div className="group-message"><span className="mini-bot gold">♟</span><div><b>echo <code>9:13</code></b><p>post drafted. <mark className="mention pink-mention">@juno</mark> can you email the list?</p></div></div>
            <div className="group-message"><span className="mini-bot pink">▣</span><div><b>juno <code>9:14</code></b><p><mark className="mention blue-mention">@you</mark> ready to send to 1,204 people. need a yes first</p></div></div>
          </div>
        </article>
      </div>
    </section>
  );
}

export default function Landing() {
  const ref = useReveal();
  const [platformMenuOpen, setPlatformMenuOpen] = useState(false);
  return (
    <div className="lp" ref={ref}>
      <header className="bar">
        <a className="logo" href="/"><SmileyLogo width={38} height={38} />{brand.name}</a>
        <nav aria-label="main">
          {nav.map((n) => <a key={n.href} href={n.href}>{n.label}</a>)}
          <a className="pill dark" href={navCta.href}>{navCta.label}</a>
        </nav>
      </header>

      <main>
        <section className="hero wrap">
          <div className="availability"><span className="availability-prefix">available on</span><span className="os-label"><Image src="/landing/macos.svg" alt="" width={14} height={14}/>macos</span><span className="availability-dot" aria-hidden="true"/><span className="os-label"><Image src="/landing/windows.svg" alt="" width={13} height={13}/>windows</span><span className="availability-dot" aria-hidden="true"/><span className="os-label"><Image src="/landing/linux.svg" alt="" width={14} height={14}/>linux</span></div>
          <h1 aria-label={hero.title}><span>from idea to code</span></h1>
          <p className="sub">{hero.sub}</p>
          <div className="actions">
            <div className="primary-split"><a className="pill dark" href={hero.primary.href}><Image src="/landing/windows.svg" alt="" width={16} height={16}/>{hero.primary.label}</a><button className="split-toggle" type="button" aria-label="More preview options" aria-expanded={platformMenuOpen} onClick={() => setPlatformMenuOpen((open) => !open)}><Image src="/landing/chevron.svg" alt="" width={15} height={15}/></button>{platformMenuOpen && <div className="platform-menu"><b>Current preview</b><a href="#demo" onClick={() => setPlatformMenuOpen(false)}>Browser preview</a><a href="#models" onClick={() => setPlatformMenuOpen(false)}>Python API details</a></div>}</div>
            <div className="github-star-wrapper">
              <span className="github-star-badge" aria-hidden="true">
                <GithubStar className="github-star-svg" />
              </span>
              <a className="pill github-link" href={hero.secondary.href} target="_blank" rel="noreferrer">{hero.secondary.label}</a>
            </div>
          </div>
          <p className="hint">{hero.hint}</p>
          <AppWindow />
        </section>

        <BotJobsShowcase />
        <ManyBotsShowcase />

        <section className="wrap sec" id="features">
          <h2 className="rv">Built around your projects and questions.</h2>
          <div className="grid">
            {features.map((f, i) => (
              <article key={f.title} className={`card rv t${i % 4}`}>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="wrap sec" id="models">
          <h2 className="rv">Use the model endpoint configured for your app.</h2>
          <ul className="chips rv">{models.map((m) => <li key={m}>{m}</li>)}</ul>
        </section>

        <section className="wrap sec">
          <h2 className="rv">From project to useful answer in three steps.</h2>
          <ol className="steps">
            {steps.map((s, i) => (
              <li key={s.title} className="rv"><span>{i + 1}</span><h3>{s.title}</h3><p>{s.body}</p></li>
            ))}
          </ol>
        </section>

        <section className="wrap sec" id="pricing">
          <h2 className="rv">Prototype today. Product plans later.</h2>
          <div className="plans">
            {plans.map((p) => (
              <article key={p.name} className={`plan rv${p.featured ? " feat" : ""}`}>
                <h3>{p.name}</h3>
                <p className="price">{p.price} <small>{p.note}</small></p>
                <ul>{p.items.map((it) => <li key={it}>{it}</li>)}</ul>
                <a className={`pill${p.featured ? " dark" : ""}`} href="#download">{p.cta}</a>
              </article>
            ))}
          </div>
        </section>

        <section className="wrap sec faq" id="faq">
          <h2 className="rv">Questions.</h2>
          {faq.map((f) => (
            <details key={f.q} className="rv"><summary>{f.q}</summary><p>{f.a}</p></details>
          ))}
        </section>

        <section className="end" id="download">
          <div className="wrap">
            <h2 className="rv">Explore the readcode prototype.</h2>
            <a className="pill dark" href="#features">Explore {brand.name}</a>
          </div>
        </section>
      </main>

      <footer className="foot wrap">
        <div><b>{brand.name}</b><p>{brand.tagline}</p></div>
        {footer.columns.map((c) => (
          <div key={c.title}><b>{c.title}</b>{c.links.map((l) => <a key={l} href="#">{l}</a>)}</div>
        ))}
      </footer>
    </div>
  );
}
