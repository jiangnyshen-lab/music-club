import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api.js'
import { Cover, GenreTag } from '../components/ui.jsx'

function rankClass(i) {
  if (i === 1) return 'top1'
  if (i === 2) return 'top2'
  if (i === 3) return 'top3'
  return ''
}

export default function TopAlbums() {
  const [albums, setAlbums] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api('/top').then((d) => setAlbums(d.albums)).catch((e) => setError(e.message))
  }, [])

  if (error) return <div className="center muted">{error}</div>
  if (!albums) return <div className="center muted">加载中…</div>
  if (albums.length === 0) {
    return (
      <div className="empty">
        <p>还没有人打分。</p>
        <p className="muted">大家点评打分后，这里会出现圈子总榜 🏆</p>
      </div>
    )
  }

  return (
    <div>
      <h2>圈子排行榜</h2>
      <p className="muted small" style={{ marginTop: -8, marginBottom: 16 }}>按大家的平均分排序</p>
      <div className="feed">
        {albums.map((a, i) => (
          <Link to={'/albums/' + a.id} key={a.id} className="card top-row">
            <span className={'rank-badge ' + rankClass(i + 1)}>{i + 1}</span>
            <Cover url={a.cover_url} title={a.title} size={52} />
            <div className="top-meta">
              <div className="feed-title">{a.title}</div>
              <div className="muted">{a.artist}{a.year ? ' · ' + a.year : ''}<GenreTag genre={a.genre} /></div>
              <div className="top-count">{a.review_count} 人评过</div>
            </div>
            <div className="top-score">{Number(a.avg_score).toFixed(1)}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
