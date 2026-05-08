import Sidebar from './Sidebar'
import { useEffect, useRef, useState } from 'react'

export default function Layout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)

  useEffect(() => {
    const sidebar = document.querySelector('.sidebar')
    if (!sidebar) return
    const observer = new MutationObserver(() => {
      setSidebarCollapsed(sidebar.classList.contains('collapsed'))
    })
    observer.observe(sidebar, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  return (
    <div className="app-layout">
      <Sidebar />
      <main className={`main-content${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}>
        {children}
      </main>
    </div>
  )
}
