import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  base: '/my-chat-app/',
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
  },
})
