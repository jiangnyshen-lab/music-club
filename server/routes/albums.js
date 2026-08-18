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

// 圈子排行榜：所有被点评过的专辑，按平均分排序
router.get('/top', requireAuth, (req, res) => {
  const albums = db.prepare(`
    SELECT a.id, a.title, a.artist, a.year, a.cover_url,
      ROUND(AVG(r.score), 1) AS avg_score,
      COUNT(r.id) AS review_count,
      MIN(r.score) AS min_score,
      MAX(r.score) AS max_score
    FROM albums a JOIN reviews r ON r.album_id = a.id
    WHERE r.score IS NOT NULL
    GROUP BY a.id
    ORDER BY avg_score DESC, review_count DESC, a.title ASC
    LIMIT 50
  `).all()
  res.json({ albums })
})

// 专辑详情（含曲目 + 所有成员的点评）
router.get('/albums/:id', requireAuth, (req, res) => {
  const album = db.prepare('SELECT * FROM albums WHERE id = ?').get(req.params.id)
  if (!album) return res.status(404).json({ error: '专辑不存在' })

  let tracks = []
  try { tracks = JSON.parse(album.tracks_json || '[]') } catch { /* ignore */ }

  const reviews = db.prepare(`
    SELECT r.*, u.display_name, u.username, u.avatar,
      (SELECT COUNT(*) FROM review_likes rl WHERE rl.review_id = r.id) AS like_count,
      (SELECT COUNT(*) FROM review_comments rc WHERE rc.review_id = r.id) AS comment_count,
      EXISTS(SELECT 1 FROM review_likes rl WHERE rl.review_id = r.id AND rl.user_id = ?) AS liked_by_me
    FROM reviews r JOIN users u ON u.id = r.user_id
    WHERE r.album_id = ? ORDER BY r.updated_at DESC
  `).all(req.user.id, album.id)

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
  const reviewsWithDims = reviews.map((rv) => ({ ...rv, liked_by_me: !!rv.liked_by_me, dimensions: dimsByReview[rv.id] || [] }))

  // 单曲点评（带维度分 + 点评人昵称）
  const trackReviews = db.prepare(`
    SELECT tr.*, u.display_name, u.avatar
    FROM track_reviews tr JOIN users u ON u.id = tr.user_id
    WHERE tr.album_id = ? ORDER BY tr.updated_at DESC
  `).all(album.id)

  const dimsByTrackReview = {}
  if (trackReviews.length) {
    const tids = trackReviews.map((r) => r.id)
    const tPh = tids.map(() => '?').join(',')
    const tDims = db.prepare(
      `SELECT * FROM track_dimension_scores WHERE track_review_id IN (${tPh})`
    ).all(...tids)
    for (const d of tDims) {
      ;(dimsByTrackReview[d.track_review_id] = dimsByTrackReview[d.track_review_id] || []).push({
        key: d.dimension, score: d.score, note: d.note
      })
    }
  }
  const trackReviewsWithDims = trackReviews.map((tr) => ({ ...tr, dimensions: dimsByTrackReview[tr.id] || [] }))

  res.json({ album: { ...album, tracks_json: undefined, tracks }, reviews: reviewsWithDims, track_reviews: trackReviewsWithDims })
})

export default router
