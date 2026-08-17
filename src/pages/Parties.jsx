import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api.js'
import { Cover, formatDate, partyStatus } from '../components/ui.jsx'

export default function Parties() {
  const [parties, setParties] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api('/parties').then((d) => setParties(d.parties)).catch((e) => setError(e.message))
  }, [])

  if (error) return <div className="center muted">{error}</div>
  if (!parties) return <div className="center muted">加载中…</div>
  if (parties.length === 0) {
    return (
      <div className="empty">
        <p>还没有听友会。</p>
        <p className="muted">去一张专辑页，点「发起听友会」约朋友一起听 🎧</p>
      </div>
    )
  }

  return (
    <div className="feed">
      {parties.map((p) => {
        const st = partyStatus(p.scheduled_date)
        return (
          <Link to={'/parties/' + p.id} key={p.id} className="card party-row">
            <Cover url={p.cover_url} title={p.album_title} size={56} />
            <div className="party-meta">
              <div className="feed-title">
                {p.title || '一起听：' + p.album_title}
                {st && <span className={'badge ' + st.cls}>{st.label}</span>}
              </div>
              <div className="muted">{p.album_title} — {p.album_artist}</div>
              <div className="muted small">
                {p.creator_name} 发起 · {formatDate(p.created_at)}{p.scheduled_date ? ' · 约 ' + p.scheduled_date : ''}
              </div>
            </div>
            <div className="party-stats muted">{p.member_count} 人 · {p.post_count} 条讨论</div>
          </Link>
        )
      })}
    </div>
  )
}
