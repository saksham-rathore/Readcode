export interface StackItem {
  mark: string;
  label: string;
  className?: string;
}

export const defaultStacks: StackItem[] = [
  { mark: "⌘", label: "GitHub repositories", className: "stack-git" },
  { mark: "TS", label: "TypeScript", className: "stack-ts" },
  { mark: "Py", label: "Python", className: "stack-py" },
  { mark: "◈", label: "And your stack", className: "stack-rs" },
];

export interface TrustSectionProps {
  label?: string;
  stacks?: StackItem[];
}

export function TrustSection({
  label = "BUILT FOR THE WAY YOU BUILD",
  stacks = defaultStacks,
}: TrustSectionProps) {
  return (
    <section
      className="trust-strip"
      aria-label="Supported development stacks"
    >
      <div className="trust-inner">
        <span className="trust-label">{label}</span>
        {stacks.map((stack) => (
          <div className="trust-item" key={stack.label}>
            <span className={`stack-mark ${stack.className || ""}`}>
              {stack.mark}
            </span>
            {stack.label}
          </div>
        ))}
      </div>
    </section>
  );
}

export default TrustSection;
