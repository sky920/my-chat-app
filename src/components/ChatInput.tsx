import { useEffect, useRef, type KeyboardEvent } from 'react'
import styles from '../styles/chat-room.module.css'

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  disabled?: boolean
}

export function ChatInput({ value, onChange, onSend, disabled }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (value.trim() && !disabled) {
        onSend()
      }
    }
  }

  const autoResize = () => {
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = `${Math.min(el.scrollHeight, 120)}px`
    }
  }

  // value 变化时自动调整高度（发送后清空会恢复单行）
  useEffect(() => {
    autoResize()
  }, [value])

  return (
    <div className={styles.inputArea}>
      <button type="button" className={styles.cameraBtn} aria-label="相机" disabled={disabled}>
        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
          <path
            d="M4 8.5A2.5 2.5 0 0 1 6.5 6h2l1.2-1.6A1.5 1.5 0 0 1 10.9 4h2.2c.5 0 1 .2 1.2.6L15.5 6h2A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-8z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <circle
            cx="12"
            cy="12.5"
            r="3.2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          />
        </svg>
      </button>
      <textarea
        ref={textareaRef}
        className={styles.input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="输入消息"
        rows={1}
        disabled={disabled}
      />
      <button
        type="button"
        className={styles.sendBtn}
        onClick={onSend}
        disabled={disabled || !value.trim()}
        aria-label="发送"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">
          <path d="M3 20.5L21.5 12 3 3.5 3.2 9.8 15 12 3.2 14.2z" />
        </svg>
      </button>
    </div>
  )
}
