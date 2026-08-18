import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api.js'
import { Cover, GenreTag } from '../components/ui.jsx'

export default function Search() {
  const [q, setQ] = useState('')
  const [results, setResults] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()

  async function run(e) {
    e.preventDefault()
    if (!q.trim()) return
    setBusy(true)
    setError('')
    try {
      const d = await api('/search?q=' + encodeURIComponent(q.trim()))
      setResults(d.results)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function pick(album) {
    setBusy(true)
    setError('')
    try {
      const d = await api('/albums', { method: 'POST', body: JSON.stringify(album) })
      navigate('/albums/' + d.album.id)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <form className="search-bar" onSubmit={run}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="输入专辑名，例如 OK Computer" autoFocus />
        <button className="primary-btn" disabled={busy}>搜索</button>
      </form>
      {error && <div className="error">{error}</div>}
      {results && results.length === 0 && <div className="center muted">没找到，换个关键词试试？</div>}
      {results && results.length > 0 && (
        <div className="results">
          {results.map((r) => (
            <div className="card result-row" key={r.collectionId}>
              <Cover url={r.coverUrl} title={r.title} size={56} />
              <div className="result-meta">
                <div className="result-title">{r.title}</div>
                <div className="muted">{r.artist} · {r.year || '—'}{r.trackCount ? ' · ' + r.trackCount + ' 首' : ''}<GenreTag genre={r.genre} /></div>
              </div>
              <button className="ghost-btn" onClick={() => pick(r)} disabled={busy}>去点评</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
