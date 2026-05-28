export function AppShell({ title, subtitle, headerActions, children }) {
  return (
    <div className="app">
      <header className="header">
        <div className="header-row">
          <div>
            <div className="title-row">
              <h1 className="title">{title}</h1>
              <span className="badge">local-only</span>
            </div>
            <p className="subtitle">{subtitle}</p>
          </div>

          {headerActions ? <div className="header-actions">{headerActions}</div> : null}
        </div>
      </header>

      <main className="content">{children}</main>

      <footer className="footer">
        <span>
          Data is stored in <code>localStorage</code> (next step).
        </span>
      </footer>
    </div>
  )
}

