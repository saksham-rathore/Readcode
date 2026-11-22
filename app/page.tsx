"use client";

import { useEffect, useRef } from "react";
import "./landing.css";
import { brand, nav, hero, features, models, steps, plans, faq, footer } from "./content";

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
    <div className="win" aria-hidden="true">
      <div className="win-bar"><i /><i /><i /><span>auth-refactor</span></div>
      <div className="win-body">
        <aside>
          <b>Threads</b>
          <p className="on">Fix login redirect</p>
          <p>Add rate limiting</p>
          <p>Migrate to zod</p>
        </aside>
        <div className="diff">
          <code className="ln del">- if (user) router.push("/home")</code>
          <code className="ln add">+ if (user) router.replace(next ?? "/home")</code>
          <code className="ln add">+ // keep the page the user came from</code>
          <div className="ask"><span>Run npm test?</span><button>Allow</button><button className="ghost">Skip</button></div>
          <div className="composer">Tell the agent what to change…</div>
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  const ref = useReveal();
  return (
    <div className="lp" ref={ref}>
      <header className="bar">
        <a className="logo" href="/">{brand.name}</a>
        <nav aria-label="main">
          {nav.map((n) => <a key={n.href} href={n.href}>{n.label}</a>)}
          <a className="pill dark" href={hero.primary.href}>{hero.primary.label}</a>
        </nav>
      </header>

      <main>
        <section className="hero wrap">
          <h1>{hero.title}</h1>
          <p className="sub">{hero.sub}</p>
          <div className="actions">
            <a className="pill dark" href={hero.primary.href}>{hero.primary.label}</a>
            <a className="pill" href={hero.secondary.href}>{hero.secondary.label}</a>
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
