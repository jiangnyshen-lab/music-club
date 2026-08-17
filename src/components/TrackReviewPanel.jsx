import { useEffect, useState } from 'react'
import { api } from '../api.js'
import { TRACK_DIMENSION_GROUPS, TRACK_DIMENSION_LABELS } from '../dimensions.js'
import { ScoreSlider } from './ui.jsx'

function emptyDraft() {
  return { score: 7.0, impression: '', dimensions: {} }
}

// 单曲点评面板：默认打分 + 一句话，可展开 7 个单曲维度
export default function TrackReviewPanel({ albumId, track, reviews, userId, onSaved }) {
  const [draft, setDraft] = useState(emptyDraft())
  const [showDeep, setShowDeep] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const mine = reviews.find((r) => r.user_id === userId)
  const others = reviews.filter((r) => r.user_id !== userId)

  // 已有我的点评时回填
  useEffect(() => {
    if (mine) {
      const dims = {}
      for (const dd of (mine.dimensions || [])) dims[dd.key] = dd
      setDraft({ score: mine.score ?? 7.0, impression: mine.impression || '', dimensions: dims })
    } else {
      setDraft(emptyDraft())
    }
  }, [mine?.id])

  function setDim(key, patch) {
    setDraft((prev) => ({
      ...prev,
      dimensions: { ...prev.dimensions, [key]: { ...(prev.dimensions[key] || {}), ...patch } }
    }))
  }

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const dimensions = Object.entries(draft.dimensions)
        .map(([key, d]) => ({ key, score: d.score, note: d.note }))
        .filter((d) => d.score != null || (d.note && d.note.trim()))
      await api('/albums/' + albumId + '/tracks/' + track.number + '/reviews', {
        method: 'POST',
        body: JSON.stringify({ score: draft.score, impression: draft.impression, trackTitle: track.title, dimensions })
      })
      onSaved()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="track-panel">
      <form onSubmit={save}>
        <div className="track-panel-row">
          <span className="muted small">打分</span>
          <ScoreSlider value={draft.score} onChange={(v) => setDraft({ ...draft, score: v })} />
        </div>
        <input value={draft.impression} onChange={(e) => setDraft({ ...draft, impression: e.target.value })} placeholder="一句话点评这首歌（选填）" />

        <button type="button" className="ghost-btn" onClick={() => setShowDeep(!showDeep)}>
          {showDeep ? '收起单曲深度评 ▴' : '展开单曲深度评（7 个维度）▾'}
        </button>
        {showDeep && (
          <div className="deep">
            {TRACK_DIMENSION_GROUPS.map((g) => (
              <div className="dim-group" key={g.group}>
                <div className="dim-group-title">{g.group}</div>
                {g.items.map((d) => {
                  const val = draft.dimensions[d.key] || {}
                  return (
                    <div className="dim-row" key={d.key}>
                      <div className="dim-head">
                        <span className="dim-label">{d.label}<span className="dim-en"> {d.en}</span></span>
                        <input
                          type="number" className="dim-score" min="0" max="10" step="0.5"
                          placeholder="分" value={val.score ?? ''}
                          onChange={(e) => setDim(d.key, { score: e.target.value === '' ? null : Number(e.target.value) })}
                        />
                      </div>
                      <div className="dim-tip">{d.tip}</div>
                      <div className="dim-q">🤔 {d.question}</div>
                      <input className="dim-note" placeholder="一句话点评（选填）" value={val.note || ''} onChange={(e) => setDim(d.key, { note: e.target.value })} />
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        )}

        {error && <div className="error">{error}</div>}
        <button className="primary-btn" disabled={saving}>{saving ? '保存中…' : mine ? '更新单曲点评' : '保存单曲点评'}</button>
      </form>

      {others.length > 0 && (
        <div className="track-others">
          <div className="muted small">大家给这首打的</div>
          {others.map((r) => (
            <div className="track-other-row" key={r.id}>
              <span className="review-author">{r.display_name}</span>
              {r.score != null && <span className="score-pill">{Number(r.score).toFixed(1)}</span>}
              {r.impression && <span className="muted small">{r.impression}</span>}
              {r.dimensions && r.dimensions.length > 0 && (
                <span className="muted small">
                  {r.dimensions.map((d) => (TRACK_DIMENSION_LABELS[d.key] || d.key) + (d.score != null ? ' ' + Number(d.score).toFixed(1) : '')).join(' · ')}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
