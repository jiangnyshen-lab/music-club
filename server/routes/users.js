import express from 'express'
import { db } from '../db.js'
import { requireAuth } from '../auth.js'
import { publicUser } from './auth.js'

const router = express.Router()

// 更新自己的资料（昵称 / 头像 / 签名 / 音乐偏好）
router.put('/users/me', requireAuth, (req, res) => {
  const { displayName, avatar, bio, favoriteArtists, favoriteAlbums, favoriteGenres } = req.body || {}
  const name = (displayName || '').trim()
  if (!name) return res.status(400).json({ error: '昵称不能为空' })
  if (name.length > 30) return res.status(400).json({ error: '昵称最多 30 个字' })

  const safeAvatar = (avatar || '').slice(0, 500)
  const safeBio = (bio || '').slice(0, 120)
  const safeArtists = (favoriteArtists || '').slice(0, 300)
  const safeAlbums = (favoriteAlbums || '').slice(0, 300)
  const safeGenres = (favoriteGenres || '').slice(0, 300)

  db.prepare(
    'UPDATE users SET display_name=?, avatar=?, bio=?, favorite_artists=?, favorite_albums=?, favorite_genres=? WHERE id=?'
  ).run(name, safeAvatar, safeBio, safeArtists, safeAlbums, safeGenres, req.user.id)

  const u = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id)
  res.json({ user: publicUser(u) })
})

// 看某人的个人主页（资料 + 数据 + 高分 + 最近点评）
router.get('/users/:id', requireAuth, (req, res) => {
  const u = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id)
  if (!u) return res.status(404).json({ error: '用户不存在' })

  const reviewCount = db.prepare('SELECT COUNT(*) AS c FROM reviews WHERE user_id = ?').get(u.id).c
  const avgScore = db.prepare('SELECT AVG(score) AS a FROM reviews WHERE user_id = ? AND score IS NOT NULL').get(u.id).a

  const top = db.prepare(`
    SELECT a.id, a.title, a.artist, a.year, a.cover_url, a.genre, r.score
    FROM reviews r JOIN albums a ON a.id = r.album_id
    WHERE r.user_id = ? AND r.score IS NOT NULL
    ORDER BY r.score DESC, r.updated_at DESC LIMIT 5
  `).all(u.id)

  const recent = db.prepare(`
    SELECT r.id, r.score, r.impression, r.updated_at, a.id AS album_id, a.title, a.artist, a.cover_url, a.genre
    FROM reviews r JOIN albums a ON a.id = r.album_id
    WHERE r.user_id = ? ORDER BY r.updated_at DESC LIMIT 5
  `).all(u.id)

  res.json({
    user: publicUser(u),
    stats: {
      review_count: reviewCount,
      avg_score: avgScore == null ? null : Math.round(avgScore * 10) / 10,
      top,
      recent
    }
  })
})

export default router
