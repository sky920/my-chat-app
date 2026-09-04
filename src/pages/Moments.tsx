import { useNavigate } from 'react-router-dom'
import { getCharacter } from '../characters'
import { TabBar } from '../components/TabBar'
import { useMomentsStore } from '../stores/momentsStore'
import { playSound } from '../utils/sound'
import styles from '../styles/moments.module.css'

function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
}

export function Moments() {
  const navigate = useNavigate()
  const moments = useMomentsStore((s) => s.moments)

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <span className={styles.headerTitle}>朋友圈</span>
      </header>

      <div className={styles.list}>
        {moments.length === 0 ? (
          <div className={styles.empty}>
            <p>还没有朋友圈动态</p>
            <p className={styles.emptyHint}>和朋友聊天后会自动触发</p>
          </div>
        ) : (
          moments.map((moment) => {
            const character = getCharacter(moment.characterId)
            if (!character) return null

            return (
              <div key={moment.id} className={styles.momentItem}>
                <div className={styles.momentHeader}>
                  <img
                    src={character.avatar}
                    alt={character.name}
                    className={styles.avatar}
                  />
                  <div className={styles.momentMeta}>
                    <span
                      className={styles.momentName}
                      onClick={() => {
                        playSound('tap')
                        navigate(`/chat/${character.id}`)
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      {character.name}
                    </span>
                    <span className={styles.momentTime}>{formatTime(moment.timestamp)}</span>
                  </div>
                </div>
                <div className={styles.momentContent}>{moment.content}</div>
              </div>
            )
          })
        )}
      </div>
      <TabBar />
    </div>
  )
}
