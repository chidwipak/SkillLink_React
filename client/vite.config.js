import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    'global': 'globalThis',
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5005',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5005',
        changeOrigin: true,
      },
      '/images': {
        target: 'http://localhost:5005',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:5005',
        changeOrigin: true,
        ws: true,
      },
    },
  },
})
