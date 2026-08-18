import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api.js'
import { useAuth } from '../auth.jsx'
import { Avatar, Cover, ScorePill } from '../components/ui.jsx'

const EMOJIS = ['🎧', '🎵', '🎶', '🎤', '🎹', '🎸', '🥁', '🎷', '🎺', '🎻', '🎙️', '💿', '📀', '🔥', '🌟', '🌙', '🍊', '🐱', '🐶']

export default function Profile() {
  const { id } = useParams()
  const { user: me, refreshUser } = useAuth()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ displayName: '', avatar: '', bio: '', favoriteArtists: '', favoriteAlbums: '', favoriteGenres: '' })

  const isMe = me && String(me.id) === String(id)

  function load() {
    api('/users/' + id).then((d) => {
      setData(d)
      if (isMe) {
        setForm({
          displayName: d.user.display_name, avatar: d.user.avatar || '', bio: d.user.bio || '',
          favoriteArtists: d.user.favorite_artists || '', favoriteAlbums: d.user.favorite_albums || '',
          favoriteGenres: d.user.favorite_genres || ''
        })
      }
    }).catch((e) => setError(e.message))
  }

  useEffect(load, [id, me?.id])

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await api('/users/me', {
        method: 'PUT',
        body: JSON.stringify({
          displayName: form.displayName, avatar: form.avatar, bio: form.bio,
          favoriteArtists: form.favoriteArtists, favoriteAlbums: form.favoriteAlbums,
          favoriteGenres: form.favoriteGenres
        })
      })
      await refreshUser()
      setEditing(false)
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (error && !data) return <div className="center muted">{error}</div>
  if (!data) return <div className="center muted">加载中…</div>

  const u = data.user
  const { stats } = data

  return (
    <div className="profile-page">
      <div className="card profile-head">
        <Avatar user={u} size={72} />
        <div className="profile-info">
          <div className="profile-name">
            {u.display_name}
            {u.is_admin ? <span className="badge badge-admin">发起人</span> : null}
          </div>
          <div className="muted small">@{u.username} · {formatJoin(u.created_at)}</div>
          {u.bio && <div className="profile-bio">{u.bio}</div>}
        </div>
        {isMe && !editing && <button className="ghost-btn" onClick={() => setEditing(true)}>编辑资料</button>}
      </div>

      {isMe && editing && (
        <div className="card">
          <h3>编辑资料</h3>
          <form onSubmit={save}>
            <label>头像（选一个表情，或粘贴图片链接）</label>
            <div className="emoji-picker">
              {EMOJIS.map((e) => (
                <button type="button" key={e} className={'emoji-opt ' + (form.avatar === e ? 'active' : '')} onClick={() => setForm({ ...form, avatar: e })}>{e}</button>
              ))}
              <button type="button" className="emoji-opt" title="用昵称首字" onClick={() => setForm({ ...form, avatar: '' })}>✕</button>
            </div>
            <input value={/^https?:\/\//i.test(form.avatar) ? form.avatar : ''} onChange={(e) => setForm({ ...form, avatar: e.target.value.trim() })} placeholder="或粘贴图片链接（会覆盖表情头像）" />

            <label>昵称</label>
            <input value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} maxLength={30} />

            <label>个性签名</label>
            <input value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} maxLength={120} placeholder="一句话介绍你的音乐口味" />

            <label>喜欢的歌手（逗号分隔）</label>
            <input value={form.favoriteArtists} onChange={(e) => setForm({ ...form, favoriteArtists: e.target.value })} placeholder="例如：周杰伦, Radiohead, 林俊杰" />

            <label>喜欢的专辑（逗号分隔）</label>
            <input value={form.favoriteAlbums} onChange={(e) => setForm({ ...form, favoriteAlbums: e.target.value })} placeholder="例如：范特西, OK Computer" />

            <label>偏好的风格（逗号分隔）</label>
            <input value={form.favoriteGenres} onChange={(e) => setForm({ ...form, favoriteGenres: e.target.value })} placeholder="例如：J-Pop, 后摇, 爵士" />

            {error && <div className="error">{error}</div>}
            <div className="profile-actions">
              <button className="primary-btn" disabled={saving}>{saving ? '保存中…' : '保存'}</button>
              <button type="button" className="ghost-btn" onClick={() => { setEditing(false); load() }}>取消</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h3>音乐偏好</h3>
        <Pref label="🎤 喜欢的歌手" text={u.favorite_artists} />
        <Pref label="💿 喜欢的专辑" text={u.favorite_albums} />
        <Pref label="🎵 偏好的风格" text={u.favorite_genres} />
        {!u.favorite_artists && !u.favorite_albums && !u.favorite_genres && (
          <div className="muted small">{isMe ? '还没填写，点右上角「编辑资料」补充吧' : 'TA 还没填写音乐偏好'}</div>
        )}
      </div>

      <div className="stat-grid">
        <div className="stat-tile"><div className="stat-value">{stats.review_count}</div><div className="stat-label">点评专辑</div></div>
        <div className="stat-tile"><div className="stat-value">{stats.avg_score == null ? '—' : stats.avg_score.toFixed(1)}</div><div className="stat-label">平均分</div></div>
      </div>

      {stats.top.length > 0 && (
        <div className="card">
          <div className="muted small">TA 的高分 Top 5</div>
          {stats.top.map((a) => (
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

      {stats.recent.length > 0 && (
        <div className="card">
          <div className="muted small">最近点评</div>
          {stats.recent.map((r) => (
            <Link to={'/albums/' + r.album_id} key={r.id} className="mine-row top-item">
              <Cover url={r.cover_url} title={r.title} size={40} />
              <div className="mine-meta">
                <div className="feed-title">{r.title}</div>
                <div className="muted">{r.impression || r.artist}</div>
              </div>
              {r.score != null && <ScorePill score={r.score} />}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function Pref({ label, text }) {
  if (!text) return null
  const items = text.split(/[,，、]/).map((s) => s.trim()).filter(Boolean)
  return (
    <div className="pref-row">
      <div className="pref-label">{label}</div>
      <div className="chips">{items.map((it, i) => <span className="chip" key={i}>{it}</span>)}</div>
    </div>
  )
}

function formatJoin(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d)) return ''
  return '加入于 ' + d.getFullYear() + ' 年 ' + (d.getMonth() + 1) + ' 月'
}
