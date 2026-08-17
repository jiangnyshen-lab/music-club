import express from 'express'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { ensureSeed } from './db.js'
import authRoutes from './routes/auth.js'
import albumRoutes from './routes/albums.js'
import reviewRoutes from './routes/reviews.js'
import feedRoutes from './routes/feed.js'
import partyRoutes from './routes/parties.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
app.use(express.json())

ensureSeed()

app.use('/api', authRoutes)
app.use('/api', albumRoutes)
app.use('/api', reviewRoutes)
app.use('/api', feedRoutes)
app.use('/api', partyRoutes)

app.get('/api/health', (req, res) => res.json({ ok: true }))

// 生产环境：把前端构建产物当静态资源，其余路径都回到 index.html（SPA）
const dist = path.join(__dirname, '..', 'dist')
if (fs.existsSync(dist)) {
  app.use(express.static(dist))
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(dist, 'index.html'))
    }
    next()
  })
}

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log('  🎵 音乐圈已启动：http://localhost:' + PORT)
})
