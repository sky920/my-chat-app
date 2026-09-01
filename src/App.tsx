import { useEffect } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ChatList } from './pages/ChatList'
import { ChatRoom } from './pages/ChatRoom'
import { useChatStore } from './stores/chatStore'

export default function App() {
  useEffect(() => {
    useChatStore.persist.onFinishHydration(() => {
      useChatStore.getState().seedMockIfEmpty()
    })
    if (useChatStore.persist.hasHydrated()) {
      useChatStore.getState().seedMockIfEmpty()
    }
  }, [])

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<ChatList />} />
        <Route path="/chat/:characterId" element={<ChatRoom />} />
        <Route path="/chat" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}
