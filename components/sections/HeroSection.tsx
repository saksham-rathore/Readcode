import { ArrowUpRight } from "@/components/ui/ArrowUpRight";
import { ProductPreview } from "@/components/preview/ProductPreview";

export function HeroSection() {
  return (
    <section className="hero section-wrap">
      <div className="hero-copy">
        <div className="hero-kicker">
          <span className="kicker-dot" /> YOUR CODEBASE, IN CONTEXT
        </div>
        <h1>
          Understand your
          <br />
          code at <span>every level.</span>
        </h1>
        <p className="hero-description">
          A coding assistant that knows your entire codebase. Ask how it
          works, trace what depends on what, and get answers you can follow
          back to the source.
        </p>
        <div className="hero-actions">
          <a className="button button-dark" href="#get-started">
            Get early access <ArrowUpRight />
          </a>
          <a className="text-link" href="#product">
            Explore the product <span>↓</span>
          </a>
        </div>
        <div className="hero-proof">
          <span className="proof-avatars">
            <i>R</i>
            <i>J</i>
            <i>M</i>
            <i>+</i>
          </span>
          <span>
            Built for engineers who want
            <br />
            <strong>the full picture.</strong>
          </span>
        </div>
      </div>
      <div className="hero-visual">
        <div className="visual-orbit orbit-one" />
        <div className="visual-orbit orbit-two" />
        <div className="visual-label">
          <span className="label-dot" /> LIVE REPOSITORY CONTEXT
        </div>
        <ProductPreview />
        <div className="floating-note">
          <span className="floating-check">✓</span>
          <span>
            <strong>Grounded in your code</strong>
            <small>4 source files · 12 symbols</small>
          </span>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
