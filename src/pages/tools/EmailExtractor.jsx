import { Link } from 'react-router-dom'

const TOOL_URL = import.meta.env.VITE_EMAIL_EXTRACTOR_URL || ''

export default function EmailExtractor() {
  return (
    <>
      <Link to="/" className="back-btn" style={{ marginBottom: 20 }}>
        <span className="material-icons-round" style={{ fontSize: 16 }}>arrow_back</span>
        Back
      </Link>

      <div style={{
        borderRadius: '16px',
        overflow: 'hidden',
        margin: '0 -26px',
        // border: '1.5px solid #e5e7eb',
        // boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      }}>
        <iframe
          src={TOOL_URL}
          title="Email Extractor"
          style={{
            width: '100%',
            height: '1000px',
            border: 'none',
            display: 'block',
          }}
        />
      </div>
    </>
  )
}
