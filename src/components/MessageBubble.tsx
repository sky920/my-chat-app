import { normalizeChatText } from '../utils/text'
import styles from '../styles/chat-room.module.css'

interface MessageBubbleProps {
  role: 'user' | 'assistant' | 'error'
  content: string
  avatar?: string
  name?: string
  timestamp?: number
  incomplete?: boolean
  showRead?: boolean
  lang?: string
  onRetry?: () => void
}

function formatTime(timestamp?: number): string {
  if (!timestamp) return ''
  return new Date(timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function looksLikeEnglish(text: string): boolean {
  const letters = text.replace(/[^A-Za-z\u4e00-\u9fff]/g, '')
  if (!letters) return false
  const latin = (letters.match(/[A-Za-z]/g) ?? []).length
  return latin / letters.length > 0.6
}

export function MessageBubble({
  role,
  content,
  avatar,
  name,
  timestamp,
  incomplete,
  showRead = false,
  lang,
  onRetry,
}: MessageBubbleProps) {
  const displayText = normalizeChatText(content)
  const isEnglish = lang === 'en' || looksLikeEnglish(displayText)

  if (role === 'error') {
    return (
      <div className={styles.bubbleRow}>
        <button type="button" className={`${styles.bubble} ${styles.bubbleError}`} onClick={onRetry}>
          {displayText}
          {onRetry && '\n点击重试'}
        </button>
      </div>
    )
  }

  const isSelf = role === 'user'
  const time = formatTime(timestamp)

  return (
    <div className={`${styles.bubbleRow} ${isSelf ? styles.bubbleRowSelf : styles.bubbleRowOther}`}>
      {!isSelf &&
        (avatar ? (
          <img src={avatar} alt="" className={styles.bubbleAvatar} />
        ) : (
          <div className={styles.bubbleAvatarPlaceholder} />
        ))}

      <div className={styles.bubbleColumn}>
        {!isSelf && name && <div className={styles.senderName}>{name}</div>}

        <div className={`${styles.bubbleBody} ${isSelf ? styles.bubbleBodySelf : styles.bubbleBodyOther}`}>
          {isSelf && time && (
            <div className={styles.meta}>
              {showRead && <span className={styles.metaRead}>已读</span>}
              <span className={styles.metaTime}>{time}</span>
            </div>
          )}

          <div className={styles.bubbleWrap}>
            <div
              lang={isEnglish ? 'en' : 'zh-CN'}
              className={`${styles.bubble} ${isSelf ? styles.bubbleSelf : styles.bubbleOther} ${isEnglish ? styles.bubbleEn : ''} ${incomplete ? styles.incomplete : ''}`}
            >
              {displayText || ' '}
            </div>
          </div>

          {!isSelf && time && (
            <div className={styles.meta}>
              <span className={styles.metaTime}>{time}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
