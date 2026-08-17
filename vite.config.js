import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 开发时 Vite 跑在 5173，把 /api 请求转发给后端 3001
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001'
    }
  }
})
