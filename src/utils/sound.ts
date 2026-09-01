type SoundName = 'tap' | 'send' | 'receive'

const SOUND_FILES: Record<SoundName, string> = {
  tap: `${import.meta.env.BASE_URL}tap.mp3`,
  send: `${import.meta.env.BASE_URL}send.mp3`,
  receive: `${import.meta.env.BASE_URL}receive.mp3`,
}

class SoundManager {
  private cache = new Map<SoundName, HTMLAudioElement>()

  constructor() {
    if (typeof window === 'undefined') return

    const unlock = () => {
      // 预加载并解锁移动端音频策略
      for (const name of Object.keys(SOUND_FILES) as SoundName[]) {
        const audio = this.getAudio(name)
        audio.muted = true
        void audio
          .play()
          .then(() => {
            audio.pause()
            audio.currentTime = 0
            audio.muted = false
          })
          .catch(() => {
            audio.muted = false
          })
      }
      window.removeEventListener('touchstart', unlock)
      window.removeEventListener('click', unlock)
    }

    window.addEventListener('touchstart', unlock, { passive: true })
    window.addEventListener('click', unlock)
  }

  private getAudio(name: SoundName): HTMLAudioElement {
    let audio = this.cache.get(name)
    if (!audio) {
      audio = new Audio(SOUND_FILES[name])
      audio.preload = 'auto'
      this.cache.set(name, audio)
    }
    return audio
  }

  play(name: SoundName) {
    const base = this.getAudio(name)
    // clone 以便短间隔连点也能重叠播放
    const audio = base.cloneNode(true) as HTMLAudioElement
    audio.currentTime = 0
    void audio.play().catch(() => {
      // 未解锁或浏览器拦截时静默失败
    })
  }
}

export const soundManager = new SoundManager()

export function playSound(name: SoundName) {
  soundManager.play(name)
}
