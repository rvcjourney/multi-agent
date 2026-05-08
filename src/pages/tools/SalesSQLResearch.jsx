import { useState } from 'react'
import { Link } from 'react-router-dom'
import * as XLSX from 'xlsx'

const WEBHOOK_URL = import.meta.env.VITE_SALESSQL_WEBHOOK || ''

const RESULT_COLUMNS = [
  { key: 'full_name',                   label: 'Full Name' },
  { key: 'linkedin_url',                label: 'LinkedIn URL' },
  { key: 'title',                       label: 'Job Title' },
  { key: 'email_work',                  label: 'Work Email' },
  { key: 'email_personal',              label: 'Personal Email' },
  { key: 'phone_work',                  label: 'Work Phone' },
  { key: 'phone_personal',              label: 'Personal Phone' },
  { key: 'organization_name',           label: 'Organization' },
  { key: 'organization_website',        label: 'Website' },
  { key: 'organization_website_domain', label: 'Domain' },
  { key: 'organization_linkedin_url',   label: 'Org LinkedIn' },
  { key: 'founded_year',                label: 'Founded' },
  { key: 'number_of_employees',         label: 'Employees' },
  { key: 'type',                        label: 'Type' },
]

function downloadExcel(rows, filename = 'salessql_results.xlsx') {
  const data = rows.map(r => {
    const obj = {}
    RESULT_COLUMNS.forEach(c => { obj[c.label] = r[c.key] ?? '' })
    return obj
  })
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Results')
  XLSX.writeFile(wb, filename)
}

// ── Tag Input for LinkedIn URLs ───────────────────────────────────
function LinkedInTagInput({ urls, onAdd, onRemove }) {
  const [val, setVal] = useState('')
  const [error, setError] = useState('')

  function normalise(raw) {
    let u = raw.trim()
    if (!u) return null
    if (!/^https?:\/\//i.test(u)) u = 'https://' + u
    return u.includes('linkedin.com') ? u : null
  }

  function commit(raw) {
    setError('')
    const u = normalise(raw)
    if (!u) { if (raw.trim()) setError('Not a valid LinkedIn URL'); return }
    if (urls.includes(u)) { setVal(''); return }
    if (urls.length >= 10) { setError('Max 10 URLs'); return }
    onAdd(u)
    setVal('')
  }

  function onKeyDown(e) {
    if (e.key === 'Enter') { e.preventDefault(); commit(val) }
    else if (e.key === 'Backspace' && val === '' && urls.length) onRemove(urls.length - 1)
  }

  function onPaste(e) {
    e.preventDefault()
    const lines = e.clipboardData.getData('text').split(/[\n\r,\s]+/).map(s => s.trim()).filter(Boolean)
    lines.forEach(l => {
      const u = normalise(l)
      if (u && !urls.includes(u) && urls.length < 10) onAdd(u)
    })
    setVal('')
  }

  return (
    <div>
      <div className="ps-tag-wrap" onClick={() => document.getElementById('salessqlInput')?.focus()}>
        {urls.map((u, i) => (
          <span key={i} className="ps-tag">
            <span className="material-icons-round" style={{ fontSize: 13, verticalAlign: 'middle', marginRight: 3, color: '#0a66c2' }}>link</span>
            {u.replace(/https?:\/\/(www\.)?linkedin\.com\/in\//i, '').replace(/\/$/, '')}
            <button type="button" onClick={() => onRemove(i)}>×</button>
          </span>
        ))}
        {urls.length < 10 && (
          <input
            id="salessqlInput"
            className="ps-tag-input"
            value={val}
            onChange={e => { setVal(e.target.value); setError('') }}
            onKeyDown={onKeyDown}
            onPaste={onPaste}
            placeholder={urls.length === 0 ? 'Paste LinkedIn URL and press Enter…' : ''}
            autoComplete="off"
          />
        )}
      </div>
      {error && <div style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>{error}</div>}
    </div>
  )
}

// ── Results Table ─────────────────────────────────────────────────
function ResultsTable({ rows, onDownload }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ fontSize: 14, color: '#6b7280', fontWeight: 500 }}>
          <span style={{ color: '#111827', fontWeight: 700, fontSize: 18 }}>{rows.length}</span>
          {' '}contact{rows.length !== 1 ? 's' : ''} found
        </div>
        <button
          type="button"
          onClick={onDownload}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '9px 18px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, #4f7cff, #6f9fff)',
            color: '#fff', fontWeight: 600, fontSize: 14,
          }}
        >
          <span className="material-icons-round" style={{ fontSize: 17 }}>download</span>
          Download Excel
        </button>
      </div>

      <div style={{ overflowX: 'auto', borderRadius: 10, border: '1.5px solid #e5e7eb' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, whiteSpace: 'nowrap' }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              <th style={{ padding: '10px 14px', textAlign: 'left', borderBottom: '1.5px solid #e5e7eb', color: '#374151', fontWeight: 600, position: 'sticky', left: 0, background: '#f9fafb', zIndex: 1 }}>#</th>
              {RESULT_COLUMNS.map(c => (
                <th key={c.key} style={{ padding: '10px 14px', textAlign: 'left', borderBottom: '1.5px solid #e5e7eb', color: '#374151', fontWeight: 600 }}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                <td style={{ padding: '9px 14px', color: '#9ca3af', fontWeight: 500, position: 'sticky', left: 0, background: i % 2 === 0 ? '#fff' : '#fafafa', zIndex: 1 }}>{i + 1}</td>
                {RESULT_COLUMNS.map(c => {
                  const val = row[c.key]
                  const isLink = (c.key === 'linkedin_url' || c.key === 'organization_linkedin_url' || c.key === 'organization_website') && val
                  return (
                    <td key={c.key} style={{ padding: '9px 14px', color: '#374151', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {isLink ? (
                        <a href={val} target="_blank" rel="noreferrer" style={{ color: '#4f7cff', textDecoration: 'none' }}>
                          {c.key === 'linkedin_url' || c.key === 'organization_linkedin_url'
                            ? String(val).replace(/https?:\/\/(www\.)?linkedin\.com\/(in|company)\//i, '').replace(/\/$/, '')
                            : String(val).replace(/^https?:\/\//, '')}
                        </a>
                      ) : (val !== null && val !== undefined && val !== '' ? val : <span style={{ color: '#d1d5db' }}>—</span>)}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────
export default function SalesSQLResearch() {
  const [activeTab, setActiveTab] = useState('input')
  const [urls, setUrls] = useState([])
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState({ type: 'idle', msg: '' })

  function addUrl(u) { setUrls(p => p.includes(u) ? p : [...p, u]) }
  function removeUrl(i) { setUrls(p => p.filter((_, idx) => idx !== i)) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!urls.length) return setStatus({ type: 'error', msg: 'Add at least one LinkedIn URL.' })

    setLoading(true)
    setStatus({ type: 'loading', msg: `Sending ${urls.length} URL(s) to SalesSQL…` })

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkedin_urls: urls, meta: { count: urls.length, submitted_at: new Date().toISOString() } }),
        signal: AbortSignal.timeout(120000),
      })

      const contentType = res.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        const data = await res.json()
        if (!res.ok) {
          setStatus({ type: 'error', msg: data?.error || `Server error ${res.status}` })
        } else {
          const raw = Array.isArray(data) ? data : (data?.data ?? data?.results ?? [])
          const rows = raw.filter(r =>
            RESULT_COLUMNS.some(c => r[c.key] !== null && r[c.key] !== undefined && r[c.key] !== '')
          )
          setResults(rows)
          setActiveTab('results')
          if (rows.length === 0) {
            setStatus({ type: 'error', msg: 'No contacts found for the provided LinkedIn URLs.' })
          } else {
            setStatus({ type: 'success', msg: `✓ ${rows.length} contacts found` })
          }
        }
      } else {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a'); a.href = url; a.download = 'salessql_results.xlsx'
        document.body.appendChild(a); a.click(); document.body.removeChild(a)
        URL.revokeObjectURL(url)
        setStatus({ type: 'success', msg: '✓ Results downloaded directly.' })
      }
    } catch (err) {
      setStatus({ type: 'error', msg: err.name === 'TimeoutError' ? 'Request timed out.' : 'Could not reach the webhook. Check the URL in .env.' })
    } finally {
      setLoading(false)
    }
  }

  const statusColors = {
    loading: { bg: 'rgba(79,124,255,0.08)', border: 'rgba(79,124,255,0.3)', color: '#4f7cff' },
    success: { bg: 'rgba(20,160,90,0.08)',  border: 'rgba(20,160,90,0.3)',  color: '#14a05a' },
    error:   { bg: 'rgba(217,48,37,0.08)',  border: 'rgba(217,48,37,0.3)',  color: '#d93025' },
  }

  const tabs = [
    { id: 'input',   label: 'LinkedIn URLs' },
    { id: 'results', label: results.length > 0 ? `Results (${results.length})` : 'Results' },
  ]

  return (
    <>
      {/* Centered header row */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28 }}>
        <Link to="/" className="back-btn" style={{ flexShrink: 0 }}>
          <span className="material-icons-round" style={{ fontSize: 16 }}>arrow_back</span>
          Back
        </Link>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14 }}>
          <div className="tool-page-icon" style={{ background: '#4f7cff22', flexShrink: 0 }}>
            <span className="material-icons-round" style={{ color: '#4f7cff', fontSize: 26 }}>manage_search</span>
          </div>
          <div>
            <div className="tool-page-title" style={{ marginBottom: 2 }}>Contact Enrichment via Linkedin_url</div>
            <div className="tool-page-subtitle">
              Enrich LinkedIn profiles with verified emails, phones &amp; company data — exported as Excel
            </div>
          </div>
        </div>

        <div style={{ flexShrink: 0, width: 160 }} />
      </div>

      {/* Tab bar */}
      <div style={{ maxWidth: activeTab === 'results' ? '100%' : 680, margin: '0 auto' }}>
        <div style={{
          display: 'flex', gap: 4, marginBottom: 20,
          background: '#f3f4f6', borderRadius: 12, padding: 4, width: 'fit-content',
        }}>
          {tabs.map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              style={{
                padding: '8px 20px', borderRadius: 9, border: 'none', cursor: 'pointer',
                fontWeight: 600, fontSize: 14, transition: 'all 0.18s',
                background: activeTab === t.id ? '#fff' : 'transparent',
                color: activeTab === t.id ? '#111827' : '#6b7280',
                boxShadow: activeTab === t.id ? '0 1px 4px rgba(0,0,0,0.10)' : 'none',
              }}
            >
              {t.id === 'results' && (
                <span className="material-icons-round" style={{ fontSize: 15, verticalAlign: 'middle', marginRight: 4 }}>table_view</span>
              )}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="tool-page" style={{ maxWidth: activeTab === 'results' ? '100%' : 680, margin: '0 auto' }}>

        {/* ── LinkedIn URLs Tab ── */}
        {activeTab === 'input' && (
          <form onSubmit={handleSubmit}>
            <div className="form-card">
              <div className="form-section-title">
                <span className="material-icons-round" style={{ color: '#4f7cff', fontSize: 16 }}>link</span>
                LinkedIn Profile URLs
              </div>

              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label">Profile URLs <span style={{ color: '#ef4444' }}>*</span></label>
                  <LinkedInTagInput urls={urls} onAdd={addUrl} onRemove={removeUrl} />
                  <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>
                    Max 10 URLs · Paste one or multiple at once · Press Enter to add
                  </div>
                </div>

                {urls.length > 0 && (
                  <div className="col-12">
                    <div style={{ fontSize: 13, color: '#4f7cff', fontWeight: 600 }}>
                      {urls.length} / 10 URL{urls.length !== 1 ? 's' : ''} added
                    </div>
                  </div>
                )}
              </div>

              <hr className="divider" />

              <button
                type="submit"
                className="submit-btn"
                disabled={loading || !urls.length}
                style={{ background: 'linear-gradient(135deg, #4f7cff, #6f9fff)', boxShadow: '0 4px 14px rgba(79,124,255,0.3)' }}
              >
                {loading ? (
                  <>
                    <div className="spinner" />
                    Enriching…
                  </>
                ) : (
                  <>
                    <span className="material-icons-round" style={{ fontSize: 18 }}>manage_search</span>
                    Run SalesQL Enrichment
                  </>
                )}
              </button>

              {status.type !== 'idle' && (
                <div style={{
                  marginTop: 14, padding: '10px 14px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8,
                  background: statusColors[status.type]?.bg,
                  border: `1px solid ${statusColors[status.type]?.border}`,
                  color: statusColors[status.type]?.color,
                  fontSize: 13, fontWeight: 500,
                }}>
                  {status.type === 'loading' && <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid currentColor', borderTopColor: 'transparent', animation: 'spin 0.65s linear infinite', flexShrink: 0 }} />}
                  {status.type === 'success' && <span className="material-icons-round" style={{ fontSize: 16 }}>check_circle</span>}
                  {status.type === 'error' && <span className="material-icons-round" style={{ fontSize: 16 }}>error_outline</span>}
                  <span>{status.msg}</span>
                </div>
              )}
            </div>
          </form>
        )}

        {/* ── Results Tab ── */}
        {activeTab === 'results' && (
          <div className="form-card">
            {results.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                <span className="material-icons-round" style={{ fontSize: 48, display: 'block', marginBottom: 12, color: '#fca5a5' }}>search_off</span>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6, color: '#374151' }}>No Contacts Found</div>
                <div style={{ fontSize: 13, color: '#9ca3af' }}>No data was returned for the provided LinkedIn URLs</div>
              </div>
            ) : (
              <ResultsTable rows={results} onDownload={() => downloadExcel(results)} />
            )}
          </div>
        )}

      </div>
    </>
  )
}
