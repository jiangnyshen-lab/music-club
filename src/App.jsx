import { Routes, Route, Navigate, NavLink, Link } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth.jsx'
import Login from './pages/Login.jsx'
import Feed from './pages/Feed.jsx'
import Search from './pages/Search.jsx'
import AlbumDetail from './pages/AlbumDetail.jsx'
import Parties from './pages/Parties.jsx'
import PartyDetail from './pages/PartyDetail.jsx'

function Shell() {
  const { user, logout } = useAuth()
  return (
    <div className="shell">
      <header className="topbar">
        <Link to="/" className="brand">🎵 音乐圈</Link>
        <nav>
          <NavLink to="/" end>时间线</NavLink>
          <NavLink to="/search">搜专辑</NavLink>
          <NavLink to="/parties">听友会</NavLink>
        </nav>
        <div className="user-box">
          <span>{user?.display_name}</span>
          <button className="link-btn" onClick={logout}>退出</button>
        </div>
      </header>
      <main className="content">
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/search" element={<Search />} />
          <Route path="/albums/:id" element={<AlbumDetail />} />
          <Route path="/parties" element={<Parties />} />
          <Route path="/parties/:id" element={<PartyDetail />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

function Gate() {
  const { user, loading } = useAuth()
  if (loading) return <div className="center muted">加载中…</div>
  return user ? <Shell /> : <Login />
}

export default function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  )
}
