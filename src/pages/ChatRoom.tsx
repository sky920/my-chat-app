import { useCallback, useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { getCharacter } from '../characters'
import { ChatInput } from '../components/ChatInput'
import { MessageBubble } from '../components/MessageBubble'
import { fetchChat, hasApiKey } from '../services/deepseek'
import { useChatStore, EMPTY_MESSAGES, type Message } from '../stores/chatStore'
import { playSound } from '../utils/sound'
import { normalizeChatText } from '../utils/text'
import styles from '../styles/chat-room.module.css'

export function ChatRoom() {
  const { characterId } = useParams<{ characterId: string }>()
  const character = getCharacter(characterId)
  const navigate = useNavigate()

  const messages = useChatStore((s) =>
    characterId ? (s.chats[characterId]?.messages ?? EMPTY_MESSAGES) : EMPTY_MESSAGES,
  )
  const addMessage = useChatStore((s) => s.addMessage)
  const clearHistory = useChatStore((s) => s.clearHistory)

  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const pendingRetryRef = useRef<string | null>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  const requestReply = useCallback(
    async (history: Message[], userText: string, playSendSound = false) => {
      if (!character || !characterId || isSending) return

      if (playSendSound) {
        playSound('send')
      }

      setIsSending(true)
      abortRef.current?.abort()
      abortRef.current = new AbortController()

      try {
        const reply = await fetchChat(
          character.systemPrompt,
          history,
          userText,
          abortRef.current.signal,
        )
        playSound('receive')
        addMessage(characterId, { role: 'assistant', content: normalizeChatText(reply) })
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return
        }
        addMessage(characterId, {
          role: 'error',
          content: err instanceof Error ? err.message : String(err),
        })
        pendingRetryRef.current = userText
      } finally {
        setIsSending(false)
      }
    },
    [character, characterId, isSending, addMessage],
  )

  if (!character || !characterId) {
    return <Navigate to="/" replace />
  }

  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed || isSending) return

    setInput('')
    const historyBeforeSend = useChatStore.getState().getMessages(characterId)
    addMessage(characterId, { role: 'user', content: trimmed })
    void requestReply(historyBeforeSend, trimmed, true)
  }

  const handleRetry = () => {
    const current = useChatStore.getState().getMessages(characterId)
    const filtered = current.filter((m) => m.role !== 'error')
    useChatStore.setState((state) => ({
      chats: {
        ...state.chats,
        [characterId]: {
          ...(state.chats[characterId] ?? { messages: [], historyCleared: false }),
          messages: filtered,
        },
      },
    }))

    const retryText =
      pendingRetryRef.current ??
      [...filtered].reverse().find((m) => m.role === 'user')?.content

    if (!retryText) return

    pendingRetryRef.current = null
    const historyForRetry = filtered.filter((m) => m.role === 'user' || m.role === 'assistant')
    void requestReply(historyForRetry.slice(0, -1), retryText, false)
  }

  const handleBack = () => {
    playSound('tap')
    navigate('/')
  }

  const handleClearHistory = () => {
    if (messages.length === 0) return
    playSound('tap')
    abortRef.current?.abort()
    abortRef.current = null
    pendingRetryRef.current = null
    setIsSending(false)
    clearHistory(characterId)
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button type="button" className={styles.backBtn} onClick={handleBack} aria-label="返回">
            <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
              <path
                d="M15.5 4.5L8 12l7.5 7.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <span className={styles.headerName}>{character.name}</span>
        </div>
        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.headerActionBtn}
            onClick={handleClearHistory}
            aria-label="清空聊天记录"
            disabled={messages.length === 0}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path
                d="M5 7h14M10 11v6M14 11v6M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M6.5 7l.8 12.2A1.5 1.5 0 0 0 8.8 20.5h6.4a1.5 1.5 0 0 0 1.5-1.3L17.5 7"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button type="button" className={styles.headerActionBtn} aria-label="通话">
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path
                d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1.1-.3 1.2.4 2.5.6 3.8.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.6.6 3.8.1.4 0 .8-.3 1.1L6.6 10.8z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button type="button" className={styles.headerActionBtn} aria-label="更多">
            <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
              <path
                d="M5 7h14M5 12h14M5 17h14"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </header>

      <div className={styles.messages}>
        {!hasApiKey() && (
          <div className={styles.warning}>
            演示模式：未配置 API Key，使用 mock 数据回复
          </div>
        )}

        {messages.map((msg, index) => {
          const showRead =
            msg.role === 'user' &&
            messages.slice(index + 1).some((m) => m.role === 'assistant')

          return (
            <MessageBubble
              key={msg.id}
              role={msg.role}
              content={msg.content}
              avatar={msg.role === 'assistant' ? character.avatar : undefined}
              name={msg.role === 'assistant' ? character.name : undefined}
              timestamp={msg.timestamp}
              incomplete={msg.incomplete}
              showRead={showRead}
              lang={character.id === 'alex' ? 'en' : undefined}
              onRetry={msg.role === 'error' ? handleRetry : undefined}
            />
          )
        })}

        <div ref={messagesEndRef} />
      </div>

      <ChatInput value={input} onChange={setInput} onSend={handleSend} disabled={isSending} />
    </div>
  )
}
