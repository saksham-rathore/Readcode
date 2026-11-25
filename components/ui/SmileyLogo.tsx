import { useId, type SVGProps } from "react";

export interface SmileyLogoProps extends SVGProps<SVGSVGElement> {
  width?: number | string;
  height?: number | string;
}

export function SmileyLogo({ width = 28, height = 28, ...props }: SmileyLogoProps) {
  const tileId = useId();

  return (
    <svg width={width} height={height} viewBox="0 0 32 32" aria-hidden="true" {...props}>
      <defs>
        <clipPath id={tileId}>
          <rect width="32" height="32" rx="8" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${tileId})`} shapeRendering="crispEdges">
        <path fill="#23c5f3" d="M0 0h32v32H0z" />
        <path fill="#08afe8" d="M0 0h32v4H0z" />
        <path fill="#9ce5fb" d="M0 14h6v2h5v2h13v-2h8v7H0z" />
        <path fill="#d3c3f9" d="M0 21h5v-1h6v2h15v-2h6v7H0z" />
        <path fill="#c6f557" d="M0 24h4v-1h6v2h11v-2h6v-1h5v10H0z" />
        <path fill="#ecffae" d="M4 27h2v1H4zM26 25h2v1h-2zM24 29h2v1h-2z" />
        <path fill="#fff" d="M7 7h2v2h2v2h10V9h2V7h2v9h2v7h-2v2h-3v2H10v-2H7v-2H5v-7h2z" />
        <path fill="#c7edfb" d="M8 9h1v2H8zM23 9h1v2h-1zM10 26h12v1H10z" />
        <path fill="#172835" d="M10 16h3v5h-3zM19 16h3v5h-3z" />
        <path fill="#18aee0" d="M15 22h2v1h-2z" />
      </g>
    </svg>
  );
}

export default SmileyLogo;
