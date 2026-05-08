export default function ResultPanel({ status, result, error, progress, onReset }) {
  if (status === 'idle') return null

  if (status === 'loading') {
    return (
      <div className="form-card" style={{ textAlign: 'center', padding: '36px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: '#eef2ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span className="material-icons-round" style={{ color: '#4f7cff', fontSize: 26 }}>
              cloud_sync
            </span>
          </div>
        </div>
        <div style={{ fontWeight: 700, fontSize: 15, color: '#1a1a2e', marginBottom: 6 }}>
          Processing your request...
        </div>
        <div className="status-text">This may take up to 2 minutes. Please wait.</div>
        <div className="progress-wrap">
          <div className="progress-bar-inner" style={{ width: `${progress}%` }} />
        </div>
        <div className="status-text">{progress}% complete</div>
      </div>
    )
  }

  if (status === 'success' && result) {
    return (
      <div className="result-card">
        <span className="material-icons-round result-icon-success">check_circle</span>
        <div className="result-title">Data Ready!</div>
        <div className="result-subtitle">Your research results have been compiled into an Excel file.</div>
        <div>
          <a
            href={result.url}
            download={result.filename}
            className="download-btn"
          >
            <span className="material-icons-round" style={{ fontSize: 18 }}>download</span>
            Download {result.filename}
          </a>
          <button className="reset-btn" onClick={onReset}>
            <span className="material-icons-round" style={{ fontSize: 16 }}>refresh</span>
            New Search
          </button>
        </div>
      </div>
    )
  }

  return null
}

export function ErrorAlert({ error }) {
  if (!error) return null
  return (
    <div className="error-alert">
      <span className="material-icons-round" style={{ fontSize: 18, flexShrink: 0 }}>error_outline</span>
      <span>{error}</span>
    </div>
  )
}
