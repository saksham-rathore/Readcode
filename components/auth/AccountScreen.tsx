"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  EnvelopeSimpleIcon,
  EyeIcon,
  EyeSlashIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { SmileyLogo } from "@/components/ui";
import "./account-screen.css";

type Account = { email: string };

export default function AccountScreen({ mode }: { mode: "sign-in" | "sign-up" }) {
  const signingUp = mode === "sign-up";
  const [account, setAccount] = useState<Account | null>(null);
  const [checking, setChecking] = useState(true);
  const [pending, setPending] = useState(false);
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/account", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error();
        const { account } = await response.json();
        if (!controller.signal.aborted) setAccount(account);
      })
      .catch(() => {
        if (!controller.signal.aborted) setMessage("Could not check your session. You can sign in again.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setChecking(false);
      });
    return () => controller.abort();
  }, []);

  async function changeSession(method: "POST" | "DELETE", form?: FormData) {
    setPending(true);
    setMessage("");
    try {
      const response = await fetch("/api/account", {
        method,
        ...(form && {
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode, email: form.get("email"), password: form.get("password") }),
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        setMessage(result.message ?? "Something went wrong. Try again in a moment.");
        return;
      }
      setAccount(result.account);
      setVisible(false);
    } catch {
      setMessage("Could not connect to Readcode. Try again in a moment.");
    } finally {
      setPending(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!checking && !pending) void changeSession("POST", new FormData(event.currentTarget));
  }

  return (
    <main className="account-page">
      <header className="account-header">
        <Link href="/" className="account-brand"><SmileyLogo width={28} height={28} /> readcode</Link>
        <Link href="/" className="account-back">
          <ArrowLeftIcon size={16} aria-hidden="true" /> Back to Readcode
        </Link>
      </header>

      <section className="account-content" aria-labelledby="account-title">
        {account ? (
          <>
            <span className="account-heading-icon"><CheckCircleIcon size={24} weight="duotone" aria-hidden="true" /></span>
            <h1 id="account-title">you’re signed in.</h1>
            <p className="account-intro">Signed in as <strong className="account-email">{account.email}</strong>.</p>
            <Link href="/#demo" className="account-primary">
              Explore the workspace preview <ArrowRightIcon size={17} aria-hidden="true" />
            </Link>
            <button type="button" className="account-sign-out" disabled={pending} onClick={() => void changeSession("DELETE")}>
              {pending ? "Signing out…" : "Sign out"}
            </button>
          </>
        ) : (
          <>
            <h1 id="account-title">{signingUp ? "create your account." : "welcome back."}</h1>
            <p className="account-intro">{signingUp ? "Make a home for your projects and coding conversations." : "Sign in to your Readcode account."}</p>
            <form className="account-form" method="post" action="/api/account" onSubmit={submit}>
              <label htmlFor="account-email">Email</label>
              <div className="account-input">
                <EnvelopeSimpleIcon className="account-input-icon" size={19} aria-hidden="true" />
                <input type="email" id="account-email" name="email" autoComplete="username" placeholder="you@example.com" maxLength={254} required />
              </div>
              <label htmlFor="account-password">Password</label>
              <div className="account-input">
                <input
                  id="account-password"
                  name="password"
                  type={visible ? "text" : "password"}
                  autoComplete={signingUp ? "new-password" : "current-password"}
                  aria-describedby={signingUp ? "account-password-hint" : undefined}
                  minLength={signingUp ? 15 : undefined}
                  maxLength={128}
                  required
                />
                <button type="button" className="account-password-toggle" aria-label={visible ? "Hide password" : "Show password"} onClick={() => setVisible(!visible)}>
                  {visible ? <EyeSlashIcon size={20} aria-hidden="true" /> : <EyeIcon size={20} aria-hidden="true" />}
                </button>
              </div>
              {signingUp && <p className="account-hint" id="account-password-hint">Use at least 15 characters.</p>}
              <button type="submit" className="account-primary" disabled={checking || pending}>
                {pending ? (signingUp ? "Creating account…" : "Signing in…") : (signingUp ? "Create account" : "Sign in")}
                <ArrowRightIcon size={17} aria-hidden="true" />
              </button>
            </form>
          </>
        )}

        {message && (
          <p className="account-notice" role="alert">
            <WarningCircleIcon size={18} aria-hidden="true" /> {message}
          </p>
        )}
        {!account && (
          <div className="account-links">
            <p>{signingUp ? "Already have an account?" : "New to Readcode?"}{" "}
              <Link href={signingUp ? "/sign-in" : "/sign-up"}>{signingUp ? "Sign in" : "Sign up"}</Link>
            </p>
            <Link href="/#faq">Help</Link>
          </div>
        )}
      </section>

      <footer className="account-footer"><Link href="/#demo">Explore Readcode without an account</Link></footer>
    </main>
  );
}
