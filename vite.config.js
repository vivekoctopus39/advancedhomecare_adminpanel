import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Website runs on 5173; the admin panel uses 5174 (allowed in backend CORS_ORIGINS).
  server: { port: 5174 },
  preview: { port: 4174 },
})
