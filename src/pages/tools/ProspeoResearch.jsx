import { useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import * as XLSX from 'xlsx'

// ── TagInput ──────────────────────────────────────────────────────
function TagInput({ tags, onAdd, onRemove, placeholder, maxTags = 10, inputId, validator }) {
  const [val, setVal] = useState('')

  function commit(raw) {
    const v = raw.trim()
    if (!v) return
    if (validator && !validator(v)) return
    onAdd(v)
    setVal('')
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); commit(val) }
    else if (e.key === 'Backspace' && val === '' && tags.length) onRemove(tags.length - 1)
  }

  function onPaste(e) {
    e.preventDefault()
    const lines = e.clipboardData.getData('text').split(/[\n\r,]+/).map(s => s.trim()).filter(Boolean)
    if (lines.length > 1) lines.forEach(l => onAdd(l))
    else setVal(lines[0] || '')
  }

  return (
    <div className="ps-tag-wrap" onClick={() => document.getElementById(inputId)?.focus()}>
      {tags.map((t, i) => (
        <span key={i} className="ps-tag">
          {t}
          <button type="button" onClick={() => onRemove(i)}>×</button>
        </span>
      ))}
      {tags.length < maxTags && (
        <input
          id={inputId}
          className="ps-tag-input"
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          placeholder={tags.length === 0 ? placeholder : ''}
          autoComplete="off"
        />
      )}
    </div>
  )
}

// ── AutocompleteTagInput ──────────────────────────────────────────
function AutocompleteTagInput({ tags, onAdd, onRemove, placeholder, fetchKey, inputId }) {
  const [val, setVal] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef(null)

  const fetchSuggestions = useCallback(async (q) => {
    if (q.length < 2) { setSuggestions([]); setOpen(false); return }
    setLoading(true)
    try {
      const res = await fetch('/api/search-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [fetchKey]: q }),
      })
      const data = await res.json()
      const key = fetchKey === 'job_title_search' ? 'job_title_suggestions' : 'location_suggestions'
      const raw = Array.isArray(data[key]) ? data[key] : []
      const items = raw.map(s => (typeof s === 'object' && s !== null ? s.name ?? s.label ?? String(s) : s))
      setSuggestions(items)
      setOpen(items.length > 0)
    } catch {
      setSuggestions([])
      setOpen(false)
    } finally {
      setLoading(false)
    }
  }, [fetchKey])

  function handleInput(e) {
    setVal(e.target.value)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSuggestions(e.target.value.trim()), 350)
  }

  function commit(text) {
    const v = (text || val).trim()
    if (!v) return
    onAdd(v)
    setVal('')
    setSuggestions([])
    setOpen(false)
  }

  function onKeyDown(e) {
    if (e.key === 'Enter') { e.preventDefault(); commit() }
    else if (e.key === 'Escape') setOpen(false)
    else if (e.key === 'Backspace' && val === '' && tags.length) onRemove(tags.length - 1)
  }

  return (
    <div style={{ position: 'relative' }}>
      <div className="ps-tag-wrap" onClick={() => document.getElementById(inputId)?.focus()}>
        {tags.map((t, i) => (
          <span key={i} className="ps-tag">
            {t}
            <button type="button" onClick={() => onRemove(i)}>×</button>
          </span>
        ))}
        <input
          id={inputId}
          className="ps-tag-input"
          value={val}
          onChange={handleInput}
          onKeyDown={onKeyDown}
          onBlur={() => setTimeout(() => setOpen(false), 180)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={tags.length === 0 ? placeholder : ''}
          autoComplete="off"
        />
      </div>

      {(open || loading) && (
        <div className="ps-dropdown">
          {loading && <div className="ps-dropdown-msg">Searching…</div>}
          {!loading && suggestions.length === 0 && <div className="ps-dropdown-msg">No suggestions</div>}
          {suggestions.map((s, i) => (
            <div
              key={i}
              className="ps-dropdown-item"
              onMouseDown={() => commit(s)}
            >
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Stepper ───────────────────────────────────────────────────────
function Stepper({ value, onChange, min = 1, max = 2 }) {
  return (
    <div className="ps-stepper">
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))}>−</button>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={e => onChange(Math.min(max, Math.max(min, parseInt(e.target.value) || min)))}
      />
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))}>+</button>
    </div>
  )
}

// ── Toggle ────────────────────────────────────────────────────────
function Toggle({ checked, onChange, label, hint }) {
  return (
    <label className="ps-toggle-row">
      <div className="ps-toggle-label">
        <span>{label}</span>
        {hint && <span className="ps-toggle-hint">{hint}</span>}
      </div>
      <div className="ps-switch">
        <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
        <span className="ps-slider" />
      </div>
    </label>
  )
}

// ── Status Bar ────────────────────────────────────────────────────
function StatusBar({ type, msg }) {
  if (type === 'idle') return null
  const styles = {
    loading: { bg: 'rgba(79,110,247,0.08)', border: 'rgba(79,110,247,0.3)', color: '#4f6ef7' },
    success: { bg: 'rgba(20,160,90,0.08)', border: 'rgba(20,160,90,0.3)', color: '#14a05a' },
    error:   { bg: 'rgba(217,48,37,0.08)', border: 'rgba(217,48,37,0.3)', color: '#d93025' },
  }
  const s = styles[type] || styles.error
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      marginTop: 14, padding: '10px 14px', borderRadius: 10,
      background: s.bg, border: `1px solid ${s.border}`, color: s.color,
      fontSize: 13, fontWeight: 500,
    }}>
      {type === 'loading' && (
        <div style={{
          width: 14, height: 14, borderRadius: '50%',
          border: '2px solid currentColor', borderTopColor: 'transparent',
          animation: 'spin 0.65s linear infinite', flexShrink: 0,
        }} />
      )}
      {type === 'success' && <span className="material-icons-round" style={{ fontSize: 16 }}>check_circle</span>}
      {type === 'error' && <span className="material-icons-round" style={{ fontSize: 16 }}>error_outline</span>}
      <span>{msg}</span>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────
function useTagState() {
  const [tags, setTags] = useState([])
  const add = v => setTags(p => p.includes(v) ? p : [...p, v])
  const remove = i => setTags(p => p.filter((_, idx) => idx !== i))
  return [tags, add, remove, setTags]
}

const RESULT_COLUMNS = [
  { key: 'first_name',        label: 'First Name' },
  { key: 'last_name',         label: 'Last Name' },
  { key: 'full_name',         label: 'Full Name' },
  { key: 'job_title',         label: 'Job Title' },
  { key: 'headline',          label: 'Headline' },
  { key: 'email',             label: 'Email' },
  { key: 'phone',             label: 'Phone' },
  { key: 'city',              label: 'City' },
  { key: 'state',             label: 'State' },
  { key: 'country',           label: 'Country' },
  { key: 'linkedin_url',      label: 'LinkedIn URL' },
  { key: 'company_name',      label: 'Company Name' },
  { key: 'company_domain',    label: 'Company Domain' },
  { key: 'company_website',   label: 'Company Website' },
  { key: 'company_industry',  label: 'Industry' },
]

function downloadExcel(rows, filename = 'prospeo_results.xlsx') {
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
            background: 'linear-gradient(135deg, #10b981, #059669)',
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
                {RESULT_COLUMNS.map(c => (
                  <td key={c.key} style={{ padding: '9px 14px', color: '#374151', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {c.key === 'linkedin_url' && row[c.key] ? (
                      <a href={row[c.key]} target="_blank" rel="noreferrer" style={{ color: '#4f7cff', textDecoration: 'none' }}>
                        {row[c.key].replace(/https?:\/\/(www\.)?linkedin\.com\/in\//i, '').replace(/\/$/, '')}
                      </a>
                    ) : (row[c.key] || <span style={{ color: '#d1d5db' }}>—</span>)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────
export default function ProspeoResearch() {
  const [activeTab, setActiveTab] = useState('search')
  const [results, setResults] = useState([])

  // Search Filters state
  const [companyNames, addCN, removeCN] = useTagState()
  const [websites, addWS, removeWS] = useTagState()
  const [designations, addDes, removeDes] = useTagState()
  const [locations, addLoc, removeLoc] = useTagState()
  const [exactMatch, setExactMatch] = useState(false)
  const [countPerCompany, setCountPerCompany] = useState(1)
  const [searchStatus, setSearchStatus] = useState({ type: 'idle', msg: '' })
  const [searchLoading, setSearchLoading] = useState(false)

  // LinkedIn state
  const [linkedinUrls, addLI, removeLI] = useTagState()
  const [linkedinStatus, setLinkedinStatus] = useState({ type: 'idle', msg: '' })
  const [linkedinLoading, setLinkedinLoading] = useState(false)

  function isLinkedInUrl(url) {
    let u = url.trim()
    if (!/^https?:\/\//i.test(u)) u = 'https://' + u
    return u.includes('linkedin.com')
  }

  function addLinkedIn(raw) {
    let u = raw.trim()
    if (!u) return
    if (!/^https?:\/\//i.test(u)) u = 'https://' + u
    if (!u.includes('linkedin.com')) return
    addLI(u)
  }

  function handleResults(data) {
    const rows = Array.isArray(data) ? data : (data?.data ?? data?.results ?? [])
    if (rows.length > 0) {
      setResults(rows)
      setActiveTab('results')
    }
  }

  async function handleSubmitSearch(e) {
    e.preventDefault()
    if (!designations.length) return setSearchStatus({ type: 'error', msg: 'Add at least one designation.' })
    if (!locations.length) return setSearchStatus({ type: 'error', msg: 'Add at least one location.' })

    const payload = {
      prospeo_payload: {
        page: 1,
        filters: {
          ...(companyNames.length || websites.length ? {
            company: {
              ...(companyNames.length && { names: { include: companyNames } }),
              ...(websites.length && { websites: { include: websites } }),
            }
          } : {}),
          person_job_title: { include: designations, match_only_exact_job_titles: exactMatch },
          person_location_search: { include: locations },
          max_person_per_company: countPerCompany,
        },
      },
      meta: {
        submitted_at: new Date().toISOString(),
        company_names: companyNames,
        company_websites: websites,
        designations,
        locations,
        exact_match: exactMatch,
        count_per_company: countPerCompany,
      },
    }

    setSearchLoading(true)
    setSearchStatus({ type: 'loading', msg: 'Sending to n8n — this may take a minute…' })

    try {
      const res = await fetch('/api/submit-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const contentType = res.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        const data = await res.json()
        if (!res.ok) {
          setSearchStatus({ type: 'error', msg: data?.error || `Server error ${res.status}` })
        } else {
          handleResults(data)
          setSearchStatus({ type: 'success', msg: `✓ Results loaded — switch to the Results tab.` })
        }
      } else {
        // blob fallback (Excel returned directly)
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a'); a.href = url; a.download = 'results.xlsx'
        document.body.appendChild(a); a.click(); document.body.removeChild(a)
        URL.revokeObjectURL(url)
        setSearchStatus({ type: 'success', msg: '✓ File downloaded directly.' })
      }
    } catch {
      setSearchStatus({ type: 'error', msg: 'Could not reach the server. Make sure npm run dev is running.' })
    } finally {
      setSearchLoading(false)
    }
  }

  async function handleSubmitLinkedin(e) {
    e.preventDefault()
    if (!linkedinUrls.length) return setLinkedinStatus({ type: 'error', msg: 'Add at least one LinkedIn URL.' })

    setLinkedinLoading(true)
    setLinkedinStatus({ type: 'loading', msg: `Sending ${linkedinUrls.length} URL(s) to n8n…` })

    try {
      const res = await fetch('/api/submit-linkedin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          linkedin_urls: linkedinUrls,
          meta: { submitted_at: new Date().toISOString(), count: linkedinUrls.length },
        }),
      })

      const contentType = res.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        const data = await res.json()
        if (!res.ok) {
          setLinkedinStatus({ type: 'error', msg: data?.error || `Server error ${res.status}` })
        } else {
          handleResults(data)
          setLinkedinStatus({ type: 'success', msg: '✓ Results loaded — switch to the Results tab.' })
        }
      } else {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a'); a.href = url; a.download = 'results.xlsx'
        document.body.appendChild(a); a.click(); document.body.removeChild(a)
        URL.revokeObjectURL(url)
        setLinkedinStatus({ type: 'success', msg: '✓ File downloaded directly.' })
      }
    } catch {
      setLinkedinStatus({ type: 'error', msg: 'Could not reach the server.' })
    } finally {
      setLinkedinLoading(false)
    }
  }

  const tabs = [
    { id: 'search',   label: 'Search Filters' },
    { id: 'linkedin', label: 'LinkedIn Lookup' },
    { id: 'results',  label: results.length > 0 ? `Results (${results.length})` : 'Results' },
  ]

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28 }}>
        <Link to="/" className="back-btn" style={{ flexShrink: 0 }}>
          <span className="material-icons-round" style={{ fontSize: 16 }}>arrow_back</span>
          Back
        </Link>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14 }}>
          <div className="tool-page-icon" style={{ background: '#10b98122', flexShrink: 0 }}>
            <span className="material-icons-round" style={{ color: '#10b981', fontSize: 26 }}>
              person_search
            </span>
          </div>
          <div>
            <div className="tool-page-title" style={{ marginBottom: 2 }}>Contact Enrichment</div>
            <div className="tool-page-subtitle">
              Find verified prospect emails, job titles &amp; LinkedIn profiles — exported as Excel
            </div>
          </div>
        </div>

        {/* spacer to balance the back button */}
        <div style={{ flexShrink: 0, width: 250 }} />
      </div>

      {/* Tab bar — outside the card, same style as Apify */}
      <div style={{ maxWidth: activeTab === 'results' ? '100%' : 720, margin: '0 auto 0 auto' }}>
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

      <div className="tool-page" style={{ maxWidth: activeTab === 'results' ? '100%' : 720, margin: '0 auto' }}>

        {/* ── Search Filters Tab ── */}
        {activeTab === 'search' && (
          <form onSubmit={handleSubmitSearch}>

            <div className="form-card">
              <div className="form-section-title">
                <span className="material-icons-round" style={{ color: '#10b981', fontSize: 16 }}>business</span>
                Company
                <span style={{ fontWeight: 400, fontSize: 13, color: '#9ca3af', marginLeft: 6 }}>(fill Name or Website or both)</span>
              </div>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Company Names</label>
                  <TagInput
                    tags={companyNames}
                    onAdd={addCN}
                    onRemove={removeCN}
                    placeholder="Type a name, press Enter…"
                    inputId="companyNameInput"
                    maxTags={10}
                  />
                  <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>e.g. Havells · Max 10</div>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Company Websites</label>
                  <TagInput
                    tags={websites}
                    onAdd={addWS}
                    onRemove={removeWS}
                    placeholder="Type a domain, press Enter…"
                    inputId="websiteInput"
                    maxTags={10}
                  />
                  <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>e.g. havells.com · Max 10</div>
                </div>
              </div>
            </div>

            <div className="form-card">
              <div className="form-section-title">
                <span className="material-icons-round" style={{ color: '#10b981', fontSize: 16 }}>person_search</span>
                People Filters
              </div>

              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label">Designations <span style={{ color: '#ef4444' }}>*</span></label>
                  <AutocompleteTagInput
                    tags={designations}
                    onAdd={addDes}
                    onRemove={removeDes}
                    placeholder="Type a job title…"
                    fetchKey="job_title_search"
                    inputId="designationInput"
                  />
                  <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>Suggestions from Prospeo · Press Enter or select · Add multiple</div>
                </div>

                <div className="col-12">
                  <Toggle
                    checked={exactMatch}
                    onChange={setExactMatch}
                    label="Exact Job Title Match"
                    hint="When off, also matches similar titles"
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">Location <span style={{ color: '#ef4444' }}>*</span></label>
                  <AutocompleteTagInput
                    tags={locations}
                    onAdd={addLoc}
                    onRemove={removeLoc}
                    placeholder="Type a city or country…"
                    fetchKey="location_search"
                    inputId="locationInput"
                  />
                  <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>Select from suggestions · Add multiple locations</div>
                </div>

                <div className="col-md-5">
                  <label className="form-label">Max People per Company</label>
                  <Stepper value={countPerCompany} onChange={setCountPerCompany} min={1} max={2} />
                  <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>Maximum 2 per company</div>
                </div>
              </div>

              <hr className="divider" />

              <button
                type="submit"
                className="submit-btn"
                disabled={searchLoading}
                style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 4px 14px rgba(16,185,129,0.3)' }}
              >
                {searchLoading ? (
                  <>
                    <div className="spinner" />
                    Searching…
                  </>
                ) : (
                  <>
                    <span className="material-icons-round" style={{ fontSize: 18 }}>person_search</span>
                    Trigger Search
                  </>
                )}
              </button>

              <StatusBar type={searchStatus.type} msg={searchStatus.msg} />
            </div>
          </form>
        )}

        {/* ── LinkedIn Lookup Tab ── */}
        {activeTab === 'linkedin' && (
          <form onSubmit={handleSubmitLinkedin}>
            <div className="form-card">
              <div className="form-section-title">
                <span className="material-icons-round" style={{ color: '#10b981', fontSize: 16 }}>link</span>
                LinkedIn Profile URLs
              </div>

              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label">Profile URLs <span style={{ color: '#ef4444' }}>*</span></label>
                  <TagInput
                    tags={linkedinUrls.map(u =>
                      '↗ ' + u.replace(/https?:\/\/(www\.)?linkedin\.com\/in\//i, '').replace(/\/$/, '')
                    )}
                    onAdd={addLinkedIn}
                    onRemove={removeLI}
                    placeholder="Paste a LinkedIn URL and press Enter…"
                    inputId="linkedinInput"
                    maxTags={5}
                  />
                  <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>Max 5 URLs · e.g. linkedin.com/in/username</div>
                </div>

                {linkedinUrls.length > 0 && (
                  <div className="col-12">
                    <div style={{ fontSize: 13, color: '#10b981', fontWeight: 600 }}>
                      {linkedinUrls.length} URL(s) added
                    </div>
                  </div>
                )}
              </div>

              <hr className="divider" />

              <button
                type="submit"
                className="submit-btn"
                disabled={linkedinLoading}
                style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 4px 14px rgba(10,102,194,0.3)' }}
              >
                {linkedinLoading ? (
                  <>
                    <div className="spinner" />
                    Looking up…
                  </>
                ) : (
                  <>
                    <span className="material-icons-round" style={{ fontSize: 18 }}>link</span>
                    Trigger LinkedIn Lookup
                  </>
                )}
              </button>

              <StatusBar type={linkedinStatus.type} msg={linkedinStatus.msg} />
            </div>
          </form>
        )}

        {/* ── Results Tab ── */}
        {activeTab === 'results' && (
          <div className="form-card">
            {results.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 24px', color: '#9ca3af' }}>
                <span className="material-icons-round" style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>table_view</span>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6, color: '#6b7280' }}>No results yet</div>
                <div style={{ fontSize: 13 }}>Run a search or LinkedIn lookup to see contacts here</div>
              </div>
            ) : (
              <ResultsTable
                rows={results}
                onDownload={() => downloadExcel(results)}
              />
            )}
          </div>
        )}

      </div>
    </>
  )
}
