import { BrandMark } from "@/components/ui/BrandMark";

export function LeftSidebar() {
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

export default LeftSidebar;
