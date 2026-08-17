import express from 'express'
import crypto from 'node:crypto'
import { db, hashPassword, now } from '../db.js'
import { createToken, requireAuth } from '../auth.js'

const router = express.Router()

function makeSalt() {
  return crypto.randomBytes(16).toString('hex')
}

function publicUser(u) {
  return { id: u.id, username: u.username, display_name: u.display_name, is_admin: u.is_admin }
}

// 注册（需要邀请码）
router.post('/register', (req, res) => {
  const { inviteCode, username, password, displayName } = req.body || {}
  if (!inviteCode || !username || !password) {
    return res.status(400).json({ error: '邀请码、用户名、密码都不能为空' })
  }
  if (username.length < 2) return res.status(400).json({ error: '用户名至少 2 个字' })
  if (password.length < 6) return res.status(400).json({ error: '密码至少 6 位' })

  const codeRow = db.prepare('SELECT * FROM invite_codes WHERE code = ?').get(inviteCode.trim().toUpperCase())
  if (!codeRow) return res.status(400).json({ error: '邀请码不对' })

  const exists = db.prepare('SELECT id FROM users WHERE username = ?').get(username.trim())
  if (exists) return res.status(400).json({ error: '这个用户名已经被注册了' })

  const salt = makeSalt()
  const hash = hashPassword(password, salt)
  const info = db.prepare(
    'INSERT INTO users (username, display_name, password_hash, salt, is_admin, created_at) VALUES (?,?,?,?,0,?)'
  ).run(username.trim(), (displayName || username).trim(), hash, salt, now())
  const userId = Number(info.lastInsertRowid)

  // 第一个注册的人自动成为发起人
  const userCount = db.prepare('SELECT COUNT(*) AS c FROM users').get().c
  if (userCount === 1) db.prepare('UPDATE users SET is_admin = 1 WHERE id = ?').run(userId)

  const token = createToken()
  db.prepare('INSERT INTO sessions (token, user_id, created_at) VALUES (?,?,?)').run(token, userId, now())
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId)
  res.json({ token, user: publicUser(user) })
})

// 登录
router.post('/login', (req, res) => {
  const { username, password } = req.body || {}
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get((username || '').trim())
  if (!user) return res.status(401).json({ error: '用户名或密码不对' })
  if (hashPassword(password || '', user.salt) !== user.password_hash) {
    return res.status(401).json({ error: '用户名或密码不对' })
  }
  const token = createToken()
  db.prepare('INSERT INTO sessions (token, user_id, created_at) VALUES (?,?,?)').run(token, user.id, now())
  res.json({ token, user: publicUser(user) })
})

router.get('/me', requireAuth, (req, res) => res.json({ user: req.user }))

router.post('/logout', requireAuth, (req, res) => {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  db.prepare('DELETE FROM sessions WHERE token = ?').run(token)
  res.json({ ok: true })
})

export default router
