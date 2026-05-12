import { Link } from 'react-router-dom'

const TOOL_URL = import.meta.env.VITE_ICP_BUILDER_URL || ''

export default function ICPBuilder() {
  return (
    <>
      <Link to="/" className="back-btn" style={{ marginBottom: 20 }}>
        <span className="material-icons-round" style={{ fontSize: 16 }}>arrow_back</span>
        Back
      </Link>

      {!TOOL_URL && (
        <div style={{ padding: 20, color: '#ef4444', fontWeight: 600 }}>
          ⚠ VITE_ICP_BUILDER_URL is not set — rebuild the Docker image with --build
        </div>
      )}

      <div>
        <iframe
          src={TOOL_URL}
          title="ICP Builder"
          style={{
            width: '1200px',
            minWidth: '100%',
            height: '700px',
            border: 'none',
            display: 'block',
          }}
        />
      </div>
    </>
  )
}
