import express from 'express'
import { db, now } from '../db.js'
import { requireAuth } from '../auth.js'
import { searchAlbums, getTracks } from '../metadata.js'

const router = express.Router()

// 搜专辑（自动补全）
router.get('/search', requireAuth, async (req, res) => {
  const q = (req.query.q || '').trim()
  if (!q) return res.json({ results: [] })
  try {
    const results = await searchAlbums(q)
    res.json({ results })
  } catch (e) {
    res.status(502).json({ error: '查不到专辑资料，稍后再试：' + e.message })
  }
})

// 保存专辑（并尽力拉取曲目列表）
router.post('/albums', requireAuth, async (req, res) => {
  const { collectionId, title, artist, year, coverUrl, trackCount } = req.body || {}
  if (!collectionId || !title || !artist) return res.status(400).json({ error: '缺少专辑信息' })

  let existing = db.prepare('SELECT * FROM albums WHERE collection_id = ?').get(String(collectionId))
  let tracksJson = existing ? existing.tracks_json : null
  if (!tracksJson) {
    try { tracksJson = JSON.stringify(await getTracks(collectionId)) } catch { /* 拉不到曲目也不影响保存 */ }
  }

  if (existing) {
    db.prepare(
      'UPDATE albums SET title=?, artist=?, year=?, cover_url=?, track_count=?, tracks_json=? WHERE id=?'
    ).run(title, artist, year || null, coverUrl || null, trackCount || null, tracksJson, existing.id)
  } else {
    const info = db.prepare(
      'INSERT INTO albums (collection_id, title, artist, year, cover_url, track_count, tracks_json, created_at) VALUES (?,?,?,?,?,?,?,?)'
    ).run(String(collectionId), title, artist, year || null, coverUrl || null, trackCount || null, tracksJson, now())
    existing = db.prepare('SELECT * FROM albums WHERE id = ?').get(Number(info.lastInsertRowid))
  }
  res.json({ album: existing })
})

// 专辑详情（含曲目 + 所有成员的点评）
router.get('/albums/:id', requireAuth, (req, res) => {
  const album = db.prepare('SELECT * FROM albums WHERE id = ?').get(req.params.id)
  if (!album) return res.status(404).json({ error: '专辑不存在' })

  let tracks = []
  try { tracks = JSON.parse(album.tracks_json || '[]') } catch { /* ignore */ }

  const reviews = db.prepare(`
    SELECT r.*, u.display_name, u.username
    FROM reviews r JOIN users u ON u.id = r.user_id
    WHERE r.album_id = ? ORDER BY r.updated_at DESC
  `).all(album.id)

  const dimsByReview = {}
  if (reviews.length) {
    const ids = reviews.map((r) => r.id)
    const placeholders = ids.map(() => '?').join(',')
    const dims = db.prepare(
      `SELECT * FROM dimension_scores WHERE review_id IN (${placeholders})`
    ).all(...ids)
    for (const d of dims) {
      ;(dimsByReview[d.review_id] = dimsByReview[d.review_id] || []).push({
        key: d.dimension, score: d.score, note: d.note
      })
    }
  }
  const reviewsWithDims = reviews.map((rv) => ({ ...rv, dimensions: dimsByReview[rv.id] || [] }))

  res.json({ album: { ...album, tracks_json: undefined, tracks }, reviews: reviewsWithDims })
})

export default router
