import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/login': {
        target: 'http://127.0.0.1:8002',
        changeOrigin: true,
      },
      '/api/logout': {
        target: 'http://127.0.0.1:8002',
        changeOrigin: true,
      },
      '/api/dashboard': {
        target: 'http://127.0.0.1:8002',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://127.0.0.1:8002',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
