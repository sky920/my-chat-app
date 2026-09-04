import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Moment {
  id: string
  characterId: string
  content: string
  timestamp: number
}

interface MomentsState {
  /** 所有朋友圈动态，按时间倒序排列 */
  moments: Moment[]
  /** 每个角色最近一次发朋友圈的时间戳，用于冷却判断 */
  lastPostTime: Record<string, number>
  /** 冷却时间（毫秒），默认 30 分钟 */
  cooldownMs: number

  /** 添加一条朋友圈 */
  addMoment: (characterId: string, content: string) => void
  /** 判断某角色是否可以发朋友圈（冷却已过） */
  canPost: (characterId: string) => boolean
  /** 获取所有朋友圈，按时间倒序 */
  getAllMoments: () => Moment[]
  /** 获取某角色的朋友圈 */
  getMomentsByCharacter: (characterId: string) => Moment[]
}

export const useMomentsStore = create<MomentsState>()(
  persist(
    (set, get) => ({
      moments: [],
      lastPostTime: {},
      cooldownMs: 30 * 60 * 1000, // 30 分钟

      addMoment: (characterId, content) => {
        const moment: Moment = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          characterId,
          content,
          timestamp: Date.now(),
        }
        set((state) => ({
          moments: [moment, ...state.moments],
          lastPostTime: { ...state.lastPostTime, [characterId]: moment.timestamp },
        }))
      },

      canPost: (characterId) => {
        const last = get().lastPostTime[characterId]
        if (!last) return true
        return Date.now() - last >= get().cooldownMs
      },

      getAllMoments: () => get().moments,

      getMomentsByCharacter: (characterId) =>
        get().moments.filter((m) => m.characterId === characterId),
    }),
    { name: 'moments-storage' },
  ),
)
