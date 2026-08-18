import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, NavLink, Link } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth.jsx'
import Login from './pages/Login.jsx'
import Feed from './pages/Feed.jsx'
import Search from './pages/Search.jsx'
import AlbumDetail from './pages/AlbumDetail.jsx'
import Parties from './pages/Parties.jsx'
import PartyDetail from './pages/PartyDetail.jsx'
import TopAlbums from './pages/TopAlbums.jsx'
import MyAlbums from './pages/MyAlbums.jsx'
import Report from './pages/Report.jsx'
import Profile from './pages/Profile.jsx'
import WhatNew from './components/WhatNew.jsx'
import { Avatar } from './components/ui.jsx'
import { APP_VERSION } from './updates.js'

function Shell() {
  const { user, logout } = useAuth()
  const [whatNewOpen, setWhatNewOpen] = useState(false)

  useEffect(() => {
    if (localStorage.getItem('mc_lastSeenVersion') !== APP_VERSION) {
      setWhatNewOpen(true)
    }
  }, [])

  function closeWhatNew() {
    localStorage.setItem('mc_lastSeenVersion', APP_VERSION)
    setWhatNewOpen(false)
  }

  return (
    <div className="shell">
      <header className="topbar">
        <Link to="/" className="brand">🎵 音乐圈</Link>
        <nav>
          <NavLink to="/" end>时间线</NavLink>
          <NavLink to="/top">排行榜</NavLink>
          <NavLink to="/search">搜专辑</NavLink>
          <NavLink to="/parties">听友会</NavLink>
          <NavLink to="/report">报告</NavLink>
          <NavLink to="/mine">我的</NavLink>
        </nav>
        <div className="user-box">
          <Link to={'/users/' + user.id} className="user-chip">
            <Avatar user={user} size={28} />
            <span>{user?.display_name}</span>
          </Link>
          <button className="link-btn" onClick={() => setWhatNewOpen(true)}>更新</button>
          <button className="link-btn" onClick={logout}>退出</button>
        </div>
      </header>
      <main className="content">
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/top" element={<TopAlbums />} />
          <Route path="/mine" element={<MyAlbums />} />
          <Route path="/report" element={<Report />} />
          <Route path="/users/:id" element={<Profile />} />
          <Route path="/search" element={<Search />} />
          <Route path="/albums/:id" element={<AlbumDetail />} />
          <Route path="/parties" element={<Parties />} />
          <Route path="/parties/:id" element={<PartyDetail />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {whatNewOpen && <WhatNew onClose={closeWhatNew} />}
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
