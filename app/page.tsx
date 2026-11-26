"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Monitor, Notebook } from "@phosphor-icons/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./landing.css";
import "./workspace-demo.css";
import WorkspaceDemo from "@/components/preview/WorkspaceDemo";
import GettingStarted from "@/components/preview/GettingStarted";
import { GithubStar, SmileyLogo } from "@/components/ui";
import { AgentAvatar, type AgentShape } from "@/components/ui/AgentAvatar";
import { brand, nav, navCta, hero, faq, footer } from "./content";

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger);
    const motion = gsap.matchMedia();
    motion.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.utils.toArray<HTMLElement>(".rv").forEach((element) => {
        gsap.from(element, {
          opacity: 0.55,
          y: 16,
          duration: 0.65,
          ease: "power3.out",
          immediateRender: false,
          clearProps: "opacity,transform",
          scrollTrigger: { trigger: element, start: "top bottom", once: true },
        });
      });
      gsap.from(".hero .availability, .hero h1, .hero .sub, .hero .actions", {
        y: 16,
        opacity: 0,
        duration: 0.7,
        stagger: 0.09,
        ease: "power3.out",
        clearProps: "opacity,transform",
      });
    }, root);
    return () => motion.revert();
  }, []);
  return ref;
}

const modelTape = [
  "OpenAI",
  "Claude",
  "Gemini",
  "Grok",
  "DeepSeek",
  "Qwen",
  "OpenCode",
  "Your API key",
];
const modelSymbols = ["✳", "✺", "✦", "◉", "◈", "✣", "◇", "⌘"];

function ModelRow() {
  return (
    <div className="wrap model-row">
      <span>bring your model</span>
      <ul aria-label="Model options">
        {modelTape.slice(0, -2).map((name, index) => (
          <li key={name}>
            <span
              className={`model-symbol model-symbol-${index}`}
              aria-hidden="true"
            >
              {modelSymbols[index]}
            </span>
            {name}
          </li>
        ))}
        <li>
          <a href="#models">
            or use your own API key <span aria-hidden="true">↗</span>
          </a>
        </li>
      </ul>
    </div>
  );
}

function ModelTape() {
  const track = useRef<HTMLDivElement>(null);
  const tween = useRef<gsap.core.Tween | null>(null);
  const pausedRef = useRef(false);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const motion = gsap.matchMedia();
    motion.add("(prefers-reduced-motion: no-preference)", () => {
      tween.current = gsap.to(track.current, {
        xPercent: -100 / 3,
        duration: 28,
        ease: "none",
        repeat: -1,
        paused: pausedRef.current,
      });
      return () => { tween.current = null; };
    });
    return () => motion.revert();
  }, []);
  function toggle() {
    pausedRef.current = !pausedRef.current;
    tween.current?.paused(pausedRef.current);
    setPaused(pausedRef.current);
  }
  return (
    <section className="model-showcase" id="models">
      <div className="wrap">
        <h2 className="rv">
          bring the AI
          <br />
          you already use.
        </h2>
      </div>
      <div className="model-tape" aria-label="Models and endpoints">
        <div className="model-tape-track" ref={track}>
          {[0, 1, 2].map((copy) => (
            <div className="model-tape-set" key={copy} aria-hidden={copy !== 0}>
              {modelTape.map((name, i) => (
                <span className="model-tape-item" key={name}>
                  <i>{modelSymbols[i]}</i>
                  {name}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="model-copy wrap">
        <p>Use the model endpoint configured for your Readcode project.</p>
        <p>Keep each answer connected to its conversation and project.</p>
        <div>
          <p>Bring your own API key through the backend configuration.</p>
          <button type="button" onClick={toggle}>
            {paused ? "play the tape" : "pause the tape"}
          </button>
        </div>
      </div>
    </section>
  );
}

function SleepingCat() {
  return (
    <div className="pricing-cat" aria-hidden="true">
      <span className="cat-z cat-z-one">z</span>
      <span className="cat-z cat-z-two">z</span>
      <svg viewBox="0 0 128 70" shapeRendering="crispEdges">
        <g className="cat-tail">
          <path d="M14 48H4V38H0V29H8V38H18Z" fill="#ef8e36" />
          <path d="M4 41H11V48H4Z" fill="#ffc17c" />
        </g>
        <path
          d="M20 35H30V24H42V18H53V25H78V19H91V28H102V37H112V53H105V59H37V55H24V48H18Z"
          fill="#f99a43"
        />
        <path
          d="M31 31H42V26H53V31H79V26H89V34H99V42H109V51H97V55H39V49H27V41H22V35H31Z"
          fill="#ffc17c"
        />
        <path
          d="M44 27H54V36H44ZM69 27H78V35H69ZM88 35H97V44H88Z"
          fill="#ea8334"
        />
        <path d="M35 47H48V51H35ZM76 47H94V51H76Z" fill="#ee8b38" />
        <path d="M43 42H54V45H43ZM78 42H89V45H78Z" fill="#85543e" />
        <path d="M62 45H67V48H62Z" fill="#d57669" />
        <path d="M55 56H68V60H55ZM82 55H95V59H82Z" fill="#fff0d5" />
      </svg>
    </div>
  );
}

const priceFeatures = [
  [
    "Project workspaces",
    "AI conversation through your configured provider",
    "No trial timer",
  ],
  [
    "Everything in free",
    "Planned always-on cloud workspace",
    "Planned scheduled routines",
    "Planned remote access",
  ],
  [
    "Everything in plus",
    "Planned larger workloads",
    "Planned priority capacity",
    "Planned work license",
  ],
];

function PricingShowcase() {
  const [yearly, setYearly] = useState(false);
  const tiers = [
    {
      name: "free",
      desc: "Explore Readcode on your own projects.",
      price: "$0",
      note: "forever. no card needed.",
      action: "explore the preview",
      href: "#demo",
    },
    {
      name: "plus",
      desc: "A planned home for work that keeps going.",
      price: yearly ? "$17" : "$20",
      note: "a month, concept price",
      action: "see the roadmap",
      href: "#faq",
    },
    {
      name: "pro",
      desc: "Planned capacity for heavier work.",
      price: yearly ? "$42" : "$50",
      note: "a month, concept price",
      action: "see the roadmap",
      href: "#faq",
    },
  ];
  return (
    <section
      className="pricing-showcase wrap"
      id="pricing"
      aria-labelledby="pricing-title"
    >
      <div className="pricing-heading">
        <h2 className="rv" id="pricing-title">
          start free. grow with
          <br />
          your projects.
        </h2>
        <div className="pricing-switch" aria-label="Billing example">
          <button
            className={!yearly ? "active" : ""}
            aria-pressed={!yearly}
            onClick={() => setYearly(false)}
          >
            monthly
          </button>
          <button
            className={yearly ? "active" : ""}
            aria-pressed={yearly}
            onClick={() => setYearly(true)}
          >
            yearly <span>2 months free</span>
          </button>
        </div>
      </div>
      <div className="pricing-grid">
        {tiers.map((tier, index) => (
          <article className="pricing-card rv" key={tier.name}>
            {index === 0 && <SleepingCat />}
            <div className="pricing-landscape" aria-hidden="true" />
            <div className="pricing-card-content">
              <h3>{tier.name}</h3>
              <p className="pricing-description">{tier.desc}</p>
              <div className="pricing-amount">
                <strong>{tier.price}</strong>
                <span>{tier.note}</span>
              </div>
              <a className="pricing-action" href={tier.href}>
                {tier.action}
              </a>
              <ul>
                {priceFeatures[index].map((feature) => (
                  <li key={feature}>
                    <span>✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
      <p className="pricing-disclaimer">
        Plus and Pro prices show a design concept. Paid plans are not available
        yet.
      </p>
    </section>
  );
}

const botJobs = [
  {
    icon: "🔎",
    tone: "blue",
    title: "researcher",
    body: "Reads the docs and source so you get a grounded answer with links to the right files.",
  },
  {
    icon: "🧰",
    tone: "orange",
    title: "code reviewer",
    body: "Checks a change for bugs, explains what it found, and suggests a practical fix.",
  },
  {
    icon: "🗺️",
    tone: "purple",
    title: "project guide",
    body: "Maps unfamiliar parts of your codebase and shows you where to make your next change.",
  },
  {
    icon: "💬",
    tone: "pink",
    title: "inbox helper",
    body: "Turns long issue threads into a clear summary and a draft reply you can review.",
  },
  {
    icon: "📚",
    tone: "green",
    title: "documentation writer",
    body: "Keeps setup notes and project docs clear as your code and decisions evolve.",
  },
  {
    icon: "✨",
    tone: "gold",
    title: "task planner",
    body: "Breaks a feature into small steps and keeps the important context close at hand.",
  },
];
const jobShapes: AgentShape[] = [
  "ghost",
  "flower",
  "star",
  "clover",
  "hexagon",
  "square",
];
const placeShapes: Record<string, AgentShape> = {
  Scout: "ghost",
  Builder: "star",
  Reviewer: "flower",
  Readcode: "clover",
  You: "square",
  Planner: "hexagon",
};

function BotJobsShowcase() {
  return (
    <section className="bot-jobs wrap" aria-labelledby="bot-jobs-title">
      <p className="bot-jobs-intro rv">
        Give a bot{" "}
        <span className="bot-intro-roster" aria-hidden="true">
          <AgentAvatar type="ghost" size={36} seed={0.2} />
          <AgentAvatar type="mech" size={36} seed={0.5} />
          <AgentAvatar type="clover" size={36} seed={0.8} />
        </span>{" "}
        a job. Ask about your project{" "}
        <span className="bot-intro-icon bot-intro-screen" aria-hidden="true">
          <Monitor weight="duotone" />
        </span>{" "}
        and keep notes{" "}
        <span className="bot-intro-icon bot-intro-notes" aria-hidden="true">
          <Notebook weight="duotone" />
        </span>{" "}
        close to the code they belong to.
      </p>
      <div className="bot-jobs-scene rv">
        <article className="bot-jobs-card">
          <h2 id="bot-jobs-title">give each bot a job.</h2>
          <p className="bot-jobs-subtitle">
            One assistant, one useful role. Start with a question and build from
            there.
          </p>
          <div className="bot-jobs-grid">
            {botJobs.map((job, index) => (
              <div className="bot-job" key={job.title}>
                <span className="bot-job-avatar" aria-hidden="true">
                  <AgentAvatar
                    type={jobShapes[index]}
                    size={36}
                    seed={index / botJobs.length}
                  />
                </span>
                <div>
                  <h3>{job.title}</h3>
                  <p>{job.body}</p>
                </div>
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
        <h2 id="many-bots-title">
          work with many
          <br className="many-bots-break" /> bots at once.
        </h2>
        <p>
          Start with one. Add another when the work grows. Each has its own
          chat, job, and memory, and they can all work at the same time.
        </p>
      </div>
      <div className="many-bots-grid">
        <article className="many-bot-card rv">
          <h3>each bot gets its own computer</h3>
          <p>
            A browser and a desktop it can use to move through a task. Watch it
            work, then take control when you like.
          </p>
          <div
            className="bot-computer-preview"
            role="img"
            aria-label="Preview of a bot working in a browser"
          >
            <div className="bot-preview-top">
              <span className="mini-bot blue">▣</span>
              <b>nova’s computer</b>
              <span className="live-badge">
                <i /> live
              </span>
              <span className="mouse-pill">take the mouse</span>
            </div>
            <code className="browser-address">google.com/travel/flights</code>
            <div className="flight-title">
              <b>mumbai to lisbon</b>
              <span>cheapest first</span>
            </div>
            <div className="flight-row">
              <b>9:40</b>
              <span>one stop</span>
              <strong>€84</strong>
              <span className="flight-status held">held</span>
            </div>
            <div className="flight-row">
              <b>13:05</b>
              <span>direct</span>
              <strong>€112</strong>
              <span className="flight-status">hold</span>
            </div>
            <div className="flight-row">
              <b>18:20</b>
              <span>direct</span>
              <strong>€139</strong>
              <span className="flight-status">hold</span>
            </div>
          </div>
        </article>

        <article className="many-bot-card rv">
          <h3>ask once and it becomes a routine</h3>
          <p>
            Run a task on a schedule or when something happens. Your routines
            keep working in the background.
          </p>
          <div
            className="routine-preview"
            role="img"
            aria-label="Preview of scheduled bot routines"
          >
            <div className="routine-prompt">
              summarise my inbox every weekday at 8.
            </div>
            <div className="routine-row">
              <span className="mini-bot pink">▣</span>
              <div>
                <b>inbox summary</b>
                <code>every weekday at 8:00</code>
              </div>
              <span className="toggle-on" />
            </div>
            <div className="routine-row">
              <span className="mini-bot blue">▣</span>
              <div>
                <b>competitor prices</b>
                <code>every monday at 9:00</code>
              </div>
              <span className="toggle-on" />
            </div>
            <div className="routine-row">
              <span className="mini-bot orange">▣</span>
              <div>
                <b>triage new issues</b>
                <code>when a github issue opens</code>
              </div>
              <span className="toggle-on" />
            </div>
          </div>
        </article>

        <article className="many-bot-card rv">
          <h3>every bot has a memory</h3>
          <p>
            It keeps notes on your preferences and project. Every note is yours
            to read and edit.
          </p>
          <div
            className="memory-preview"
            role="img"
            aria-label="Preview of editable assistant memories"
          >
            <div className="memory-heading">
              <span className="mini-bot blue">▣</span>
              <b>nova’s notes on you</b>
              <code>3 so far</code>
              <span className="edit-pill">↗ edit</span>
            </div>
            <div className="memory-list">
              <div>
                <p>
                  <mark>aisle seat, always.</mark>
                </p>
                <code>
                  <mark className="new-tag">new</mark> you said it in chat, just
                  now
                </code>
              </div>
              <div>
                <p>dana signs off on anything over €500.</p>
                <code>from dana’s email, on tuesday</code>
              </div>
              <div>
                <p>no flights before 7:00. ever.</p>
                <code>you said it twice, last week</code>
              </div>
            </div>
          </div>
        </article>

        <article className="many-bot-card rv">
          <h3>put bots in a group</h3>
          <p>
            Give several bots one thread and let them hand work to each other.
            You step in when they need a yes.
          </p>
          <div
            className="group-preview"
            role="img"
            aria-label="Preview of bots collaborating in a group chat"
          >
            <div className="group-heading">
              <b># launch</b>
              <code>3 bots and you</code>
              <span>
                <i className="mini-bot orange">▣</i>
                <i className="mini-bot gold">♟</i>
                <i className="mini-bot pink">▣</i>
              </span>
            </div>
            <div className="group-message">
              <span className="mini-bot orange">▣</span>
              <div>
                <b>
                  rivet <code>9:12</code>
                </b>
                <p>
                  fix is live{" "}
                  <mark className="mention gold-mention">@echo</mark> you’re up
                </p>
                <small>♟　♥ 2</small>
              </div>
            </div>
            <div className="group-message">
              <span className="mini-bot gold">♟</span>
              <div>
                <b>
                  echo <code>9:13</code>
                </b>
                <p>
                  post drafted.{" "}
                  <mark className="mention pink-mention">@juno</mark> can you
                  email the list?
                </p>
              </div>
            </div>
            <div className="group-message">
              <span className="mini-bot pink">▣</span>
              <div>
                <b>
                  juno <code>9:14</code>
                </b>
                <p>
                  <mark className="mention blue-mention">@you</mark> ready to
                  send to 1,204 people. need a yes first
                </p>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

const workspacePlaces = [
  {
    title: "in your projects",
    body: "Keep each project, question, and next step together in one clear workspace.",
    href: "#demo",
    action: "explore the workspace",
    host: "Project workspace",
    detail: "Your work stays in context",
    status: "Ready",
    tone: "blue",
    updates: [
      ["Scout", "Mapped the codebase", "9:12"],
      ["Builder", "Dashboard plan ready", "9:08"],
      ["Reviewer", "Checked the changes", "8:45"],
    ],
  },
  {
    title: "in every conversation",
    body: "Ask a coding question and keep the answer close to the work it belongs to.",
    href: "#models",
    action: "see how it works",
    host: "Project conversation",
    detail: "Pick up where you left off",
    status: "Active",
    tone: "green",
    updates: [
      ["Readcode", "Found the entry point", "9:14"],
      ["You", "What handles checkout?", "9:11"],
      ["Readcode", "Explained the flow", "9:06"],
    ],
  },
  {
    title: "alongside your code",
    body: "Review a clear plan before the next change, with the relevant files in view.",
    href: "#faq",
    action: "read the details",
    host: "Review space",
    detail: "You make the next move",
    status: "Preview",
    tone: "orange",
    updates: [
      ["Planner", "Outlined three steps", "9:17"],
      ["Scout", "Located the files", "9:12"],
      ["Readcode", "Answer ready to review", "9:05"],
    ],
  },
];

function WorkspacePlaces() {
  return (
    <section
      className="workspace-places wrap"
      id="features"
      aria-labelledby="workspace-places-title"
    >
      <h2 className="rv" id="workspace-places-title">
        where your work lives.
      </h2>
      <div className="places-grid">
        {workspacePlaces.map((place, index) => (
          <article className={`place-card rv place-${index}`} key={place.title}>
            <div className="place-visual" aria-hidden="true">
              <div className="place-activity">
                {place.updates.map(([name, note, time], row) => (
                  <div className="place-update" key={name + note}>
                    <AgentAvatar
                      type={placeShapes[name]}
                      size={32}
                      seed={(index * 3 + row) / 9}
                    />
                    <span className="place-update-copy">
                      <b>{name}</b>
                      <small>{note}</small>
                    </span>
                    <time>{time}</time>
                  </div>
                ))}
                <div className="place-host">
                  <span className="place-host-icon">▣</span>
                  <span>
                    <b>{place.host}</b>
                    <small>{place.detail}</small>
                  </span>
                  <em className={`place-state ${place.tone}`}>
                    {place.status}
                  </em>
                </div>
              </div>
            </div>
            <h3>{place.title}</h3>
            <p>{place.body}</p>
            <a href={place.href}>
              {place.action} <span aria-hidden="true">→</span>
            </a>
          </article>
        ))}
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
        <Link className="logo" href="/">
          <SmileyLogo width={28} height={28} />
          {brand.name}
        </Link>
        <nav aria-label="main">
          {nav.map((n) => (
            <a key={n.href} href={n.href}>
              {n.label}
            </a>
          ))}
          <Link className="pill dark" href={navCta.href}>
            {navCta.label}
          </Link>
        </nav>
      </header>

      <main>
        <section className="hero wrap">
          <div className="availability">
            <span className="availability-prefix">available on</span>
            <span className="os-label">
              <Image src="/landing/macos.svg" alt="" width={14} height={14} />
              macos
            </span>
            <span className="availability-dot" aria-hidden="true" />
            <span className="os-label">
              <Image src="/landing/windows.svg" alt="" width={13} height={13} />
              windows
            </span>
            <span className="availability-dot" aria-hidden="true" />
            <span className="os-label">
              <Image src="/landing/linux.svg" alt="" width={14} height={14} />
              linux
            </span>
          </div>
          <h1 aria-label={hero.title}>
            <span>from idea to code</span>
          </h1>
          <p className="sub">{hero.sub}</p>
          <div className="actions">
            <div className="primary-split">
              <a className="pill dark" href={hero.primary.href}>
                <Image
                  src="/landing/windows.svg"
                  alt=""
                  width={16}
                  height={16}
                />
                {hero.primary.label}
              </a>
              <button
                className="split-toggle"
                type="button"
                aria-label="More preview options"
                aria-expanded={platformMenuOpen}
                onClick={() => setPlatformMenuOpen((open) => !open)}
              >
                <Image
                  src="/landing/chevron.svg"
                  alt=""
                  width={15}
                  height={15}
                />
              </button>
              {platformMenuOpen && (
                <div className="platform-menu">
                  <b>Current preview</b>
                  <a href="#demo" onClick={() => setPlatformMenuOpen(false)}>
                    Browser preview
                  </a>
                  <a href="#models" onClick={() => setPlatformMenuOpen(false)}>
                    Python API details
                  </a>
                </div>
              )}
            </div>
            <div className="github-star-wrapper">
              <span className="github-star-badge" aria-hidden="true">
                <GithubStar className="github-star-svg" />
              </span>
              <a
                className="pill github-link"
                href={hero.secondary.href}
                target="_blank"
                rel="noreferrer"
              >
                {hero.secondary.label}
              </a>
            </div>
          </div>
          <p className="hint">{hero.hint}</p>
          <WorkspaceDemo />
        </section>

        <ModelRow />
        <BotJobsShowcase />
        <ManyBotsShowcase />

        <WorkspacePlaces />

        <ModelTape />
        <PricingShowcase />

        <GettingStarted />

        <section
          className="wrap faq-showcase"
          id="faq"
          aria-labelledby="faq-title"
        >
          <div className="faq-intro rv">
            <h2 id="faq-title">questions.</h2>
            <p>
              Stuck on something else? Explore the{" "}
              <a
                href="https://github.com/saksham-rathore/Readcode"
                target="_blank"
                rel="noreferrer"
              >
                project repository
              </a>
              .
            </p>
            <div className="faq-mech" aria-hidden="true">
              <AgentAvatar type="mech" size={115} color="#8954ee" seed={0.63} />
            </div>
          </div>
          <div className="faq-accordion rv">
            {faq.map((f) => (
              <details key={f.q} name="readcode-faq">
                <summary>
                  {f.q}
                  <span className="faq-plus" aria-hidden="true" />
                </summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <footer className="readcode-footer">
        <div className="footer-panel">
          <div className="footer-grid">
            <div className="footer-brand">
              <Link href="/" className="footer-wordmark">
                <SmileyLogo width={30} height={30} />
                {brand.name}
              </Link>
              <p>{brand.tagline}.</p>
              <a href={`mailto:${footer.email}`}>{footer.email}</a>
            </div>
            <nav className="footer-nav" aria-label="Footer">
              {footer.columns.map(({ title, links }) => (
                <div key={title}>
                  <h2>{title}</h2>
                  <ul>
                    {links.map(({ href, label }) => (
                      <li key={label}>
                        <a href={href}>{label}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>
          <p className="footer-note">
            The bots, conversations, and activity shown on this page are
            examples from the Readcode prototype.
          </p>
          <div className="footer-oversized" aria-hidden="true">
            {brand.name}
          </div>
        </div>
      </footer>
    </div>
  );
}
