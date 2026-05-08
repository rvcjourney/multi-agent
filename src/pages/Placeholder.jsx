export default function Placeholder({ title }) {
  return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <span className="material-icons-round" style={{ fontSize: 52, color: '#d1d5db', display: 'block', marginBottom: 16 }}>
        construction
      </span>
      <div style={{ fontSize: 20, fontWeight: 700, color: '#1a1a2e', marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 14, color: '#9ca3af' }}>This section is coming soon.</div>
    </div>
  )
}
