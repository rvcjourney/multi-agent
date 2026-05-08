import express from 'express'
import axios from 'axios'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { existsSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dirname, '../.env') })

const app = express()
app.use(express.json({ limit: '2mb' }))

// ── Serve built frontend in production ────────────────────────────
const distPath = resolve(__dirname, '../dist')
if (existsSync(distPath)) {
  app.use(express.static(distPath))
}

const PROSPEO_API_KEY  = process.env.PROSPEO_API_KEY || ''
const N8N_WEBHOOK      = process.env.VITE_PROSPEO_WEBHOOK || ''

// ── Prospeo autocomplete suggestions ─────────────────────────────
app.post('/api/search-suggestions', async (req, res) => {
  if (!PROSPEO_API_KEY) {
    return res.status(500).json({ error: 'PROSPEO_API_KEY not set in .env' })
  }
  try {
    const response = await axios.post(
      'https://api.prospeo.io/search-suggestions',
      req.body,
      {
        headers: {
          'X-KEY': PROSPEO_API_KEY,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    )
    res.json(response.data)
  } catch (err) {
    const status = err.response?.status || 500
    res.status(status).json({ error: err.response?.data || err.message })
  }
})

// ── Submit (search + LinkedIn both use same webhook) ──────────────
async function forwardToN8n(req, res) {
  if (!N8N_WEBHOOK) {
    return res.status(500).json({ error: 'VITE_PROSPEO_WEBHOOK not set in .env' })
  }
  try {
    const response = await axios.post(N8N_WEBHOOK, req.body, {
      responseType: 'arraybuffer',
      timeout: 180000,
    })
    const contentType = response.headers['content-type'] || 'application/octet-stream'
    const cd = response.headers['content-disposition']
    res.set('Content-Type', contentType)
    if (cd) res.set('Content-Disposition', cd)
    res.send(Buffer.from(response.data))
  } catch (err) {
    const status = err.response?.status || 500
    res.status(status).json({ error: err.message })
  }
}

app.post('/api/submit-search', forwardToN8n)
app.post('/api/submit-linkedin', forwardToN8n)

// ── Catch-all: serve React app for all non-API routes ─────────────
if (existsSync(distPath)) {
  app.get('/{*path}', (req, res) => {
    res.sendFile(resolve(distPath, 'index.html'))
  })
}

const PORT = process.env.PORT || 4005
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on http://0.0.0.0:${PORT}`))
