import { Link } from 'react-router-dom'

const TOOL_URL = import.meta.env.VITE_DATA_SCRAPER_URL || ''

export default function DataScraper() {
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
          title="Data Scraper"
          style={{
            width: '1100px',
            minWidth: '100%',
            height: '850px',
            border: 'none',
            display: 'block',
          }}
        />
      </div>
    </>
  )
}
