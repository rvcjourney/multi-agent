import Sidebar from './Sidebar'
import { NavLink } from 'react-router-dom'
import { useEffect, useState } from 'react'

export default function Layout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const sidebar = document.querySelector('.sidebar')
    if (!sidebar) return
    const observer = new MutationObserver(() => {
      setSidebarCollapsed(sidebar.classList.contains('collapsed'))
    })
    observer.observe(sidebar, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  // Close mobile sidebar on route change / resize
  useEffect(() => {
    const close = () => setMobileOpen(false)
    window.addEventListener('resize', close)
    return () => window.removeEventListener('resize', close)
  }, [])

  return (
    <div className="app-layout">
      {/* Mobile topbar */}
      <header className="mobile-topbar">
        <button
          className="hamburger-btn"
          onClick={() => setMobileOpen(o => !o)}
          aria-label="Toggle sidebar"
        >
          <span className="material-icons-round" style={{ fontSize: 24 }}>
            {mobileOpen ? 'close' : 'menu'}
          </span>
        </button>
        <NavLink to="/" className="mobile-brand-logo" onClick={() => setMobileOpen(false)}>
          <div className="brand-icon" style={{ width: 30, height: 30, fontSize: 15 }}>
            <span className="material-icons-round" style={{ fontSize: 15 }}>rocket_launch</span>
          </div>
          <span style={{ fontWeight: 700, fontSize: 15, color: '#1a1a2e' }}>
            MOTM<span style={{ color: '#4f7cff' }}> OS</span>
          </span>
        </NavLink>
      </header>

      {/* Backdrop for mobile sidebar */}
      {mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <main className={`main-content${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}>
        {children}
      </main>
    </div>
  )
}
