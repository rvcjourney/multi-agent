import { useState } from 'react'
import ToolCard from '../components/ToolCard'
import { TOOLS, CATEGORIES } from '../toolsConfig'

export default function Dashboard() {
  const [activeCategory, setActiveCategory] = useState('All')

  const visible = activeCategory === 'All'
    ? TOOLS
    : TOOLS.filter(t => t.category === activeCategory)

  return (
    <>
      <div className="page-header">
        <div>
          <div className="greeting">Welcome, User! 👋</div>
          <h1 className="page-title">All Your Tools in One Place.</h1>
        </div>
      </div>

      <div className="filter-tabs">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`filter-tab${activeCategory === cat ? ' active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="tools-grid">
        {visible.length === 0 ? (
          <div className="empty-state">
            <span className="material-icons-round">search_off</span>
            <p>No tools in this category yet.</p>
          </div>
        ) : (
          visible.map(tool => <ToolCard key={tool.id} tool={tool} />)
        )}
      </div>
    </>
  )
}
