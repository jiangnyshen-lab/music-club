import { useState } from 'react'
import { useAuth } from '../auth.jsx'

export default function Login() {
  const { login, register } = useAuth()
  const [mode, setMode] = useState('login')
  const [inviteCode, setInviteCode] = useState('')
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (mode === 'login') await login(username, password)
      else await register(inviteCode, username, password, displayName)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">🎵 音乐圈</h1>
        <p className="auth-sub">和朋友的「听专辑」共写日记</p>
        <div className="tabs">
          <button className={'tab ' + (mode === 'login' ? 'active' : '')} onClick={() => setMode('login')}>登录</button>
          <button className={'tab ' + (mode === 'register' ? 'active' : '')} onClick={() => setMode('register')}>注册</button>
        </div>
        <form onSubmit={submit}>
          {mode === 'register' && (
            <>
              <label>邀请码</label>
              <input value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} placeholder="朋友给你的 6 位码" autoComplete="off" />
              <label>昵称</label>
              <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="朋友看到的名字" autoComplete="off" />
            </>
          )}
          <label>用户名</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="登录用，2 字以上" autoComplete="username" />
          <label>密码</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="至少 6 位" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
          {error && <div className="error">{error}</div>}
          <button className="primary-btn" disabled={busy}>{busy ? '请稍候…' : mode === 'login' ? '登录' : '加入圈子'}</button>
        </form>
      </div>
    </div>
  )
}
