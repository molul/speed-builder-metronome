import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import Components from 'unplugin-vue-components/vite'
import { PrimeVueResolver } from '@primevue/auto-import-resolver'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    Components({
      resolvers: [PrimeVueResolver()]
    }),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        // ... include your manifest settings here
      }
    })
  ],
  resolve: {
    alias: {
      // This tells Vite that @assets means src/assets
      '@assets': path.resolve(__dirname, './src/assets'),
      '@': path.resolve(__dirname, './src')
    }
  }
})
