import Image from "next/image";
import { AgentAvatar } from "@/components/ui/AgentAvatar";

const shapes = ["clover", "mech", "ghost", "flower", "star", "hexagon"] as const;
const deviceAgents = ["Builder", "Scout", "Reviewer"];

function Device({ kind }: { kind: "laptop" | "desktop" }) {
  const laptop = kind === "laptop";
  return (
    <div className={`setup-device setup-${kind}`}>
      <div className="setup-screen">
        <div className="setup-screen-rail">
          {deviceAgents.map((name) => (
            <span key={name}><i className="setup-agent-mark" />{name}</span>
          ))}
        </div>
        <div className="setup-screen-chat">
          <b className="setup-chat-title">Builder</b>
          <span className="setup-chat-prompt">Where should I start?</span>
          <div className="setup-chat-response">
            <i className="setup-agent-mark" />
            <span className="setup-chat-reply">Start with app/page.tsx. I’ll guide you from there.</span>
          </div>
          <span className="setup-chat-input">Message Builder</span>
        </div>
      </div>
      <div className="setup-device-base">
        {laptop && <div className="setup-keyboard">
          {Array.from({ length: 20 }, (_, key) => <span key={key} />)}
        </div>}
      </div>
      <div className="setup-platform">
        {(laptop ? ["macos"] : ["windows", "linux"]).map(os => (
          <Image key={os} src={`/landing/${os}.svg`} width={12} height={12} alt="" />
        ))}
        {laptop ? "macOS" : "Windows and Linux"}
      </div>
    </div>
  );
}

export default function GettingStarted() {
  return (
    <section className="wrap setup-showcase" id="getting-started" aria-labelledby="setup-title">
      <h2 id="setup-title" className="rv">from a fresh project<br />to your first answer.</h2>
      <ol className="setup-steps">
        <li className="rv">
          <span className="setup-number" aria-hidden="true">1</span>
          <h3>open the preview</h3>
          <p>Try the Readcode workspace right in your browser.</p>
          <a className="setup-example setup-cta" href="#demo">open demo <span aria-hidden="true">↗</span></a>
        </li>
        <li className="rv">
          <span className="setup-number" aria-hidden="true">2</span>
          <h3>bring your AI</h3>
          <p>For your own setup, connect an OpenAI-compatible model endpoint.</p>
          <a className="setup-example setup-model" href="#models">✦ model options</a>
        </li>
        <li className="rv">
          <span className="setup-number" aria-hidden="true">3</span>
          <h3>meet your bots</h3>
          <p>Explore the different agent roles in the workspace demo.</p>
          <div className="setup-example setup-bots" aria-hidden="true">
            {shapes.map((type, index) => <AgentAvatar key={type} type={type} size={36} seed={index / shapes.length} />)}
          </div>
        </li>
        <li className="rv">
          <span className="setup-number" aria-hidden="true">4</span>
          <h3>give it something real</h3>
          <p>Ask about a file, a feature, or the next change you want to make.</p>
          <p className="setup-example setup-prompt">“where should I start with this project?”</p>
        </li>
      </ol>

      <div className="setup-devices-heading rv">
        <h3>one workspace.<br />every computer.</h3>
        <p>The browser preview works on macOS, Windows, and Linux. Try the same Readcode demo wherever you work.</p>
      </div>
      <figure className="setup-scene rv" aria-label="Readcode shown on a Mac laptop and a Windows or Linux desktop">
        <div className="setup-devices" aria-hidden="true"><Device kind="laptop" /><Device kind="desktop" /></div>
      </figure>
    </section>
  );
}
