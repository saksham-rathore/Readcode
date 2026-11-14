import { ArrowUpRight } from "@/components/ui/ArrowUpRight";

export interface CapabilityItem {
  number: string;
  title: string;
  text: string;
}

export const defaultCapabilities: CapabilityItem[] = [
  {
    number: "01",
    title: "Code-aware, by design.",
    text: "We understand symbols, call sites, and file structure. Not just chunks of text. Ask how things work and get answers grounded in your actual code.",
  },
  {
    number: "02",
    title: "Every answer has receipts.",
    text: "Follow each explanation to the exact file and line. See the dependencies, related symbols, and context behind every response.",
  },
  {
    number: "03",
    title: "Your whole repo. In context.",
    text: "From API contracts and README files to commit history and dependency graphs, the complete picture is ready when you are.",
  },
];

export interface ValueSectionProps {
  capabilities?: CapabilityItem[];
}

export function ValueSection({
  capabilities = defaultCapabilities,
}: ValueSectionProps) {
  return (
    <section className="section-wrap value-section" id="product">
      <div className="section-intro">
        <div className="section-kicker">A BETTER WAY TO NAVIGATE</div>
        <h2>
          Your codebase has
          <br />
          the answers.
        </h2>
        <p>
          Readcode connects the dots across your repository so you can spend
          less time searching and more time building.
        </p>
        <a className="inline-link" href="#how-it-works">
          See what Readcode understands <span>→</span>
        </a>
      </div>
      <div className="capability-list">
        {capabilities.map((item) => (
          <article className="capability" key={item.number}>
            <span className="cap-number">{item.number}</span>
            <div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
            <span className="cap-arrow">
              <ArrowUpRight />
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}

export default ValueSection;
