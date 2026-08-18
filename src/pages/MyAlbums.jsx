import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api.js'
import { Cover, ListenBadge, ScorePill, formatDate, GenreTag } from '../components/ui.jsx'

export default function MyAlbums() {
  const [reviews, setReviews] = useState(null)
  const [error, setError] = useState('')
  const [sort, setSort] = useState('recent') // recent | score

  useEffect(() => {
    api('/reviews/mine').then((d) => setReviews(d.reviews)).catch((e) => setError(e.message))
  }, [])

  if (error) return <div className="center muted">{error}</div>
  if (!reviews) return <div className="center muted">加载中…</div>
  if (reviews.length === 0) {
    return (
      <div className="empty">
        <p>你还没点评过专辑。</p>
        <p className="muted">去「搜专辑」标记第一张吧 🎧</p>
      </div>
    )
  }

  const sorted = [...reviews].sort((a, b) => {
    if (sort === 'score') return (b.score ?? -1) - (a.score ?? -1)
    return new Date(b.updated_at) - new Date(a.updated_at)
  })

  return (
    <div>
      <h2>我的专辑库（{reviews.length}）</h2>
      <div className="sort-bar">
        <div className="seg">
          <button className={'seg-btn ' + (sort === 'recent' ? 'active' : '')} onClick={() => setSort('recent')}>最近</button>
          <button className={'seg-btn ' + (sort === 'score' ? 'active' : '')} onClick={() => setSort('score')}>按分数</button>
        </div>
      </div>
      <div className="feed">
        {sorted.map((r) => (
          <Link to={'/albums/' + r.album_id} key={r.id} className="card mine-row">
            <Cover url={r.cover_url} title={r.title} size={56} />
            <div className="mine-meta">
              <div className="feed-title">{r.title}</div>
              <div className="muted">{r.artist}{r.year ? ' · ' + r.year : ''}<GenreTag genre={r.genre} /></div>
              <div className="muted small"><ListenBadge type={r.listen_type} />{formatDate(r.updated_at)}</div>
            </div>
            {r.score != null && <ScorePill score={r.score} />}
          </Link>
        ))}
      </div>
    </div>
  )
}
