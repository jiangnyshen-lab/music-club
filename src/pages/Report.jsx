import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api.js'
import { Cover, ScorePill } from '../components/ui.jsx'

export default function Report() {
  const [stats, setStats] = useState(null)
  const [taste, setTaste] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api('/stats').then((d) => setStats(d)).catch((e) => setError(e.message))
    api('/taste').then((d) => setTaste(d.matches)).catch(() => {})
  }, [])

  if (error) return <div className="center muted">{error}</div>
  if (!stats) return <div className="center muted">加载中…</div>

  const { circle, me } = stats

  return (
    <div>
      <h2>数据报告</h2>

      <section>
        <h3>圈子概览</h3>
        <div className="stat-grid">
          <Stat label="听过的专辑" value={circle.album_count} />
          <Stat label="点评总数" value={circle.review_count} />
          <Stat label="全圈平均分" value={circle.avg_score == null ? '—' : circle.avg_score.toFixed(1)} />
        </div>
        <div className="card">
          <div className="mini">🏆 最活跃：{circle.top_listener ? circle.top_listener.display_name + '（' + circle.top_listener.c + ' 条点评）' : '还没有人点评'}</div>
          <div className="mini">🧐 最挑剔：{circle.strictest ? circle.strictest.display_name + '（平均 ' + Number(circle.strictest.a).toFixed(1) + ' 分）' : '还没人评够 3 张'}</div>
        </div>
      </section>

      <section>
        <h3>我的数据</h3>
        <div className="stat-grid">
          <Stat label="我的点评" value={me.review_count} />
          <Stat label="我的平均分" value={me.avg_score == null ? '—' : me.avg_score.toFixed(1)} />
        </div>
        {me.top.length > 0 && (
          <div className="card">
            <div className="muted small">我的高分 Top 5</div>
            {me.top.map((a) => (
              <Link to={'/albums/' + a.id} key={a.id} className="mine-row top-item">
                <Cover url={a.cover_url} title={a.title} size={40} />
                <div className="mine-meta">
                  <div className="feed-title">{a.title}</div>
                  <div className="muted">{a.artist}{a.year ? ' · ' + a.year : ''}</div>
                </div>
                <ScorePill score={a.score} />
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h3>口味最像的朋友</h3>
        {(!taste || taste.length === 0) ? (
          <div className="muted small">还没有足够的共同点评数据，多听几张就有啦</div>
        ) : (
          <div className="card">
            {taste.map((m) => (
              <div className="taste-row" key={m.id}>
                <span className="taste-name">{m.display_name}</span>
                <span className="muted small">共同听过 {m.common_count} 张 · 平均差 {Number(m.avg_diff).toFixed(1)} 分</span>
              </div>
            ))}
          </div>
        )}
        <p className="muted small">平均差越小，说明你们给同样专辑打的分越接近。</p>
      </section>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="stat-tile">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}
