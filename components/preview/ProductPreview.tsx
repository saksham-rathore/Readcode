export function ProductPreview() {
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

export default ProductPreview;
