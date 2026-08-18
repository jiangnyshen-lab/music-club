import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api.js'
import { Cover, ListenBadge, ScorePill, formatDate, Avatar } from '../components/ui.jsx'
import ReviewActions from '../components/ReviewActions.jsx'
import FeaturedBanner from '../components/FeaturedBanner.jsx'

export default function Feed() {
  const [items, setItems] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api('/feed').then((d) => setItems(d.items)).catch((e) => setError(e.message))
  }, [])

  if (error) return <div className="center muted">{error}</div>
  if (!items) return <div className="center muted">加载中…</div>

  return (
    <div>
      <FeaturedBanner />
      {items.length === 0 ? (
        <div className="empty">
          <p>时间线还空着。</p>
          <p className="muted">去「搜专辑」标记你最近听的一张吧 🎧</p>
        </div>
      ) : (
      <div className="feed">
      {items.map((it) => (
        <div className="card feed-item" key={it.review_id}>
          <div className="feed-head">
            <Link to={'/albums/' + it.album_id}><Cover url={it.cover_url} title={it.title} size={56} /></Link>
            <div className="feed-meta">
              <div className="feed-title"><Link to={'/albums/' + it.album_id} className="album-link">{it.title}</Link></div>
              <div className="muted">{it.artist}{it.year ? ' · ' + it.year : ''}</div>
              <div className="feed-by muted">
                <Link to={'/users/' + it.user_id} className="feed-by-user"><Avatar user={{ display_name: it.display_name, avatar: it.avatar }} size={18} /> {it.display_name}</Link> 听过 · {formatDate(it.updated_at)}
              </div>
            </div>
            {it.score != null && <div className="feed-score"><ScorePill score={it.score} /></div>}
          </div>
          <div className="feed-body">
            <ListenBadge type={it.listen_type} />
            {it.impression && <p className="impression">{it.impression}</p>}
            {it.fav_track && <div className="mini"><span className="mini-label">最想再听</span>{it.fav_track}</div>}
            {it.least_track && <div className="mini"><span className="mini-label">最无感</span>{it.least_track}</div>}
          </div>
          <ReviewActions reviewId={it.review_id} likeCount={it.like_count} likedByMe={it.liked_by_me} commentCount={it.comment_count} />
        </div>
      ))}
      </div>
      )}
    </div>
  )
}
