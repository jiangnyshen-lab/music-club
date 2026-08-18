import crypto from 'node:crypto'
import { db } from './db.js'

export function createToken() {
  return crypto.randomBytes(32).toString('hex')
}

export function getUserFromToken(token) {
  if (!token) return null
  return db.prepare(`
    SELECT u.id, u.username, u.display_name, u.is_admin,
      u.avatar, u.bio, u.favorite_artists, u.favorite_albums, u.favorite_genres, u.created_at
    FROM sessions s JOIN users u ON u.id = s.user_id
    WHERE s.token = ?
  `).get(token) || null
}

// 从 Authorization: Bearer <token> 里解析 token
function tokenFromHeader(req) {
  const header = req.headers.authorization || ''
  return header.startsWith('Bearer ') ? header.slice(7) : null
}

export function requireAuth(req, res, next) {
  const user = getUserFromToken(tokenFromHeader(req))
  if (!user) return res.status(401).json({ error: '未登录' })
  req.user = user
  next()
}

export function requireAdmin(req, res, next) {
  if (!req.user || !req.user.is_admin) return res.status(403).json({ error: '需要发起人权限' })
  next()
}
