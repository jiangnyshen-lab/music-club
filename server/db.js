import { DatabaseSync } from 'node:sqlite'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// 数据目录可用 DATA_DIR 环境变量覆盖（部署时挂持久磁盘用）
const dataDir = process.env.DATA_DIR || path.join(__dirname, '..', 'data')
fs.mkdirSync(dataDir, { recursive: true })

export const db = new DatabaseSync(path.join(dataDir, 'app.db'))
db.exec('PRAGMA journal_mode = WAL;')
db.exec('PRAGMA foreign_keys = ON;')

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  is_admin INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  avatar TEXT,
  bio TEXT,
  favorite_artists TEXT,
  favorite_albums TEXT,
  favorite_genres TEXT
);

CREATE TABLE IF NOT EXISTS invite_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS albums (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  collection_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  year TEXT,
  cover_url TEXT,
  track_count INTEGER,
  genre TEXT,
  tracks_json TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  album_id INTEGER NOT NULL,
  listen_type TEXT NOT NULL DEFAULT 'full',
  score REAL,
  impression TEXT,
  fav_track TEXT,
  least_track TEXT,
  association TEXT,
  relisten TEXT,
  long_review TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (user_id, album_id)
);

CREATE TABLE IF NOT EXISTS dimension_scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  review_id INTEGER NOT NULL,
  dimension TEXT NOT NULL,
  score REAL,
  note TEXT
);

CREATE TABLE IF NOT EXISTS parties (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  album_id INTEGER NOT NULL,
  creator_id INTEGER NOT NULL,
  title TEXT,
  scheduled_date TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS party_members (
  party_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  joined_at TEXT NOT NULL,
  PRIMARY KEY (party_id, user_id)
);

CREATE TABLE IF NOT EXISTS party_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  party_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS review_likes (
  review_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (review_id, user_id)
);

CREATE TABLE IF NOT EXISTS review_comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  review_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS featured_albums (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  album_id INTEGER NOT NULL,
  note TEXT,
  ends_at TEXT,
  created_by INTEGER NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS track_reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  album_id INTEGER NOT NULL,
  track_number INTEGER NOT NULL,
  track_title TEXT,
  score REAL,
  impression TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (user_id, album_id, track_number)
);

CREATE TABLE IF NOT EXISTS track_dimension_scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  track_review_id INTEGER NOT NULL,
  dimension TEXT NOT NULL,
  score REAL,
  note TEXT
);
`)

// 老库补列：给已存在的 users 表加个人主页字段（列已存在则忽略报错）
const userColumns = [
  'ALTER TABLE users ADD COLUMN avatar TEXT',
  'ALTER TABLE users ADD COLUMN bio TEXT',
  'ALTER TABLE users ADD COLUMN favorite_artists TEXT',
  'ALTER TABLE users ADD COLUMN favorite_albums TEXT',
  'ALTER TABLE users ADD COLUMN favorite_genres TEXT'
]
for (const sql of userColumns) {
  try { db.exec(sql) } catch { /* 列已存在，跳过 */ }
}

// 老库补列：给已存在的 albums 表加流派字段
const albumColumns = [
  'ALTER TABLE albums ADD COLUMN genre TEXT'
]
for (const sql of albumColumns) {
  try { db.exec(sql) } catch { /* 列已存在，跳过 */ }
}

// 当前时间（ISO，前端直接能格式化）
export function now() {
  return new Date().toISOString()
}

// 密码哈希（用 Node 内置 scrypt，不依赖 bcrypt 原生包）
export function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex')
}

// 生成友好邀请码（去掉容易看混的 0/O、1/I）
export function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let out = ''
  for (let i = 0; i < 6; i++) out += chars[crypto.randomInt(chars.length)]
  return out
}

// 首次启动：生成圈子邀请码（一个码，所有朋友共用）
export function ensureSeed() {
  const existing = db.prepare('SELECT COUNT(*) AS c FROM invite_codes').get()
  if (existing.c > 0) return
  const code = process.env.INVITE_CODE || generateCode()
  db.prepare('INSERT INTO invite_codes (code, created_at) VALUES (?, ?)').run(code, now())
  const file = path.join(dataDir, 'invite-code.txt')
  fs.writeFileSync(file, '音乐圈邀请码：' + code + '\n')
  console.log('')
  console.log('  🎟️  圈子邀请码（发给朋友注册用）：' + code)
  console.log('      已保存到 data/invite-code.txt')
  console.log('')
}

// 命令行直接运行：node server/db.js 手动初始化
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  ensureSeed()
  console.log('数据库初始化完成，位置：' + path.join(dataDir, 'app.db'))
}
