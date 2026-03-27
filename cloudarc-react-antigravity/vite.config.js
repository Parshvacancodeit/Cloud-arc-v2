import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ─────────────────────────────────────────────────────────────────────────────
// CloudArc Vite Config
// Dev proxy: all /api/* requests automatically forward to Flask on :5000
// No CORS issues needed in development.
// For production: set VITE_API_URL=https://your-deployed-backend.com in .env
// ─────────────────────────────────────────────────────────────────────────────
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5001',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
