import { ArrowUpRight } from "@/components/ui/ArrowUpRight";

export interface SiteHeaderProps {
  workspace?: string;
  currentSection?: string;
  ctaText?: string;
  ctaHref?: string;
}

export function SiteHeader({
  workspace = "Workspace",
  currentSection = "Overview",
  ctaText = "Get early access",
  ctaHref = "#get-started",
}: SiteHeaderProps) {
  return (
    <header className="site-header">
      <div className="center-header">
        <span className="center-breadcrumb">
          <span>{workspace}</span>
          <i>/</i>
          <strong>{currentSection}</strong>
        </span>
        <a className="button button-dark button-nav" href={ctaHref}>
          {ctaText} <ArrowUpRight />
        </a>
      </div>
    </header>
  );
}

export default SiteHeader;
