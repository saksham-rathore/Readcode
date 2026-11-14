export function WorkflowSection() {
  return (
    <section className="workflow-section section-wrap" id="developers">
      <div className="workflow-copy">
        <div className="section-kicker">FROM REPOSITORY TO REASONING</div>
        <h2>
          More than search.
          <br />
          <span>Actual understanding.</span>
        </h2>
        <p>
          Traditional search finds a file. Readcode follows the
          relationships between your files, functions, APIs, and history to
          explain how the system really works.
        </p>
        <a href="#get-started" className="inline-link">
          Meet your codebase <span>→</span>
        </a>
      </div>
      <div className="workflow-visual">
        <div className="workflow-line line-a" />
        <div className="workflow-line line-b" />
        <div className="workflow-line line-c" />
        <div className="workflow-node node-repo">
          <span className="node-glyph">⌘</span>
          <strong>your-repo</strong>
          <small>entire codebase</small>
        </div>
        <div className="workflow-node node-symbol">
          <span className="symbol-node orange-node" />
          <strong>symbols</strong>
          <small>functions · types</small>
        </div>
        <div className="workflow-node node-graph">
          <span className="graph-glyph">⌘</span>
          <strong>dependencies</strong>
          <small>what connects</small>
        </div>
        <div className="workflow-center">
          <span className="brand-symbol">
            <i />
            <i />
            <i />
          </span>
        </div>
        <div className="workflow-node node-answer">
          <span className="answer-glyph">✳</span>
          <strong>clear answers</strong>
          <small>with source links</small>
        </div>
        <div className="workflow-caption">
          One connected view of your code.
        </div>
      </div>
    </section>
  );
}

export default WorkflowSection;
