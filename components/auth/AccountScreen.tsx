"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { AgentAvatar, type AgentShape } from "@/components/ui/AgentAvatar";
import { SmileyLogo } from "@/components/ui";
import "./account-screen.css";

const highlights: { shape: AgentShape; title: string; text: string }[] = [
  { shape: "mech", title: "find your way around", text: "Get a clear starting point in an unfamiliar project." },
  { shape: "flower", title: "keep your context close", text: "Keep coding questions and answers with their project." },
  { shape: "star", title: "plan your next move", text: "Think through a change before you start building." },
];

export default function AccountScreen({ mode }: { mode: "sign-in" | "sign-up" }) {
  const signingUp = mode === "sign-up";
  const [notice, setNotice] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("Email accounts aren’t available in this preview. You can explore the workspace without an account.");
  }

  return (
    <main className="account-page">
      <aside className="account-landscape" aria-label="About Readcode">
        <div className="account-feature-card">
          <h2>your AI coding workspace.</h2>
          <ul>
            {highlights.map(({ shape, title, text }, index) => (
              <li key={shape}>
                <span aria-hidden="true"><AgentAvatar type={shape} size={36} seed={index / 3} /></span>
                <div><strong>{title}</strong><p>{text}</p></div>
              </li>
            ))}
          </ul>
        </div>
        <div className="account-mascot" aria-hidden="true">
          <AgentAvatar type="mech" size={112} color="#4385fb" />
        </div>
      </aside>

      <div className="account-main">
        <header className="account-header">
          <Link href="/" className="account-brand"><SmileyLogo width={28} height={28} /> readcode</Link>
          <Link href="/" className="account-back"><span aria-hidden="true">←</span> back to readcode</Link>
        </header>

        <section className="account-content" aria-labelledby="account-title">
          <h1 id="account-title">{signingUp ? "create your account." : "welcome back."}</h1>
          <p className="account-intro">{signingUp ? "Make a home for your projects and coding conversations." : "Sign in to pick up where you left off."}</p>

          <div className="account-providers" aria-label="Sign-in providers">
            <button type="button" onClick={() => setNotice("Google sign-in isn’t available in this preview.")}><span className="account-google" aria-hidden="true">G</span> continue with Google</button>
            <button type="button" onClick={() => setNotice("Apple sign-in isn’t available in this preview.")}><Image src="/landing/macos.svg" alt="" width={16} height={16} /> continue with Apple</button>
          </div>

          <div className="account-divider">or</div>
          <form className="account-form" onSubmit={submit}>
            <label htmlFor="account-email">email</label>
            <input type="email" id="account-email" autoComplete="email" placeholder="you@example.com" required />
            <button type="submit">continue with email</button>
          </form>

          {notice && <p className="account-notice" role="status">{notice}</p>}
          <p className="account-switch">
            {signingUp ? "Already have an account?" : "New to Readcode?"}{" "}
            <Link href={signingUp ? "/sign-in" : "/sign-up"}>{signingUp ? "sign in" : "sign up"}</Link>
          </p>
        </section>

        <footer className="account-footer">Account preview · <Link href="/#demo">explore Readcode without an account</Link></footer>
      </div>
    </main>
  );
}
