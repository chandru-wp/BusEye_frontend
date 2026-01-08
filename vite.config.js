import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  base: '/', // Custom domain uses root path
  plugins: [
    react(), tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['buseye_logo.png'],
      manifest: {
        name: 'BusEye - Real-time Bus Tracker',
        short_name: 'BusEye',
        description: 'Real-time bus tracking application',
        theme_color: '#2563eb',
        background_color: '#ffffff',
        icons: [
          {
            src: 'buseye_logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})
