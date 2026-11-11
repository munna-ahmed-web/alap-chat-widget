import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.tsx'),
      name: 'AlapaiWidget',
      // v2: the old loader (cached on customers' pages) keeps loading
      // widget-app.js, which must stay the old bundle until it ages out.
      fileName: () => 'widget-app-v2.js',
      formats: ['iife'],
    },
    rollupOptions: {
      output: {
        extend: true,
      }
    }
  },
  define: {
    'process.env.NODE_ENV': '"production"'
  }
})
