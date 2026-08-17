import { useState } from 'react'

// 封面图，加载失败就显示占位块
export function Cover({ url, title, size = 64, radius = 10 }) {
  const [err, setErr] = useState(false)
  const style = { width: size, height: size, borderRadius: radius }
  if (!url || err) {
    return <div className="cover cover-fallback" style={style}>{title ? title.trim()[0] : '♪'}</div>
  }
  return <img className="cover" src={url} style={style} alt={title || ''} loading="lazy" onError={() => setErr(true)} />
}

export function ScoreSlider({ value, onChange }) {
  return (
    <div className="score-slider">
      <input type="range" min="0" max="10" step="0.5" value={value} onChange={(e) => onChange(Number(e.target.value))} />
      <span className="score-big">{Number(value).toFixed(1)}</span>
    </div>
  )
}

export function ListenBadge({ type }) {
  return (
    <span className={'badge ' + (type === 'full' ? 'badge-full' : 'badge-casual')}>
      {type === 'full' ? '完整听' : '随意听'}
    </span>
  )
}

export function ScorePill({ score }) {
  if (score == null) return null
  return <span className="score-pill">{Number(score).toFixed(1)}</span>
}

export function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d)) return ''
  return d.toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
