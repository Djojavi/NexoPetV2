import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Carga variables VITE_* del .env correspondiente para usarlas en el proxy.
  const env = loadEnv(mode, process.cwd(), '')
  const chatUrl = env.VITE_CHAT_URL || 'http://localhost:3004'

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        // API Gateway (HTTP). El gateway no tiene CORS, por eso proxeamos en dev.
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
        // Socket.IO del chat-service (WebSocket).
        '/socket.io': {
          target: chatUrl,
          changeOrigin: true,
          ws: true,
        },
      },
    },
  }
})
