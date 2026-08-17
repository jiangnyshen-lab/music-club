import { useState } from 'react'
import { api } from '../api.js'
import { formatDate } from './ui.jsx'

// 点评卡片的互动区：点赞 + 留言
export default function ReviewActions({ reviewId, likeCount = 0, likedByMe = false, commentCount = 0 }) {
  const [liked, setLiked] = useState(!!likedByMe)
  const [likes, setLikes] = useState(Number(likeCount) || 0)
  const [open, setOpen] = useState(false)
  const [comments, setComments] = useState(null) // null = 还没加载
  const [count, setCount] = useState(Number(commentCount) || 0)
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function toggleLike() {
    setError('')
    try {
      const d = await api('/reviews/' + reviewId + '/like', { method: 'POST' })
      setLiked(d.liked)
      setLikes(d.likeCount)
    } catch (e) {
      setError(e.message)
    }
  }

  async function toggleComments() {
    const next = !open
    setOpen(next)
    if (next && comments === null) {
      try {
        const d = await api('/reviews/' + reviewId + '/comments')
        setComments(d.comments)
        setCount(d.comments.length)
      } catch (e) {
        setError(e.message)
      }
    }
  }

  async function submit(e) {
    e.preventDefault()
    if (!text.trim() || busy) return
    setBusy(true)
    setError('')
    try {
      const d = await api('/reviews/' + reviewId + '/comments', {
        method: 'POST',
        body: JSON.stringify({ content: text.trim() })
      })
      setComments((prev) => [...(prev || []), d.comment])
      setCount((c) => c + 1)
      setText('')
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div className="review-actions">
        <button className={'action-btn ' + (liked ? 'liked' : '')} onClick={toggleLike}>👍 {likes > 0 ? likes : ''}</button>
        <button className={'action-btn ' + (open ? 'liked' : '')} onClick={toggleComments}>💬 留言{count > 0 ? ' ' + count : ''}</button>
      </div>
      {error && <div className="error">{error}</div>}
      {open && (
        <div className="comment-box">
          {comments && comments.length === 0 && <div className="muted small">还没有留言，来第一条 👇</div>}
          {(comments || []).map((c) => (
            <div className="comment" key={c.id}>
              <div className="comment-head">
                <span className="comment-author">{c.display_name}</span>
                <span className="muted small">{formatDate(c.created_at)}</span>
              </div>
              <p className="comment-content">{c.content}</p>
            </div>
          ))}
          <form className="comment-form" onSubmit={submit}>
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="说点什么…" />
            <button className="primary-btn" disabled={busy}>发</button>
          </form>
        </div>
      )}
    </div>
  )
}
