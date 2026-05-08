import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/', icon: 'home', label: 'Home', end: true },
  { to: '/billing', icon: 'credit_card', label: 'Tab 2' },
  { to: '/flows', icon: 'account_tree', label: 'Tab 3' },
  { to: '/profile', icon: 'person', label: 'Profile' },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(true)

  return (
    <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>
      <div className="sidebar-brand">
        <NavLink to="/" className="brand-logo">
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
            title={collapsed ? label : undefined}
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
