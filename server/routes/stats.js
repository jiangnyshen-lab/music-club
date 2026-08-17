import express from 'express'
import { db } from '../db.js'
import { requireAuth } from '../auth.js'

const router = express.Router()

// 数据报告：圈子概览 + 我的数据
router.get('/stats', requireAuth, (req, res) => {
  const albumCount = db.prepare('SELECT COUNT(*) AS c FROM albums').get().c
  const reviewCount = db.prepare('SELECT COUNT(*) AS c FROM reviews').get().c
  const avgScore = db.prepare('SELECT AVG(score) AS a FROM reviews WHERE score IS NOT NULL').get().a

  const topListener = db.prepare(`
    SELECT u.display_name, COUNT(r.id) AS c
    FROM reviews r JOIN users u ON u.id = r.user_id
    GROUP BY u.id ORDER BY c DESC LIMIT 1
  `).get() || null

  const strictest = db.prepare(`
    SELECT u.display_name, ROUND(AVG(r.score), 1) AS a, COUNT(r.id) AS c
    FROM reviews r JOIN users u ON u.id = r.user_id
    WHERE r.score IS NOT NULL
    GROUP BY u.id HAVING COUNT(r.id) >= 3
    ORDER BY a ASC LIMIT 1
  `).get() || null

  const myCount = db.prepare('SELECT COUNT(*) AS c FROM reviews WHERE user_id = ?').get(req.user.id).c
  const myAvg = db.prepare('SELECT AVG(score) AS a FROM reviews WHERE user_id = ? AND score IS NOT NULL').get(req.user.id).a
  const myTop = db.prepare(`
    SELECT a.id, a.title, a.artist, a.year, a.cover_url, r.score
    FROM reviews r JOIN albums a ON a.id = r.album_id
    WHERE r.user_id = ? AND r.score IS NOT NULL
    ORDER BY r.score DESC, r.updated_at DESC LIMIT 5
  `).all(req.user.id)

  res.json({
    circle: {
      album_count: albumCount,
      review_count: reviewCount,
      avg_score: avgScore == null ? null : Math.round(avgScore * 10) / 10,
      top_listener: topListener,
      strictest: strictest
    },
    me: {
      review_count: myCount,
      avg_score: myAvg == null ? null : Math.round(myAvg * 10) / 10,
      top: myTop
    }
  })
})

// 口味匹配：按「共同听过 + 打分差距」算谁跟我口味最像
router.get('/taste', requireAuth, (req, res) => {
  const matches = db.prepare(`
    SELECT u.id, u.display_name,
      COUNT(*) AS common_count,
      ROUND(AVG(ABS(r1.score - r2.score)), 1) AS avg_diff
    FROM reviews r1
    JOIN reviews r2 ON r2.album_id = r1.album_id AND r2.user_id != r1.user_id
    JOIN users u ON u.id = r2.user_id
    WHERE r1.user_id = ? AND r1.score IS NOT NULL AND r2.score IS NOT NULL
    GROUP BY u.id
    ORDER BY avg_diff ASC, common_count DESC
  `).all(req.user.id)
  res.json({ matches })
})

export default router
