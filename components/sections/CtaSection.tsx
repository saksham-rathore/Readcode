import { ArrowUpRight } from "@/components/ui/ArrowUpRight";

export interface CtaSectionProps {
  kicker?: string;
  title?: React.ReactNode;
  description?: string;
  ctaText?: string;
  ctaHref?: string;
  note?: string;
}

export function CtaSection({
  kicker = "THE NEXT STEP IN YOUR CODEBASE",
  title = (
    <>
      Get the context
      <br />
      you’ve been missing.
    </>
  ),
  description = "Be among the first to explore a smarter way to understand your code.",
  ctaText = "Get early access",
  ctaHref = "mailto:hello@readcode.dev?subject=Readcode%20early%20access",
  note = "No setup marathon. Just you and your repo.",
}: CtaSectionProps) {
  return (
    <section className="cta-section" id="get-started">
      <div className="cta-orb" />
      <div className="cta-content">
        <div className="section-kicker">{kicker}</div>
        <h2>{title}</h2>
        <p>{description}</p>
        <a href={ctaHref} className="button button-light">
          {ctaText} <ArrowUpRight />
        </a>
        <span className="cta-note">{note}</span>
      </div>
    </section>
  );
}

export default CtaSection;
