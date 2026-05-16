import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/', icon: 'home', label: 'Home', end: true },
  { to: '/billing', icon: 'credit_card', label: 'Tab 2' },
  { to: '/flows', icon: 'account_tree', label: 'Tab 3' },
  { to: '/profile', icon: 'person', label: 'Profile' },
]

export default function Sidebar({ mobileOpen, onMobileClose }) {
  const [collapsed, setCollapsed] = useState(true)

  const classes = [
    'sidebar',
    collapsed ? 'collapsed' : '',
    mobileOpen ? 'mobile-open' : '',
  ].filter(Boolean).join(' ')

  return (
    <aside className={classes}>
      <div className="sidebar-brand">
        <NavLink to="/" className="brand-logo" onClick={onMobileClose}>
          <div className="brand-icon">
            <span className="material-icons-round" style={{ fontSize: 18 }}>rocket_launch</span>
          </div>
          <span className="brand-name">MOTM<span> OS</span></span>
        </NavLink>
        <button
          className="collapse-btn"
          onClick={() => setCollapsed(c => !c)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <span className="material-icons-round" style={{ fontSize: 18 }}>
            {collapsed ? 'chevron_right' : 'chevron_left'}
          </span>
        </button>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ to, icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            title={collapsed && !mobileOpen ? label : undefined}
            onClick={onMobileClose}
          >
            <span className="material-icons-round">{icon}</span>
            <span className="nav-label">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-user">
        <div className="user-avatar">U</div>
        <div className="user-info">
          <div className="user-name">User</div>
          <div className="user-org">user@gmail.com</div>
        </div>
      </div>
    </aside>
  )
}
