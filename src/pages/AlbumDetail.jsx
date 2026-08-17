import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../api.js'
import { useAuth } from '../auth.jsx'
import { DIMENSION_GROUPS, DIMENSION_LABELS } from '../dimensions.js'
import { Cover, ScoreSlider, ListenBadge, ScorePill, formatDate } from '../components/ui.jsx'

function emptyDraft() {
  return {
    listenType: 'full', score: 7.0, impression: '', favTrack: '', leastTrack: '',
    association: '', relisten: '', longReview: '', dimensions: {}
  }
}

export default function AlbumDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [draft, setDraft] = useState(emptyDraft())
  const [showDeep, setShowDeep] = useState(false)
  const [showLong, setShowLong] = useState(false)
  const [saving, setSaving] = useState(false)
  const [partyOpen, setPartyOpen] = useState(false)
  const [partyTitle, setPartyTitle] = useState('')
  const [partyDate, setPartyDate] = useState('')

  function load() {
    api('/albums/' + id)
      .then((d) => {
        setData(d)
        const mine = d.reviews.find((r) => r.user_id === user.id)
        if (mine) {
          const dims = {}
          for (const dd of (mine.dimensions || [])) dims[dd.key] = dd
          setDraft({
            listenType: mine.listen_type, score: mine.score ?? 7.0,
            impression: mine.impression || '', favTrack: mine.fav_track || '',
            leastTrack: mine.least_track || '', association: mine.association || '',
            relisten: mine.relisten || '', longReview: mine.long_review || '', dimensions: dims
          })
        }
      })
      .catch((e) => setError(e.message))
  }

  useEffect(load, [id])

  async function saveReview(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const dimensions = Object.entries(draft.dimensions)
        .map(([key, d]) => ({ key, score: d.score, note: d.note }))
        .filter((d) => d.score != null || (d.note && d.note.trim()))
      await api('/albums/' + id + '/reviews', {
        method: 'POST',
        body: JSON.stringify({
          listenType: draft.listenType, score: draft.score, impression: draft.impression,
          favTrack: draft.favTrack, leastTrack: draft.leastTrack, association: draft.association,
          relisten: draft.relisten, longReview: draft.longReview, dimensions
        })
      })
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function createParty(e) {
    e.preventDefault()
    setError('')
    try {
      const d = await api('/parties', {
        method: 'POST',
        body: JSON.stringify({ albumId: Number(id), title: partyTitle, scheduledDate: partyDate || null })
      })
      navigate('/parties/' + d.party.id)
    } catch (err) {
      setError(err.message)
    }
  }

  function setDim(key, patch) {
    setDraft((prev) => ({
      ...prev,
      dimensions: { ...prev.dimensions, [key]: { ...(prev.dimensions[key] || {}), ...patch } }
    }))
  }

  if (!data) return <div className="center muted">{error || '加载中…'}</div>

  const { album, reviews } = data
  const myReview = reviews.find((r) => r.user_id === user.id)
  const others = reviews.filter((r) => r.user_id !== user.id)

  return (
    <div className="album-page">
      <div className="album-hero">
        <Cover url={album.cover_url} title={album.title} size={120} radius={14} />
        <div className="album-info">
          <h1 className="album-title">{album.title}</h1>
          <div className="album-artist">{album.artist}{album.year ? ' · ' + album.year : ''}</div>
          {album.track_count ? <div className="muted">{album.track_count} 首</div> : null}
        </div>
      </div>

      {album.tracks && album.tracks.length > 0 && (
        <details className="tracks">
          <summary>曲目（{album.tracks.length}）</summary>
          <ol>
            {album.tracks.map((t) => (
              <li key={t.number + '-' + t.title}>
                <span className="track-no">{t.number}</span>
                <span>{t.title}</span>
                {t.durationMs ? <span className="muted track-dur">{formatDur(t.durationMs)}</span> : null}
              </li>
            ))}
          </ol>
        </details>
      )}

      <section className="card review-form">
        <h2>我的点评</h2>
        <form onSubmit={saveReview}>
          <div className="field-row">
            <div className="seg">
              <button type="button" className={'seg-btn ' + (draft.listenType === 'full' ? 'active' : '')} onClick={() => setDraft({ ...draft, listenType: 'full' })}>🎧 完整听</button>
              <button type="button" className={'seg-btn ' + (draft.listenType === 'casual' ? 'active' : '')} onClick={() => setDraft({ ...draft, listenType: 'casual' })}>🍃 随意听</button>
            </div>
          </div>

          <label>打分（10 分制，拖动）</label>
          <ScoreSlider value={draft.score} onChange={(v) => setDraft({ ...draft, score: v })} />

          <label>一句话第一印象</label>
          <input value={draft.impression} onChange={(e) => setDraft({ ...draft, impression: e.target.value })} placeholder="不思考，凭直觉甩一句" />

          <div className="grid2">
            <div>
              <label>最想立刻再听的一首</label>
              <input value={draft.favTrack} onChange={(e) => setDraft({ ...draft, favTrack: e.target.value })} placeholder="选填" />
            </div>
            <div>
              <label>最无感 / 没听懂的一首</label>
              <input value={draft.leastTrack} onChange={(e) => setDraft({ ...draft, leastTrack: e.target.value })} placeholder="选填" />
            </div>
          </div>

          <label>它让我想起哪张专辑 / 哪种情绪</label>
          <input value={draft.association} onChange={(e) => setDraft({ ...draft, association: e.target.value })} placeholder="选填，建立联想" />

          <div className="field-row">
            <label>想再完整听一遍吗？</label>
            <div className="seg">
              <button type="button" className={'seg-btn ' + (draft.relisten === 'yes' ? 'active' : '')} onClick={() => setDraft({ ...draft, relisten: 'yes' })}>想</button>
              <button type="button" className={'seg-btn ' + (draft.relisten === 'no' ? 'active' : '')} onClick={() => setDraft({ ...draft, relisten: 'no' })}>不想</button>
            </div>
          </div>

          <button type="button" className="ghost-btn" onClick={() => setShowDeep(!showDeep)}>{showDeep ? '收起深度评 ▴' : '展开深度评（分维度打分）▾'}</button>
          {showDeep && (
            <div className="deep">
              {DIMENSION_GROUPS.map((g) => (
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

          <button type="button" className="ghost-btn" onClick={() => setShowLong(!showLong)}>{showLong ? '收起自由长评 ▴' : '写自由长评 ▾'}</button>
          {showLong && <textarea value={draft.longReview} onChange={(e) => setDraft({ ...draft, longReview: e.target.value })} placeholder="想写多少写多少" rows={6} />}

          {error && <div className="error">{error}</div>}
          <button className="primary-btn" disabled={saving}>{saving ? '保存中…' : '保存点评'}</button>
        </form>
      </section>

      <section>
        <h2>大家的点评（{reviews.length}）</h2>
        {myReview && <ReviewCard r={myReview} me />}
        {others.map((r) => <ReviewCard r={r} key={r.id} />)}
      </section>

      <section className="card party-box">
        <h2>🎧 听友会</h2>
        {!partyOpen ? (
          <button className="primary-btn" onClick={() => setPartyOpen(true)}>用这张专辑发起听友会</button>
        ) : (
          <form onSubmit={createParty} className="party-form">
            <label>主题（选填）</label>
            <input value={partyTitle} onChange={(e) => setPartyTitle(e.target.value)} placeholder="例如：周末一起听完这张" />
            <label>约在哪天（选填）</label>
            <input type="date" value={partyDate} onChange={(e) => setPartyDate(e.target.value)} />
            <button className="primary-btn">发起</button>
          </form>
        )}
      </section>
    </div>
  )
}

function formatDur(ms) {
  const s = Math.round(ms / 1000)
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0')
}

function ReviewCard({ r, me }) {
  return (
    <div className={'card review ' + (me ? 'review-mine' : '')}>
      <div className="review-head">
        <span className="review-author">{r.display_name}{me ? '（我）' : ''}</span>
        <ListenBadge type={r.listen_type} />
        <ScorePill score={r.score} />
        <span className="muted review-date">{formatDate(r.updated_at)}</span>
      </div>
      {r.impression && <p className="impression">{r.impression}</p>}
      {r.fav_track && <div className="mini"><span className="mini-label">最想再听</span>{r.fav_track}</div>}
      {r.least_track && <div className="mini"><span className="mini-label">最无感</span>{r.least_track}</div>}
      {r.association && <div className="mini"><span className="mini-label">联想</span>{r.association}</div>}
      {r.dimensions && r.dimensions.length > 0 && (
        <div className="dims">
          {r.dimensions.map((d) => (
            <span className="dim-chip" key={d.key} title={d.note || ''}>
              {DIMENSION_LABELS[d.key] || d.key}{d.score != null ? ' ' + Number(d.score).toFixed(1) : ''}
            </span>
          ))}
        </div>
      )}
      {r.long_review && <p className="long-review">{r.long_review}</p>}
    </div>
  )
}
