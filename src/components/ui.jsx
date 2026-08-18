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

// 头像：图片链接 / emoji / 昵称首字，三档降级
export function Avatar({ user, size = 32 }) {
  const [err, setErr] = useState(false)
  const name = ((user?.display_name || user?.username) || '?').trim()
  const avatar = user?.avatar || ''
  const style = { width: size, height: size, fontSize: Math.round(size * 0.42) }
  if (/^https?:\/\//i.test(avatar) && !err) {
    return <img className="avatar" src={avatar} alt={name} style={style} onError={() => setErr(true)} />
  }
  if (avatar) return <span className="avatar avatar-emoji" style={style}>{avatar}</span>
  return <span className="avatar avatar-initial" style={style}>{name[0] || '♪'}</span>
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

// 听友会状态：根据约定日期（YYYY-MM-DD）判断今天/即将/已结束
export function partyStatus(scheduledDate) {
  if (!scheduledDate) return null
  const d = new Date(scheduledDate + 'T00:00:00')
  if (isNaN(d)) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diffDays = Math.round((d - today) / 86400000)
  if (diffDays < 0) return { label: '已结束', cls: 'badge-ended' }
  if (diffDays === 0) return { label: '今天', cls: 'badge-today' }
  if (diffDays <= 3) return { label: diffDays + ' 天后', cls: 'badge-soon' }
  return { label: '还有 ' + diffDays + ' 天', cls: 'badge-later' }
}
