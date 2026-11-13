const ArrowUpRight = () => (
  <svg aria-hidden="true" viewBox="0 0 16 16" fill="none">
    <path
      d="M4 12 12 4M5 4h7v7"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function BrandMark() {
  return (
    <a className="brand" href="#top" aria-label="Readcode home">
      <span className="brand-symbol" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span>readcode</span>
    </a>
  );
}

function ProductPreview() {
  return (
    <div
      className="product-window"
      aria-label="Readcode repository assistant product preview"
    >
      <aside className="app-rail">
        <div className="rail-logo">
          <span className="brand-symbol">
            <i />
            <i />
            <i />
          </span>
        </div>
        <div className="rail-icons" aria-hidden="true">
          <span className="rail-icon rail-icon-active">⌘</span>
          <span className="rail-icon">⌕</span>
          <span className="rail-icon">⌘</span>
        </div>
        <div className="rail-bottom">
          <span className="avatar">S</span>
        </div>
      </aside>
      <div className="app-content">
        <div className="app-topbar">
          <div className="repo-breadcrumb">
            <span className="github-mark">⌘</span>
            <span>acme</span>
            <span className="crumb-slash">/</span>
            <strong>storefront</strong>
            <span className="branch-pill">main</span>
          </div>
          <div className="index-status">
            <span className="status-dot" /> Indexed 2 min ago{" "}
            <span className="more">···</span>
          </div>
        </div>
        <div className="app-body">
          <div className="conversation">
            <div className="conversation-heading">
              <span className="eyebrow">ASK YOUR CODEBASE</span>
              <span className="model-tag">✳&nbsp; Readcode AI</span>
            </div>
            <div className="question-bubble">
              Where is the payment flow handled?
            </div>
            <div className="answer-copy">
              <p>
                The checkout flow starts in <code>CheckoutForm</code> and hands
                off to the payment service after validating the cart.
              </p>
              <div className="answer-callout">
                <span className="callout-icon">↳</span>
                <span>Here’s how the pieces connect</span>
              </div>
            </div>
            <div className="flow-card">
              <div className="flow-step">
                <span className="flow-number">01</span>
                <span className="file-icon ts">TS</span>
                <span className="flow-file">
                  <strong>CheckoutForm</strong>
                  <small>src/components/checkout/CheckoutForm.tsx</small>
                </span>
                <span className="line-ref">L42</span>
              </div>
              <div className="flow-connector" />
              <div className="flow-step">
                <span className="flow-number">02</span>
                <span className="file-icon ts">TS</span>
                <span className="flow-file">
                  <strong>createPaymentIntent</strong>
                  <small>src/lib/payments/stripe.ts</small>
                </span>
                <span className="line-ref">L18</span>
              </div>
              <div className="flow-connector" />
              <div className="flow-step">
                <span className="flow-number">03</span>
                <span className="file-icon api">API</span>
                <span className="flow-file">
                  <strong>POST /api/checkout</strong>
                  <small>src/app/api/checkout/route.ts</small>
                </span>
                <span className="line-ref">L9</span>
              </div>
            </div>
            <div className="sources-row">
              <span>Sources</span>
              <span className="source-chip">⌘&nbsp; CheckoutForm.tsx</span>
              <span className="source-chip">⌘&nbsp; stripe.ts</span>
              <span className="source-count">+2</span>
            </div>
            <div className="prompt-bar">
              <span>Ask a follow-up...</span>
              <span className="prompt-shortcut">↵</span>
            </div>
          </div>
          <aside className="repo-panel">
            <div className="panel-title">
              Repository map <span>↗</span>
            </div>
            <div className="repo-tree">
              <div className="tree-row">
                <span className="tree-caret">⌄</span>
                <span className="folder-icon">▰</span>
                <strong>src</strong>
              </div>
              <div className="tree-row tree-nested">
                <span className="tree-caret">⌄</span>
                <span className="folder-icon">▰</span>
                <span>app</span>
              </div>
              <div className="tree-row tree-deep">
                <span className="file-icon mini api">API</span>
                <span>api/checkout</span>
                <span className="tree-active">3</span>
              </div>
              <div className="tree-row tree-nested">
                <span className="tree-caret">⌄</span>
                <span className="folder-icon">▰</span>
                <span>components</span>
              </div>
              <div className="tree-row tree-deep tree-highlight">
                <span className="file-icon mini ts">TS</span>
                <strong>CheckoutForm.tsx</strong>
              </div>
              <div className="tree-row tree-nested">
                <span className="tree-caret">›</span>
                <span className="folder-icon">▰</span>
                <span>lib</span>
              </div>
            </div>
            <div className="panel-divider" />
            <div className="panel-title connections-title">
              Related symbols <span>⌘</span>
            </div>
            <div className="symbol-item">
              <span className="symbol-node orange-node" />
              <div>
                <strong>createPaymentIntent</strong>
                <small>function · stripe.ts</small>
              </div>
            </div>
            <div className="symbol-item">
              <span className="symbol-node purple-node" />
              <div>
                <strong>Order</strong>
                <small>type · order.ts</small>
              </div>
            </div>
            <div className="symbol-item">
              <span className="symbol-node green-node" />
              <div>
                <strong>handleCheckout</strong>
                <small>route · checkout</small>
              </div>
            </div>
            <div className="map-footer">
              <span className="map-legend">
                <i /> Connected files
              </span>
              <span>View map&nbsp; →</span>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

const capabilities = [
  {
    number: "01",
    title: "Code-aware, by design.",
    text: "We understand symbols, call sites, and file structure. Not just chunks of text. Ask how things work and get answers grounded in your actual code.",
  },
  {
    number: "02",
    title: "Every answer has receipts.",
    text: "Follow each explanation to the exact file and line. See the dependencies, related symbols, and context behind every response.",
  },
  {
    number: "03",
    title: "Your whole repo. In context.",
    text: "From API contracts and README files to commit history and dependency graphs, the complete picture is ready when you are.",
  },
];

function LeftSidebar() {
  return (
    <aside
      className="fixed-sidebar left-sidebar"
      aria-label="Readcode workspace"
    >
      <div className="sidebar-brand">
        <BrandMark />
        <span className="workspace-switch">⌄</span>
      </div>
      <a className="workspace-card" href="#top">
        <span className="workspace-avatar">A</span>
        <span className="workspace-name">
          <strong>Acme Studio</strong>
          <small>Personal workspace</small>
        </span>
        <span className="workspace-caret">⌄</span>
      </a>
      <a className="sidebar-primary" href="#get-started">
        <span>＋</span> Connect repository
      </a>
      <div className="sidebar-group">
        <span className="sidebar-label">WORKSPACE</span>
        <nav className="sidebar-nav" aria-label="Workspace navigation">
          <a className="sidebar-link active" href="#top">
            <span className="sidebar-glyph">◫</span> Overview
          </a>
          <a className="sidebar-link" href="#product">
            <span className="sidebar-glyph">⌕</span> Ask your code
          </a>
          <a className="sidebar-link" href="#developers">
            <span className="sidebar-glyph">⌘</span> Repository map
          </a>
          <a className="sidebar-link" href="#how-it-works">
            <span className="sidebar-glyph">◷</span> Activity
          </a>
        </nav>
      </div>
      <div className="sidebar-group repo-list-group">
        <div className="sidebar-label-row">
          <span className="sidebar-label">REPOSITORIES</span>
          <span className="sidebar-add">＋</span>
        </div>
        <a className="repo-sidebar-item selected" href="#top">
          <span className="repo-mini-icon">⌘</span>
          <span className="repo-sidebar-copy">
            <strong>storefront</strong>
            <small>acme / storefront</small>
          </span>
          <span className="repo-online" />
        </a>
        <a className="repo-sidebar-item" href="#developers">
          <span className="repo-mini-icon">⌘</span>
          <span className="repo-sidebar-copy">
            <strong>payments-api</strong>
            <small>acme / payments-api</small>
          </span>
        </a>
        <a className="repo-sidebar-item" href="#developers">
          <span className="repo-mini-icon">⌘</span>
          <span className="repo-sidebar-copy">
            <strong>design-system</strong>
            <small>acme / design-system</small>
          </span>
        </a>
      </div>
      <div className="sidebar-bottom">
        <a className="sidebar-link" href="#developers">
          <span className="sidebar-glyph">⚙</span> Settings
        </a>
        <div className="sidebar-user">
          <span className="user-avatar">S</span>
          <span className="user-copy">
            <strong>Sam Quinn</strong>
            <small>Free plan</small>
          </span>
          <span className="user-more">···</span>
        </div>
      </div>
    </aside>
  );
}

function RightSidebar() {
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

export default function Home() {
  return (
    <div className="app-shell">
      <LeftSidebar />
      <main id="top" className="center-scroll">
        <div className="announcement">
          <span className="announcement-pulse" /> Meet your codebase, all over
          again.{" "}
          <a href="#how-it-works">
            See how it works <span>→</span>
          </a>
        </div>
        <header className="site-header">
          <div className="center-header">
            <span className="center-breadcrumb">
              <span>Workspace</span>
              <i>/</i>
              <strong>Overview</strong>
            </span>
            <a className="button button-dark button-nav" href="#get-started">
              Get early access <ArrowUpRight />
            </a>
          </div>
        </header>
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

        <section
          className="trust-strip"
          aria-label="Supported development stacks"
        >
          <div className="trust-inner">
            <span className="trust-label">BUILT FOR THE WAY YOU BUILD</span>
            <div className="trust-item">
              <span className="stack-mark stack-git">⌘</span>GitHub repositories
            </div>
            <div className="trust-item">
              <span className="stack-mark stack-ts">TS</span>TypeScript
            </div>
            <div className="trust-item">
              <span className="stack-mark stack-py">Py</span>Python
            </div>
            <div className="trust-item">
              <span className="stack-mark stack-rs">◈</span>And your stack
            </div>
          </div>
        </section>

        <section className="section-wrap value-section" id="product">
          <div className="section-intro">
            <div className="section-kicker">A BETTER WAY TO NAVIGATE</div>
            <h2>
              Your codebase has
              <br />
              the answers.
            </h2>
            <p>
              Readcode connects the dots across your repository so you can spend
              less time searching and more time building.
            </p>
            <a className="inline-link" href="#how-it-works">
              See what Readcode understands <span>→</span>
            </a>
          </div>
          <div className="capability-list">
            {capabilities.map((item) => (
              <article className="capability" key={item.number}>
                <span className="cap-number">{item.number}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
                <span className="cap-arrow">
                  <ArrowUpRight />
                </span>
              </article>
            ))}
          </div>
        </section>

        <section className="question-section" id="how-it-works">
          <div className="section-wrap question-inner">
            <div className="section-kicker">
              ASK THE QUESTIONS THAT MOVE YOU FORWARD
            </div>
            <h2>
              From “where is it?”
              <br />
              to <span>“now I get it.”</span>
            </h2>
            <div className="question-grid">
              <div className="question-card">
                <span className="q-icon">↗</span>
                <p>“Explain the authentication flow.”</p>
                <span className="q-type">FOLLOW THE LOGIC</span>
              </div>
              <div className="question-card">
                <span className="q-icon">⌘</span>
                <p>“What depends on this service?”</p>
                <span className="q-type">MAP THE CONNECTIONS</span>
              </div>
              <div className="question-card">
                <span className="q-icon">⌁</span>
                <p>“How does our data model fit together?”</p>
                <span className="q-type">SEE THE BIG PICTURE</span>
              </div>
            </div>
          </div>
        </section>

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

        <section className="cta-section" id="get-started">
          <div className="cta-orb" />
          <div className="cta-content">
            <div className="section-kicker">THE NEXT STEP IN YOUR CODEBASE</div>
            <h2>
              Get the context
              <br />
              you’ve been missing.
            </h2>
            <p>
              Be among the first to explore a smarter way to understand your
              code.
            </p>
            <a
              href="mailto:hello@readcode.dev?subject=Readcode%20early%20access"
              className="button button-light"
            >
              Get early access <ArrowUpRight />
            </a>
            <span className="cta-note">
              No setup marathon. Just you and your repo.
            </span>
          </div>
        </section>

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
            <span>© 2025 Readcode</span>
            <span>Built for people who build.</span>
            <a href="mailto:hello@readcode.dev">Get in touch ↗</a>
          </div>
        </footer>
      </main>
      <RightSidebar />
    </div>
  );
}