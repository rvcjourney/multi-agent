import { Link } from 'react-router-dom'

export default function ToolCard({ tool }) {
  const { id, title, description, icon, iconBg, iconColor, dots, credits, category, to } = tool

  return (
    <Link to={to} className="tool-card">
      <span
        className="category-badge badge-data-research"
        style={{ background: iconBg + '33', color: iconColor }}
      >
        {category}
      </span>

      <div className="card-icon-wrap" style={{ background: iconBg + '22' }}>
        <span className="material-icons-round" style={{ color: iconColor, fontSize: 24 }}>
          {icon}
        </span>
      </div>

      <div className="card-title">{title}</div>
      <div className="card-desc">{description}</div>

      <div className="card-dots">
        {dots.map((c, i) => (
          <div key={i} className="dot" style={{ background: c }} />
        ))}
      </div>

    </Link>
  )
}
