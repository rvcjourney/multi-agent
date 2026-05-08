import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#f9fafb', padding: 24,
      }}>
        <div style={{
          background: '#fff', borderRadius: 16, border: '1.5px solid #e5e7eb',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)', padding: '48px 40px',
          maxWidth: 480, width: '100%', textAlign: 'center',
        }}>
          <span className="material-icons-round" style={{ fontSize: 48, color: '#ef4444', display: 'block', marginBottom: 16 }}>
            error_outline
          </span>
          <div style={{ fontWeight: 700, fontSize: 18, color: '#111827', marginBottom: 8 }}>
            Something went wrong
          </div>
          <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>
            An unexpected error occurred. Try refreshing the page.
          </div>
          {this.state.error?.message && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8,
              padding: '10px 14px', fontSize: 12, color: '#dc2626',
              fontFamily: 'monospace', textAlign: 'left', marginBottom: 24,
              wordBreak: 'break-word',
            }}>
              {this.state.error.message}
            </div>
          )}
          <button
            onClick={() => window.location.reload()}
            style={{
              background: 'linear-gradient(135deg, #4f7cff, #6f9fff)',
              color: '#fff', border: 'none', borderRadius: 10,
              padding: '10px 24px', fontWeight: 600, fontSize: 14, cursor: 'pointer',
            }}
          >
            Reload Page
          </button>
        </div>
      </div>
    )
  }
}
