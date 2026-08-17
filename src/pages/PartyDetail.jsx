import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api.js'
import { useAuth } from '../auth.jsx'
import { Cover, formatDate, partyStatus } from '../components/ui.jsx'

export default function PartyDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [content, setContent] = useState('')

  function load() {
    api('/parties/' + id).then(setData).catch((e) => setError(e.message))
  }
  useEffect(load, [id])

  async function join() {
    setError('')
    try {
      await api('/parties/' + id + '/join', { method: 'POST' })
      load()
    } catch (e) {
      setError(e.message)
    }
  }

  async function post(e) {
    e.preventDefault()
    if (!content.trim()) return
    setError('')
    try {
      await api('/parties/' + id + '/posts', { method: 'POST', body: JSON.stringify({ content: content.trim() }) })
      setContent('')
      load()
    } catch (e) {
      setError(e.message)
    }
  }

  if (!data) return <div className="center muted">{error || '加载中…'}</div>

  const { party, members, posts } = data
  const joined = members.some((m) => m.id === user.id)
  const st = partyStatus(party.scheduled_date)

  return (
    <div>
      <div className="album-hero">
        <Cover url={party.cover_url} title={party.album_title} size={96} />
        <div className="album-info">
          <h1 className="album-title">{party.title || '一起听：' + party.album_title}</h1>
          <div className="album-artist">
            <Link to={'/albums/' + party.album_id} className="album-link">{party.album_title}</Link>
            {' — ' + party.album_artist}
          </div>
          <div className="muted small">
            {party.creator_name} 发起 · {formatDate(party.created_at)}{party.scheduled_date ? ' · 约 ' + party.scheduled_date : ''}
            {st && <span className={'badge ' + st.cls}>{st.label}</span>}
          </div>
        </div>
        {!joined && <button className="primary-btn" onClick={join}>加入</button>}
      </div>

      <div className="card">
        <h3>成员（{members.length}）</h3>
        <div className="chips">
          {members.map((m) => <span className="chip" key={m.id}>{m.display_name}</span>)}
        </div>
      </div>

      <div className="card">
        <h3>讨论区</h3>
        <form className="post-form" onSubmit={post}>
          <input value={content} onChange={(e) => setContent(e.target.value)} placeholder="说点什么…" />
          <button className="primary-btn">发</button>
        </form>
        {error && <div className="error">{error}</div>}
        {posts.length === 0 && <div className="muted">还没有讨论，来聊第一句 👇</div>}
        {posts.map((p) => (
          <div className="post" key={p.id}>
            <div className="post-head">
              <span className="post-author">{p.display_name}</span>
              <span className="muted small">{formatDate(p.created_at)}</span>
            </div>
            <p className="post-content">{p.content}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
