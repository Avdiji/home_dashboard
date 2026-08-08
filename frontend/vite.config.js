import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dev proxy: /api and /ws forward to the Go backend on :8080 so the frontend
// uses same-origin (relative) URLs. This lets a device on the LAN (e.g. a phone
// hitting http://<desktop-ip>:5173) reach the backend through the Vite server
// instead of a hardcoded `localhost`, which on the phone would point at the
// phone itself.
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      '/api': { target: 'http://localhost:8080', changeOrigin: true },
      '/ws': { target: 'ws://localhost:8080', ws: true, changeOrigin: true },
    },
  },
})