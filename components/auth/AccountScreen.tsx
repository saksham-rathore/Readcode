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
import Image from "next/image";
import Link from "next/link";
import { AgentAvatar, type AgentShape } from "@/components/ui/AgentAvatar";
import { SmileyLogo } from "@/components/ui";
import "./account-screen.css";

type Account = { email: string };

const socialProviders = [
  { id: "google", name: "Google", logo: "/auth/google.png" },
  { id: "github", name: "GitHub", logo: "/auth/github.svg" },
];

const oauthErrors = new Map([
  ["unavailable", "This sign-in provider isn’t configured yet. You can continue with email."],
  ["expired", "Your sign-in request expired. Try starting again."],
  ["cancelled", "Sign-in was cancelled. You can try again or use email."],
  ["account_exists", "Use the sign-in method you originally used for this email."],
  ["email_required", "Verify your primary email with the provider and try again."],
  ["limited", "Too many attempts. Try again in a few minutes."],
  ["failed", "Could not finish social sign-in. Try again or use email."],
]);

const workspaceFeatures = [
  { shape: "mech", title: "Find your starting point", description: "Get oriented in an unfamiliar project." },
  { shape: "flower", title: "Keep answers with your code", description: "Return to conversations from the project they belong to." },
  { shape: "star", title: "Plan the next change", description: "Think through the work before you start building." },
] satisfies { shape: AgentShape; title: string; description: string }[];

export default function AccountScreen({ mode }: { mode: "sign-in" | "sign-up" }) {
  const signingUp = mode === "sign-up";
  const [account, setAccount] = useState<Account | null>(null);
  const [checking, setChecking] = useState(true);
  const [pending, setPending] = useState(false);
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const url = new URL(window.location.href);
    const oauthError = url.searchParams.get("oauth");
    if (oauthError) {
      const text = oauthErrors.get(oauthError);
      if (text) setMessage(text);
      url.searchParams.delete("oauth");
      window.history.replaceState(window.history.state, "", url);
    }
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
      <aside className="account-landscape" aria-labelledby="account-workspace-title">
        <div className="account-workspace">
          <h2 id="account-workspace-title">your AI coding workspace.</h2>
          <ul>
            {workspaceFeatures.map(({ shape, title, description }) => (
              <li key={shape}>
                <span aria-hidden="true"><AgentAvatar type={shape} size={34} /></span>
                <div><strong>{title}</strong><p>{description}</p></div>
              </li>
            ))}
          </ul>
        </div>
        <div className="account-mascot" aria-hidden="true">
          <AgentAvatar type="mech" size={104} seed={0.63} />
        </div>
      </aside>

      <div className="account-main">
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
              <Link href="/workspace" className="account-primary">
                Open workspace <ArrowRightIcon size={17} aria-hidden="true" />
              </Link>
              <button type="button" className="account-sign-out" disabled={pending} onClick={() => void changeSession("DELETE")}>
                {pending ? "Signing out…" : "Sign out"}
              </button>
            </>
          ) : (
            <>
              <h1 id="account-title">{signingUp ? "create your account." : "welcome back."}</h1>
              <p className="account-intro">{signingUp ? "Make a home for your projects and coding conversations." : "Sign in to your Readcode account."}</p>
              <nav className="account-providers" aria-label="Social sign-in">
                {socialProviders.map(({ id, name, logo }) => (
                  <a key={id} href={`/api/account/oauth/${id}?mode=${mode}`}>
                    <Image src={logo} alt="" width={18} height={18} />
                    Continue with {name}
                  </a>
                ))}
              </nav>
              <div className="account-divider">or</div>
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
      </div>
    </main>
  );
}
