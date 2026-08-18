import express from 'express'
import { db } from '../db.js'
import { requireAuth } from '../auth.js'

const router = express.Router()

// 好友时间线：圈子里所有人最近的点评
router.get('/feed', requireAuth, (req, res) => {
  const items = db.prepare(`
    SELECT r.id AS review_id, r.listen_type, r.score, r.impression, r.fav_track, r.least_track, r.updated_at,
           a.id AS album_id, a.title, a.artist, a.cover_url, a.year, a.genre,
           u.id AS user_id, u.display_name, u.avatar,
           (SELECT COUNT(*) FROM review_likes rl WHERE rl.review_id = r.id) AS like_count,
           (SELECT COUNT(*) FROM review_comments rc WHERE rc.review_id = r.id) AS comment_count,
           EXISTS(SELECT 1 FROM review_likes rl WHERE rl.review_id = r.id AND rl.user_id = ?) AS liked_by_me
    FROM reviews r
    JOIN albums a ON a.id = r.album_id
    JOIN users u ON u.id = r.user_id
    ORDER BY r.updated_at DESC
    LIMIT 100
  `).all(req.user.id)
  const itemsOut = items.map((it) => ({ ...it, liked_by_me: !!it.liked_by_me }))
  res.json({ items: itemsOut })
})

export default router
