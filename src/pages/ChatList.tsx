import { useNavigate } from 'react-router-dom'
import { characters } from '../characters'
import { TabBar } from '../components/TabBar'
import { useChatStore } from '../stores/chatStore'
import { playSound } from '../utils/sound'
import styles from '../styles/chat-list.module.css'

function formatTime(timestamp: number | null): string {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const now = new Date()
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()

  if (isToday) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })
  }
  return date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
}

export function ChatList() {
  const navigate = useNavigate()
  const chats = useChatStore((s) => s.chats)

  const sorted = [...characters].sort((a, b) => {
    const ta = chats[a.id]?.messages.at(-1)?.timestamp ?? 0
    const tb = chats[b.id]?.messages.at(-1)?.timestamp ?? 0
    return tb - ta
  })

  return (
    <div className={styles.page}>
      <header className={styles.topBar}>
        <span className={styles.topBarTitle}>消息</span>
      </header>
      <div className={styles.list}>
        {sorted.map((character) => {
          const messages = chats[character.id]?.messages ?? []
          const last = messages[messages.length - 1]
          const preview = last
            ? (() => {
                const text = last.content.replace(/\n/g, ' ')
                return text.length > 30 ? `${text.slice(0, 30)}…` : text
              })()
            : '点击开始聊天吧'

          return (
            <div
              key={character.id}
              className={styles.item}
              onClick={() => {
                playSound('tap')
                navigate(`/chat/${character.id}`)
              }}
              role="button"
              tabIndex={0}
            >
              <img src={character.avatar} alt={character.name} className={styles.avatar} />
              <div className={styles.content}>
                <div className={styles.topRow}>
                  <span className={styles.name}>{character.name}</span>
                  <span className={styles.time}>{formatTime(last?.timestamp ?? null)}</span>
                </div>
                <div className={styles.preview}>{preview}</div>
              </div>
            </div>
          )
        })}
      </div>
      <TabBar />
    </div>
  )
}
