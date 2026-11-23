"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import "./landing.css";
import CloudSky from "@/components/pixel-perfect/cloud-sky";
import { GithubStar } from "@/components/ui/GithubStar";
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
          <div className="preview-details"><Image src="/landing/readcode-mark.svg" alt="" width={48} height={48}/><b>Readcode</b><div className="detail-tabs"><span>Details</span><span>Project</span><span>Settings</span></div><small>Project context</small><div className="detail-card"><b>readcode-app</b><span>Python API · Next.js frontend</span><span>4 conversations</span></div><small>Current task</small><div className="detail-card"><b>Onboarding flow</b><span>Plan ready for review</span></div></div>
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  const ref = useReveal();
  const [platformMenuOpen, setPlatformMenuOpen] = useState(false);
  return (
    <div className="lp" ref={ref}>
      <header className="bar">
        <a className="logo" href="/"><Image src="/landing/readcode-mark.svg" alt="" width={28} height={28}/>{brand.name}</a>
        <nav aria-label="main">
          {nav.map((n) => <a key={n.href} href={n.href}>{n.label}</a>)}
          <a className="pill dark" href={navCta.href}>{navCta.label}</a>
        </nav>
      </header>

      <main>
        <section className="hero wrap">
          <div className="availability"><span>available in browser on</span><span className="os-label"><Image src="/landing/macos.svg" alt="" width={14} height={14}/> macOS</span><i>·</i><span className="os-label"><Image src="/landing/windows.svg" alt="" width={14} height={14}/> Windows</span><i>·</i><span className="os-label"><Image src="/landing/linux.svg" alt="" width={14} height={14}/> Linux</span></div>
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
