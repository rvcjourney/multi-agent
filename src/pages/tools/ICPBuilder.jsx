import { Link } from 'react-router-dom'

const TOOL_URL = import.meta.env.VITE_ICP_BUILDER_URL || ''

export default function ICPBuilder() {
  return (
    <>
      <Link to="/" className="back-btn" style={{ marginBottom: 20 }}>
        <span className="material-icons-round" style={{ fontSize: 16 }}>arrow_back</span>
        Back
      </Link>

      <div style={{
        borderRadius: '16px',
        overflowX: 'auto',
        overflowY: 'visible',
        border: '1.5px solid #e5e7eb',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      }}>
        <iframe
          src={TOOL_URL}
          title="ICP Builder"
          style={{
            width: '1100px',
            minWidth: '100%',
            height: '1000px',
            border: 'none',
            display: 'block',
          }}
        />
      </div>
    </>
  )
}
