import express from 'express'
import { db, now } from '../db.js'
import { requireAuth } from '../auth.js'

const router = express.Router()

// 创建 / 更新某首单曲的点评（一人一专辑一单曲只留一条，重复写覆盖）
router.post('/albums/:id/tracks/:num/reviews', requireAuth, (req, res) => {
  const album = db.prepare('SELECT id FROM albums WHERE id = ?').get(req.params.id)
  if (!album) return res.status(404).json({ error: '专辑不存在' })

  const trackNumber = Number(req.params.num)
  if (!Number.isInteger(trackNumber) || trackNumber < 1) return res.status(400).json({ error: '曲目序号不对' })

  const b = req.body || {}
  const score = b.score == null ? null : Math.max(0, Math.min(10, Number(b.score)))

  const existing = db.prepare(
    'SELECT * FROM track_reviews WHERE user_id = ? AND album_id = ? AND track_number = ?'
  ).get(req.user.id, album.id, trackNumber)

  let reviewId
  if (existing) {
    db.prepare('UPDATE track_reviews SET track_title=?, score=?, impression=?, updated_at=? WHERE id=?')
      .run(b.trackTitle || existing.track_title, score, b.impression || null, now(), existing.id)
    reviewId = existing.id
    db.prepare('DELETE FROM track_dimension_scores WHERE track_review_id = ?').run(reviewId)
  } else {
    const info = db.prepare(
      'INSERT INTO track_reviews (user_id, album_id, track_number, track_title, score, impression, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?)'
    ).run(req.user.id, album.id, trackNumber, b.trackTitle || null, score, b.impression || null, now(), now())
    reviewId = Number(info.lastInsertRowid)
  }

  const dims = Array.isArray(b.dimensions) ? b.dimensions : []
  const insertDim = db.prepare('INSERT INTO track_dimension_scores (track_review_id, dimension, score, note) VALUES (?,?,?,?)')
  for (const d of dims) {
    if (!d.key) continue
    insertDim.run(reviewId, d.key, d.score == null ? null : Number(d.score), d.note || null)
  }

  res.json({ review: db.prepare('SELECT * FROM track_reviews WHERE id = ?').get(reviewId) })
})

export default router
