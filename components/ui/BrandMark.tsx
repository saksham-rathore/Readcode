export interface BrandMarkProps {
  href?: string;
  className?: string;
  label?: string;
}

export function BrandMark({
  href = "#top",
  className = "brand",
  label = "Readcode home",
}: BrandMarkProps) {
  return (
    <a className={className} href={href} aria-label={label}>
      <span className="brand-symbol" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span>readcode</span>
    </a>
  );
}

export default BrandMark;
