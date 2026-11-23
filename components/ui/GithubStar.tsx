import type { SVGProps } from "react";

export interface GithubStarProps extends SVGProps<SVGSVGElement> {
  color?: string;
  borderColor?: string;
  borderWidth?: number;
}

export function GithubStar({
  color = "var(--github-star-fill, #82AAFF)",
  borderColor = "#ffffff",
  borderWidth = 16,
  className,
  ...props
}: GithubStarProps) {
  return (
    <svg
      width="400"
      height="400"
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M174 45
           C181 24 219 24 226 45
           L247 105
           C251 117 262 125 275 125
           H345
           C372 125 383 157 361 173
           L305 213
           C294 221 290 235 295 248
           L318 313
           C327 338 299 358 277 343
           L218 303
           C207 295 193 295 182 303
           L123 343
           C101 358 73 338 82 313
           L105 248
           C110 235 106 221 95 213
           L39 173
           C17 157 28 125 55 125
           H125
           C138 125 149 117 153 105
           Z"
        fill={color}
        stroke={borderColor}
        strokeWidth={borderWidth}
        strokeLinejoin="round"
        style={{ paintOrder: "stroke fill" }}
      />

      {/* Eyes */}
      <circle cx="150" cy="165" r="11" fill="white" />
      <circle cx="250" cy="165" r="11" fill="white" />

      {/* Smile */}
      <path
        d="M165 195 Q200 230 235 195"
        stroke="white"
        strokeWidth="9"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export default GithubStar;
