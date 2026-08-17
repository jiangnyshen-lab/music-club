import express from 'express'
import { db, now } from '../db.js'
import { requireAuth } from '../auth.js'

const router = express.Router()

function getParty(id) {
  return db.prepare(`
    SELECT p.*, a.title AS album_title, a.artist AS album_artist, a.cover_url, a.year, a.id AS album_id,
           u.display_name AS creator_name
    FROM parties p
    JOIN albums a ON a.id = p.album_id
    JOIN users u ON u.id = p.creator_id
    WHERE p.id = ?
  `).get(id)
}

// 发起听友会（发起人自动加入）
router.post('/parties', requireAuth, (req, res) => {
  const { albumId, title, scheduledDate } = req.body || {}
  const album = db.prepare('SELECT id FROM albums WHERE id = ?').get(albumId)
  if (!album) return res.status(400).json({ error: '要先保存这张专辑，才能发起听友会' })
  const info = db.prepare(
    'INSERT INTO parties (album_id, creator_id, title, scheduled_date, created_at) VALUES (?,?,?,?,?)'
  ).run(album.id, req.user.id, title || null, scheduledDate || null, now())
  const partyId = Number(info.lastInsertRowid)
  db.prepare('INSERT INTO party_members (party_id, user_id, joined_at) VALUES (?,?,?)').run(partyId, req.user.id, now())
  res.json({ party: getParty(partyId) })
})

router.get('/parties', requireAuth, (req, res) => {
  const parties = db.prepare(`
    SELECT p.*, a.title AS album_title, a.artist AS album_artist, a.cover_url, a.id AS album_id,
           u.display_name AS creator_name,
           (SELECT COUNT(*) FROM party_members pm WHERE pm.party_id = p.id) AS member_count,
           (SELECT COUNT(*) FROM party_posts pp WHERE pp.party_id = p.id) AS post_count
    FROM parties p
    JOIN albums a ON a.id = p.album_id
    JOIN users u ON u.id = p.creator_id
    ORDER BY p.created_at DESC
  `).all()
  res.json({ parties })
})

router.get('/parties/:id', requireAuth, (req, res) => {
  const party = getParty(req.params.id)
  if (!party) return res.status(404).json({ error: '听友会不存在' })
  const members = db.prepare(
    'SELECT u.id, u.display_name FROM party_members pm JOIN users u ON u.id = pm.user_id WHERE pm.party_id = ?'
  ).all(party.id)
  const posts = db.prepare(
    'SELECT pp.*, u.display_name FROM party_posts pp JOIN users u ON u.id = pp.user_id WHERE pp.party_id = ? ORDER BY pp.created_at ASC'
  ).all(party.id)
  res.json({ party, members, posts })
})

router.post('/parties/:id/join', requireAuth, (req, res) => {
  const party = getParty(req.params.id)
  if (!party) return res.status(404).json({ error: '听友会不存在' })
  db.prepare('INSERT OR IGNORE INTO party_members (party_id, user_id, joined_at) VALUES (?,?,?)').run(party.id, req.user.id, now())
  res.json({ ok: true })
})

router.post('/parties/:id/posts', requireAuth, (req, res) => {
  const party = getParty(req.params.id)
  if (!party) return res.status(404).json({ error: '听友会不存在' })
  const content = (req.body?.content || '').trim()
  if (!content) return res.status(400).json({ error: '内容不能为空' })
  const info = db.prepare(
    'INSERT INTO party_posts (party_id, user_id, content, created_at) VALUES (?,?,?,?)'
  ).run(party.id, req.user.id, content, now())
  const post = db.prepare(
    'SELECT pp.*, u.display_name FROM party_posts pp JOIN users u ON u.id = pp.user_id WHERE pp.id = ?'
  ).get(Number(info.lastInsertRowid))
  res.json({ post })
})

export default router
