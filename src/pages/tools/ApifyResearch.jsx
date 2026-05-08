import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import * as XLSX from 'xlsx'

const WEBHOOK_URL = import.meta.env.VITE_APIFY_WEBHOOK || ''

const COMPANY_SIZES = ['', '1–10', '11–50', '51–200', '201–500', '501–1000', '1000+']

const RESULT_COLUMNS = [
  { key: 'Title',              label: 'Company Name' },
  { key: 'address',            label: 'Address' },
  { key: 'city',               label: 'City' },
  { key: 'website',            label: 'Website' },
  { key: 'phone',              label: 'Phone' },
  { key: 'company_type',       label: 'Company Type' },
  { key: 'industry_match',     label: 'Industry Match' },
  { key: 'sales_ready',        label: 'Sales Ready' },
  { key: 'fit_score',          label: 'Fit Score' },
  { key: 'confidence_score',   label: 'Confidence Score' },
  { key: 'reason_for_fit',     label: 'Reason for Fit' },
  { key: 'key_evidence',       label: 'Key Evidence' },
]

function downloadExcel(rows, filename = 'apify_results.xlsx') {
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

function badgeStyle(value) {
  const v = String(value).toUpperCase()
  if (v === 'HIGH' || v === 'YES') return { background: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0' }
  if (v === 'MEDIUM') return { background: '#fef9c3', color: '#ca8a04', border: '1px solid #fef08a' }
  if (v === 'LOW' || v === 'NO') return { background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca' }
  return null
}

function ResultsTable({ rows, onDownload }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ fontSize: 14, color: '#6b7280', fontWeight: 500 }}>
          <span style={{ color: '#111827', fontWeight: 700, fontSize: 18 }}>{rows.length}</span>
          {' '}compan{rows.length !== 1 ? 'ies' : 'y'} found
        </div>
        <button
          type="button"
          onClick={onDownload}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '9px 18px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, #ff6b35, #ff9a35)',
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
              <th style={{ padding: '10px 14px', textAlign: 'left', borderBottom: '1.5px solid #e5e7eb', color: '#374151', fontWeight: 600, position: 'sticky', left: 0, background: '#f9fafb', zIndex: 1 }}>
                #
              </th>
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
                <td style={{ padding: '9px 14px', color: '#9ca3af', fontWeight: 500, position: 'sticky', left: 0, background: i % 2 === 0 ? '#fff' : '#fafafa', zIndex: 1 }}>
                  {i + 1}
                </td>
                {RESULT_COLUMNS.map(c => {
                  const val = row[c.key]
                  const badge = (c.key === 'industry_match' || c.key === 'sales_ready') ? badgeStyle(val) : null
                  return (
                    <td key={c.key} style={{ padding: '9px 14px', color: '#374151', maxWidth: c.key === 'reason_for_fit' || c.key === 'key_evidence' ? 280 : 180, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {badge ? (
                        <span style={{ ...badge, padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{val}</span>
                      ) : c.key === 'website' && val ? (
                        <a href={val} target="_blank" rel="noreferrer" style={{ color: '#4f7cff', textDecoration: 'none' }}>
                          {String(val).replace(/^https?:\/\//, '')}
                        </a>
                      ) : (val !== undefined && val !== '' ? val : <span style={{ color: '#d1d5db' }}>—</span>)}
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

export default function ApifyResearch() {
  const [activeTab, setActiveTab] = useState('form')
  const [results, setResults] = useState([])

  const [form, setForm] = useState({
    client_name: '',
    client_website: '',
    manual_business_description: '',
    product_services_solutions: '',
    target_location: '',
    target_industry: '',
    target_company_size: '',
    include_dealers_distributors: '',
    special_targeting_instruction: '',
    max_records: '',
  })

  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState({ type: 'idle', msg: '' })
  const intervalRef = useRef(null)

  function set(key, val) { setForm(f => ({ ...f, [key]: val })) }

  function startProgress() {
    setProgress(10)
    intervalRef.current = setInterval(() => {
      setProgress(p => (p < 85 ? p + 2 : p))
    }, 2000)
  }

  function stopProgress(final = 100) {
    clearInterval(intervalRef.current)
    setProgress(final)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setStatus({ type: 'loading', msg: 'Running market research — this may take up to 10 minutes…' })
    startProgress()

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, max_records: parseInt(form.max_records) || 0 }),
        signal: AbortSignal.timeout(600000),
      })

      stopProgress(100)
      const contentType = res.headers.get('content-type') || ''

      if (contentType.includes('application/json')) {
        const data = await res.json()
        if (!res.ok) {
          setStatus({ type: 'error', msg: data?.error || `Server error ${res.status}` })
        } else {
          const rows = Array.isArray(data) ? data : (data?.data ?? data?.results ?? [])
          setResults(rows)
          setActiveTab('results')
          setStatus({ type: 'success', msg: `✓ ${rows.length} companies found` })
        }
      } else {
        // blob fallback
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a'); a.href = url; a.download = 'apify_results.xlsx'
        document.body.appendChild(a); a.click(); document.body.removeChild(a)
        URL.revokeObjectURL(url)
        setStatus({ type: 'success', msg: '✓ Results downloaded directly.' })
      }
    } catch (err) {
      stopProgress(0)
      setStatus({ type: 'error', msg: err.name === 'TimeoutError' ? 'Request timed out after 10 minutes.' : 'Could not reach the webhook. Check the URL in .env.' })
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'form',    label: 'Research Form' },
    { id: 'results', label: results.length > 0 ? `Results (${results.length})` : 'Results' },
  ]

  const statusColors = {
    loading: { bg: 'rgba(79,110,247,0.08)', border: 'rgba(79,110,247,0.3)', color: '#4f6ef7' },
    success: { bg: 'rgba(20,160,90,0.08)', border: 'rgba(20,160,90,0.3)', color: '#14a05a' },
    error:   { bg: 'rgba(217,48,37,0.08)', border: 'rgba(217,48,37,0.3)', color: '#d93025' },
  }

  return (
    <>
      {/* Centered header row */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28 }}>
        <Link to="/" className="back-btn" style={{ flexShrink: 0 }}>
          <span className="material-icons-round" style={{ fontSize: 16 }}>arrow_back</span>
          Back
        </Link>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14 }}>
          <div className="tool-page-icon" style={{ background: '#ff6b3522', flexShrink: 0 }}>
            <span className="material-icons-round" style={{ color: '#ff6b35', fontSize: 26 }}>
              travel_explore
            </span>
          </div>
          <div>
            <div className="tool-page-title" style={{ marginBottom: 2 }}>Local Data Research</div>
            <div className="tool-page-subtitle">
              AI-powered market research — finds target companies and exports results as Excel
            </div>
          </div>
        </div>

        <div style={{ flexShrink: 0, width: 250 }} />
      </div>

      <div className="tool-page" style={{ maxWidth: activeTab === 'results' ? '100%' : 760, margin: '0 auto' }}>

        {/* Tab bar */}
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

        {/* ── Research Form Tab ── */}
        {activeTab === 'form' && (
          <form onSubmit={handleSubmit}>
            <div className="form-card">
              <div className="form-section-title">
                <span className="material-icons-round" style={{ color: '#ff6b35', fontSize: 16 }}>business</span>
                Client Information
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Client Name</label>
                  <input type="text" className="form-control" placeholder="e.g. Acme Corp"
                    value={form.client_name} onChange={e => set('client_name', e.target.value)} disabled={loading} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Client Website</label>
                  <input type="text" className="form-control" placeholder="e.g. acmecorp.com"
                    value={form.client_website} onChange={e => set('client_website', e.target.value)} disabled={loading} />
                </div>
                <div className="col-12">
                  <label className="form-label">Business Description</label>
                  <textarea className="form-control" placeholder="Client business information"
                    value={form.manual_business_description} onChange={e => set('manual_business_description', e.target.value)}
                    disabled={loading} rows={3} />
                </div>
                <div className="col-12">
                  <label className="form-label">Products / Services / Solutions</label>
                  <textarea className="form-control" placeholder="Client product and services"
                    value={form.product_services_solutions} onChange={e => set('product_services_solutions', e.target.value)}
                    disabled={loading} rows={3} />
                </div>
              </div>
            </div>

            <div className="form-card">
              <div className="form-section-title">
                <span className="material-icons-round" style={{ color: '#ff6b35', fontSize: 16 }}>tune</span>
                Target Audience
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Target Location</label>
                  <input type="text" className="form-control" placeholder="e.g. Mumbai, India"
                    value={form.target_location} onChange={e => set('target_location', e.target.value)} disabled={loading} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Target Industry</label>
                  <input type="text" className="form-control" placeholder="e.g. Manufacturing, Retail"
                    value={form.target_industry} onChange={e => set('target_industry', e.target.value)} disabled={loading} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Target Company Size</label>
                  <select className="form-select" value={form.target_company_size}
                    onChange={e => set('target_company_size', e.target.value)} disabled={loading}>
                    {COMPANY_SIZES.map(s => <option key={s} value={s}>{s || 'Any size'}</option>)}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Include Dealers / Distributors</label>
                  <select className="form-select" value={form.include_dealers_distributors}
                    onChange={e => set('include_dealers_distributors', e.target.value)} disabled={loading}>
                    <option value="">Select</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label">Special Targeting Instructions</label>
                  <textarea className="form-control" placeholder="Specific instructions for targeting"
                    value={form.special_targeting_instruction} onChange={e => set('special_targeting_instruction', e.target.value)}
                    disabled={loading} rows={3} />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Max Records (Lead Count)</label>
                  <input type="number" className="form-control" placeholder="e.g. 500"
                    value={form.max_records} onChange={e => set('max_records', e.target.value)} disabled={loading} />
                </div>
              </div>

              <hr className="divider" />

              <button
                type="submit"
                className="submit-btn"
                disabled={loading}
                style={{ background: 'linear-gradient(135deg, #ff6b35, #ff9a35)', boxShadow: '0 4px 14px rgba(255,107,53,0.3)' }}
              >
                {loading ? (
                  <>
                    <div className="spinner" />
                    Running Research...
                  </>
                ) : (
                  <>
                    <span className="material-icons-round" style={{ fontSize: 18 }}>travel_explore</span>
                    Start Market Research
                  </>
                )}
              </button>

              {/* Status / progress */}
              {status.type !== 'idle' && (
                <div style={{
                  marginTop: 14, padding: '12px 14px', borderRadius: 10,
                  background: statusColors[status.type]?.bg,
                  border: `1px solid ${statusColors[status.type]?.border}`,
                  color: statusColors[status.type]?.color,
                  fontSize: 13, fontWeight: 500,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: status.type === 'loading' ? 10 : 0 }}>
                    {status.type === 'loading' && (
                      <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid currentColor', borderTopColor: 'transparent', animation: 'spin 0.65s linear infinite', flexShrink: 0 }} />
                    )}
                    {status.type === 'success' && <span className="material-icons-round" style={{ fontSize: 16 }}>check_circle</span>}
                    {status.type === 'error' && <span className="material-icons-round" style={{ fontSize: 16 }}>error_outline</span>}
                    <span>{status.msg}</span>
                  </div>
                  {status.type === 'loading' && (
                    <div style={{ background: 'rgba(255,255,255,0.5)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${progress}%`, background: 'currentColor', borderRadius: 4, transition: 'width 0.4s ease' }} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </form>
        )}

        {/* ── Results Tab ── */}
        {activeTab === 'results' && (
          <div className="form-card">
            {results.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 24px', color: '#9ca3af' }}>
                <span className="material-icons-round" style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>travel_explore</span>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6, color: '#6b7280' }}>No results yet</div>
                <div style={{ fontSize: 13 }}>Run a market research to see companies here</div>
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
