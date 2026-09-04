import { useNavigate, useLocation } from 'react-router-dom'
import { playSound } from '../utils/sound'
import styles from '../styles/tab-bar.module.css'

export function TabBar() {
  const navigate = useNavigate()
  const location = useLocation()

  const tabs = [
    {
      label: '聊天',
      path: '/',
      icon: (
        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
          <path
            d="M4 5h16v11H8l-4 3V5z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      label: '朋友圈',
      path: '/moments',
      icon: (
        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
          <path
            d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 3a3 3 0 110 6 3 3 0 010-6zm0 14c-2.5 0-4.7-1.3-6-3.2.1-2 4-3.1 6-3.1s5.9 1.1 6 3.1C16.7 17.7 14.5 19 12 19z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
  ]

  return (
    <nav className={styles.tabBar}>
      {tabs.map((tab) => {
        const active = location.pathname === tab.path
        return (
          <button
            key={tab.path}
            type="button"
            className={`${styles.tabItem} ${active ? styles.tabActive : ''}`}
            onClick={() => {
              if (!active) {
                playSound('tap')
                navigate(tab.path)
              }
            }}
          >
            <span className={styles.tabIcon}>{tab.icon}</span>
            <span className={styles.tabLabel}>{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
