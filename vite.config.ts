import adonisjs from '@adonisjs/vite/client'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    adonisjs({
      entryPoints: ['resources/js/index.tsx'],
      reload: ['resources/views/**/*.edge'],
    }),
    react(),
  ],
  server: {
    watch: {
      ignored: ['**/storage/**', '**/tmp/**'],
    },
  },
})
