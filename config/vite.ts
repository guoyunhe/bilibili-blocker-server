import { defineConfig } from '@adonisjs/vite'

export default defineConfig({
  buildDirectory: 'public/assets',
  manifestFile: 'public/assets/.vite/manifest.json',
  assetsUrl: '/assets',
})
