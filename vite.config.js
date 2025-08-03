import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { visualizer } from 'rollup-plugin-visualizer'

const shouldAnalyze = process.env.ANALYZE === 'true'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'OpenRoll',
        short_name: 'OpenRoll',
        theme_color: '#ffff00',
        background_color: '#000000',
        display: 'standalone',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    }),
    shouldAnalyze && visualizer({
      open: true, // automatically open report in browser
      gzipSize: true,
      brotliSize: true,
      filename: 'stats.html'
    })
  ].filter(Boolean),
  test: {
    environment: 'jsdom',
    globals: true
  },
  build: {
    rollupOptions: {
      treeshake: true,
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@dice-roller/rpg-dice-roller')) {
              return 'chunk-dice-roller'
            }
            if (id.includes('react-dom')) {
              return 'chunk-react-dom'
            }
            return 'vendor'
          }
        }
      }
    }
  }
})
