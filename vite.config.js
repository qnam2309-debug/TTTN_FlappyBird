import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5500,
    strictPort: true,
    // Chuyển mọi request /api sang backend (Express chạy ở cổng 3000)
    proxy: { '/api': 'http://localhost:3000' },
  },
})
