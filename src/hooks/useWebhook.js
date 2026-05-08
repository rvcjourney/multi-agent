import { useState } from 'react'
import axios from 'axios'

export function useWebhook() {
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState(0)

  async function call(webhookUrl, payload, { timeout = 120000, progressStep = 800 } = {}) {
    setStatus('loading')
    setError(null)
    setResult(null)
    setProgress(10)

    const progressInterval = setInterval(() => {
      setProgress(p => (p < 85 ? p + 3 : p))
    }, progressStep)

    try {
      const res = await axios.post(webhookUrl, payload, {
        responseType: 'blob',
        timeout,
      })
      clearInterval(progressInterval)
      setProgress(100)

      const contentType = res.headers['content-type'] || ''
      const isExcel =
        contentType.includes('spreadsheetml') ||
        contentType.includes('octet-stream') ||
        contentType.includes('excel')

      const blob = new Blob([res.data], {
        type: isExcel
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : contentType,
      })

      const url = URL.createObjectURL(blob)
      const contentDisposition = res.headers['content-disposition'] || ''
      const match = contentDisposition.match(/filename="?([^"]+)"?/)
      const filename = match ? match[1] : 'results.xlsx'

      setResult({ url, filename })
      setStatus('success')
    } catch (err) {
      clearInterval(progressInterval)
      setProgress(0)
      const msg =
        err.response?.data?.message ||
        err.response?.statusText ||
        err.message ||
        'Request failed. Please check the webhook URL and try again.'
      setError(msg)
      setStatus('error')
    }
  }

  function reset() {
    setStatus('idle')
    setResult(null)
    setError(null)
    setProgress(0)
  }

  return { status, result, error, progress, call, reset }
}
