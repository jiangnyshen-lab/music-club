import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api.js'
import { Cover, formatDate, GenreTag } from './ui.jsx'

// 首页顶部的「共听」横幅：展示发起人指定的当前专辑 + 已交作业的人
export default function FeaturedBanner() {
  const [f, setF] = useState(undefined) // undefined=加载中 null=没有

  useEffect(() => {
    api('/featured').then((d) => setF(d.featured)).catch(() => setF(null))
  }, [])

  if (!f) return null

  return (
    <div className="card featured">
      <div className="featured-head">
        <span className="featured-tag">🎯 共听</span>
        {f.ended
          ? <span className="badge badge-ended">已结束</span>
          : <span className="badge badge-full">进行中</span>}
        {f.ends_at && <span className="muted small">截止 {formatDate(f.ends_at)}</span>}
      </div>

      <Link to={'/albums/' + f.album.id} className="featured-album">
        <Cover url={f.album.cover_url} title={f.album.title} size={64} />
        <div className="featured-meta">
          <div className="feed-title">{f.album.title}</div>
          <div className="muted">{f.album.artist}{f.album.year ? ' · ' + f.album.year : ''}<GenreTag genre={f.album.genre} /></div>
          {f.note && <div className="featured-note">{f.note}</div>}
        </div>
      </Link>

      <div className="featured-reviews">
        {f.review_count > 0 ? (
          <>
            <div className="muted small">
              {f.creator_name} 发起 · {f.review_count} 人已交作业
              {typeof f.avg_score === 'number' ? ' · 平均 ' + f.avg_score.toFixed(1) : ''}
            </div>
            <div className="chips">
              {f.reviews.map((r, i) => (
                <span className="chip" key={i}>{r.display_name} {Number(r.score).toFixed(1)}</span>
              ))}
            </div>
          </>
        ) : (
          <div className="muted small">{f.creator_name} 发起 · 还没人交作业，去听第一张 👇</div>
        )}
      </div>

      <Link to={'/albums/' + f.album.id} className="ghost-btn">去点评 / 看大家</Link>
    </div>
  )
}
