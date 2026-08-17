import express from 'express'
import { db, now } from '../db.js'
import { requireAuth, requireAdmin } from '../auth.js'

const router = express.Router()

function getLatestFeatured() {
  return db.prepare(`
    SELECT f.*, a.id AS album_id, a.title, a.artist, a.year, a.cover_url,
           u.display_name AS creator_name
    FROM featured_albums f
    JOIN albums a ON a.id = f.album_id
    JOIN users u ON u.id = f.created_by
    ORDER BY f.created_at DESC LIMIT 1
  `).get() || null
}

// 当前「共听」（最新一条），带已交作业的成员 + 平均分
router.get('/featured', requireAuth, (req, res) => {
  const f = getLatestFeatured()
  if (!f) return res.json({ featured: null })

  const reviews = db.prepare(`
    SELECT u.display_name, r.score, r.listen_type
    FROM reviews r JOIN users u ON u.id = r.user_id
    WHERE r.album_id = ? AND r.score IS NOT NULL
    ORDER BY r.updated_at DESC
  `).all(f.album_id)

  const avg = reviews.length
    ? Math.round(reviews.reduce((s, r) => s + r.score, 0) / reviews.length * 10) / 10
    : null
  const ended = f.ends_at ? new Date(f.ends_at) < new Date() : false

  res.json({
    featured: {
      id: f.id, note: f.note, ends_at: f.ends_at, created_at: f.created_at,
      creator_name: f.creator_name, ended,
      album: { id: f.album_id, title: f.title, artist: f.artist, year: f.year, cover_url: f.cover_url },
      reviews, avg_score: avg, review_count: reviews.length
    }
  })
})

// 发起人把一张专辑设为「共听」
router.post('/featured', requireAuth, requireAdmin, (req, res) => {
  const { albumId, note, endsAt } = req.body || {}
  const album = db.prepare('SELECT id FROM albums WHERE id = ?').get(albumId)
  if (!album) return res.status(400).json({ error: '专辑不存在' })
  const info = db.prepare(
    'INSERT INTO featured_albums (album_id, note, ends_at, created_by, created_at) VALUES (?,?,?,?,?)'
  ).run(album.id, note || null, endsAt || null, req.user.id, now())
  res.json({ featured: db.prepare('SELECT * FROM featured_albums WHERE id = ?').get(Number(info.lastInsertRowid)) })
})

export default router
