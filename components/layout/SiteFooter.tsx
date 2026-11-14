import { BrandMark } from "@/components/ui/BrandMark";

export interface SiteFooterProps {
  copyrightYear?: number | string;
  contactEmail?: string;
}

export function SiteFooter({
  copyrightYear = "2025",
  contactEmail = "hello@readcode.dev",
}: SiteFooterProps) {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <BrandMark />
        <span className="footer-tagline">
          Understand the code you build.
        </span>
        <a className="back-top" href="#top">
          Back to top ↑
        </a>
      </div>
      <div className="footer-bottom">
        <span>© {copyrightYear} Readcode</span>
        <span>Built for people who build.</span>
        <a href={`mailto:${contactEmail}`}>Get in touch ↗</a>
      </div>
    </footer>
  );
}

export default SiteFooter;
