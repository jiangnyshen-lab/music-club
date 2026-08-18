import { useState } from 'react'
import { UPDATES } from '../updates.js'

// 更新公告弹窗：最新版本 + 历史版本，可随时重看
export default function WhatNew({ onClose }) {
  const latest = UPDATES[0]
  const history = UPDATES.slice(1)
  const [showHistory, setShowHistory] = useState(false)

  return (
    <div className="overlay" onClick={onClose}>
      <div className="whatnew" onClick={(e) => e.stopPropagation()}>
        <div className="whatnew-head">
          <div>
            <div className="whatnew-kicker">🎵 音乐圈更新</div>
            <div className="whatnew-title">{latest.version} · {latest.title}</div>
            <div className="whatnew-date">{latest.date}</div>
          </div>
          <button className="whatnew-close" onClick={onClose} aria-label="关闭">×</button>
        </div>

        <div className="whatnew-body">
          <div className="whatnew-sub">本次新增</div>
          <ul className="whatnew-list">
            {latest.items.map((it, i) => <li key={i}>{it}</li>)}
          </ul>

          <button type="button" className="ghost-btn" onClick={() => setShowHistory(!showHistory)}>
            {showHistory ? '收起历史版本 ▴' : '查看历史版本 ▾'}
          </button>
          {showHistory && (
            <div className="whatnew-history">
              {history.map((u) => (
                <div className="whatnew-ver" key={u.version}>
                  <div className="whatnew-ver-head">
                    <span className="whatnew-ver-tag">{u.version}</span>
                    <span className="whatnew-ver-title">{u.title}</span>
                    <span className="muted small">{u.date}</span>
                  </div>
                  <ul className="whatnew-list">
                    {u.items.map((it, i) => <li key={i}>{it}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="whatnew-foot">
          <div className="whatnew-welcome">🎉 欢迎体验新功能，去试试吧！</div>
          <button className="primary-btn" onClick={onClose}>知道了，去体验</button>
        </div>
      </div>
    </div>
  )
}
