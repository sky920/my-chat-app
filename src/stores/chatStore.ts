import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { characters } from '../characters'
import { MOCK_SEED_BY_CHARACTER } from '../data/mockMessages'
import { hasApiKey } from '../services/deepseek'

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'error'
  content: string
  timestamp: number
  incomplete?: boolean
}

export const EMPTY_MESSAGES: Message[] = []

interface CharacterChat {
  messages: Message[]
  historyCleared: boolean
}

interface ChatState {
  chats: Record<string, CharacterChat>
  /** 每个角色自定义的 systemPrompt（用户在更多面板编辑后保存） */
  customPrompts: Record<string, string>
  addMessage: (
    characterId: string,
    message: Omit<Message, 'id' | 'timestamp'> & { id?: string; timestamp?: number },
  ) => string
  clearHistory: (characterId: string) => void
  seedMockIfEmpty: () => void
  getMessages: (characterId: string) => Message[]
  getLastPreview: (characterId: string) => string
  getLastTimestamp: (characterId: string) => number | null
  /** 保存某角色的自定义 systemPrompt */
  setCustomPrompt: (characterId: string, prompt: string) => void
  /** 恢复某角色的默认 systemPrompt */
  resetCustomPrompt: (characterId: string) => void
  /** 获取某角色当前生效的 systemPrompt（自定义优先） */
  getCustomPrompt: (characterId: string) => string | undefined
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function emptyChat(): CharacterChat {
  return { messages: [], historyCleared: false }
}

function ensureChat(chats: Record<string, CharacterChat>, characterId: string): CharacterChat {
  return chats[characterId] ?? emptyChat()
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      chats: Object.fromEntries(characters.map((c) => [c.id, emptyChat()])),
      customPrompts: {},

      addMessage: (characterId, message) => {
        const id = message.id ?? generateId()
        const newMessage: Message = {
          id,
          role: message.role,
          content: message.content,
          timestamp: message.timestamp ?? Date.now(),
          incomplete: message.incomplete,
        }
        set((state) => {
          const chat = ensureChat(state.chats, characterId)
          return {
            chats: {
              ...state.chats,
              [characterId]: {
                ...chat,
                messages: [...chat.messages, newMessage],
              },
            },
          }
        })
        return id
      },

      clearHistory: (characterId) => {
        set((state) => ({
          chats: {
            ...state.chats,
            [characterId]: { messages: [], historyCleared: true },
          },
        }))
      },

      seedMockIfEmpty: () => {
        set((state) => {
          const next = { ...state.chats }
          let changed = false

          // 新角色加入时补齐会话槽位，避免 selector 反复返回临时空数组
          for (const character of characters) {
            if (!next[character.id]) {
              next[character.id] = emptyChat()
              changed = true
            }
          }

          if (!hasApiKey()) {
            for (const character of characters) {
              const chat = ensureChat(next, character.id)
              if (chat.historyCleared || chat.messages.length > 0) continue
              const seeds = MOCK_SEED_BY_CHARACTER[character.id]
              if (!seeds?.length) continue
              next[character.id] = {
                ...chat,
                messages: seeds.map((msg) => ({ ...msg, id: generateId() })),
              }
              changed = true
            }
          }

          return changed ? { chats: next } : state
        })
      },

      getMessages: (characterId) => ensureChat(get().chats, characterId).messages || EMPTY_MESSAGES,

      getLastPreview: (characterId) => {
        const messages = ensureChat(get().chats, characterId).messages
        const last = messages[messages.length - 1]
        if (!last) return '点击开始聊天吧'
        const text = last.content.replace(/\n/g, ' ')
        return text.length > 30 ? `${text.slice(0, 30)}…` : text
      },

      getLastTimestamp: (characterId) => {
        const messages = ensureChat(get().chats, characterId).messages
        return messages[messages.length - 1]?.timestamp ?? null
      },

      setCustomPrompt: (characterId, prompt) => {
        set((state) => ({
          customPrompts: { ...state.customPrompts, [characterId]: prompt },
        }))
      },

      resetCustomPrompt: (characterId) => {
        set((state) => {
          const next = { ...state.customPrompts }
          delete next[characterId]
          return { customPrompts: next }
        })
      },

      getCustomPrompt: (characterId) => get().customPrompts[characterId],
    }),
    {
      name: 'line-chat-storage',
      version: 2,
      migrate: (persistedState, version) => {
        if (version < 2) {
          const data = persistedState as {
            messages?: Message[]
            historyCleared?: boolean
          } | null
          const chats = Object.fromEntries(characters.map((c) => [c.id, emptyChat()]))
          if (data?.messages) {
            chats.xiaomei = {
              messages: data.messages,
              historyCleared: Boolean(data.historyCleared),
            }
          }
          return { chats }
        }
        return persistedState as ChatState
      },
    },
  ),
)
