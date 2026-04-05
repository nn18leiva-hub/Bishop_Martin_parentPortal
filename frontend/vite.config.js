import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': 'http://localhost:3000',
      '/parent': 'http://localhost:3000',
      '/requests': 'http://localhost:3000',
      '/payment': 'http://localhost:3000',
      '/api': 'http://localhost:3000'
    }
  }
})
