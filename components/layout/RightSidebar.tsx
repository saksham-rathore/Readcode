export function RightSidebar() {
  return (
    <aside
      className="fixed-sidebar right-sidebar"
      aria-label="Repository details and page navigation"
    >
      <div className="right-sidebar-head">
        <span>REPOSITORY OVERVIEW</span>
        <button type="button" aria-label="More repository options">
          ···
        </button>
      </div>
      <div className="repo-summary">
        <div className="repo-summary-title">
          <span className="repo-summary-github">⌘</span>
          <span>
            <strong>storefront</strong>
            <small>acme / storefront</small>
          </span>
        </div>
        <div className="repo-branch">
          <span>⑂</span> main <span className="branch-chevron">⌄</span>
        </div>
        <div className="repo-health">
          <span className="status-dot" /> Fully indexed <span>·</span> 2 min ago
        </div>
      </div>
      <div className="right-divider" />
      <div className="right-section-title">
        INDEXED CONTENT <a href="#developers">↗</a>
      </div>
      <div className="repo-stat-grid">
        <div className="repo-stat">
          <strong>1,284</strong>
          <span>Files</span>
        </div>
        <div className="repo-stat">
          <strong>8,412</strong>
          <span>Symbols</span>
        </div>
        <div className="repo-stat">
          <strong>342</strong>
          <span>Commits</span>
        </div>
        <div className="repo-stat">
          <strong>14</strong>
          <span>Languages</span>
        </div>
      </div>
      <div className="languages-title">TOP LANGUAGES</div>
      <div className="language-bars">
        <div className="language-bar">
          <span className="language-meta">
            <strong>TypeScript</strong>
            <span>64%</span>
          </span>
          <i>
            <b className="bar-ts" />
          </i>
        </div>
        <div className="language-bar">
          <span className="language-meta">
            <strong>CSS</strong>
            <span>18%</span>
          </span>
          <i>
            <b className="bar-css" />
          </i>
        </div>
        <div className="language-bar">
          <span className="language-meta">
            <strong>MDX</strong>
            <span>11%</span>
          </span>
          <i>
            <b className="bar-md" />
          </i>
        </div>
      </div>
      <div className="right-divider" />
      <div className="right-section-title">ON THIS PAGE</div>
      <nav className="page-outline" aria-label="On this page">
        <a className="outline-active" href="#top">
          Overview
        </a>
        <a href="#product">Codebase intelligence</a>
        <a href="#how-it-works">Ask your codebase</a>
        <a href="#developers">How it works</a>
        <a href="#get-started">Get early access</a>
      </nav>
      <div className="right-sidebar-bottom">
        <div className="upgrade-card">
          <span className="upgrade-icon">✳</span>
          <strong>
            Make your codebase
            <br />
            feel a little smaller.
          </strong>
          <p>Explore what Readcode can do with your repo.</p>
          <a href="#get-started">
            Get early access <span>→</span>
          </a>
        </div>
        <div className="sidebar-help">
          <span>Need a hand?</span>
          <a href="mailto:hello@readcode.dev">Talk to us ↗</a>
        </div>
      </div>
    </aside>
  );
}

export default RightSidebar;
