import express from 'express'
import { db, now } from '../db.js'
import { requireAuth } from '../auth.js'

const router = express.Router()

// 创建 / 更新自己的点评（一个用户一张专辑只留一条，重复写会覆盖）
router.post('/albums/:id/reviews', requireAuth, (req, res) => {
  const album = db.prepare('SELECT id FROM albums WHERE id = ?').get(req.params.id)
  if (!album) return res.status(404).json({ error: '专辑不存在' })

  const b = req.body || {}
  const listenType = ['full', 'casual'].includes(b.listenType) ? b.listenType : 'full'
  const score = b.score == null ? null : Math.max(0, Math.min(10, Number(b.score)))

  const existing = db.prepare('SELECT * FROM reviews WHERE user_id = ? AND album_id = ?').get(req.user.id, album.id)
  let reviewId
  if (existing) {
    db.prepare(`
      UPDATE reviews SET listen_type=?, score=?, impression=?, fav_track=?, least_track=?,
        association=?, relisten=?, long_review=?, updated_at=? WHERE id=?
    `).run(
      listenType, score, b.impression || null, b.favTrack || null, b.leastTrack || null,
      b.association || null, b.relisten || null, b.longReview || null, now(), existing.id
    )
    reviewId = existing.id
    db.prepare('DELETE FROM dimension_scores WHERE review_id = ?').run(reviewId)
  } else {
    const info = db.prepare(`
      INSERT INTO reviews (user_id, album_id, listen_type, score, impression, fav_track, least_track, association, relisten, long_review, created_at, updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
    `).run(
      req.user.id, album.id, listenType, score, b.impression || null, b.favTrack || null,
      b.leastTrack || null, b.association || null, b.relisten || null, b.longReview || null, now(), now()
    )
    reviewId = Number(info.lastInsertRowid)
  }

  const dims = Array.isArray(b.dimensions) ? b.dimensions : []
  const insertDim = db.prepare('INSERT INTO dimension_scores (review_id, dimension, score, note) VALUES (?,?,?,?)')
  for (const d of dims) {
    if (!d.key) continue
    insertDim.run(reviewId, d.key, d.score == null ? null : Number(d.score), d.note || null)
  }

  const review = db.prepare('SELECT * FROM reviews WHERE id = ?').get(reviewId)
  res.json({ review })
})

// 我的全部点评
router.get('/reviews/mine', requireAuth, (req, res) => {
  const rows = db.prepare(`
    SELECT r.*, a.title, a.artist, a.cover_url, a.year, a.id AS album_id
    FROM reviews r JOIN albums a ON a.id = r.album_id
    WHERE r.user_id = ? ORDER BY r.updated_at DESC
  `).all(req.user.id)
  res.json({ reviews: rows })
})

export default router
