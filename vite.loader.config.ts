import { defineConfig } from 'vite'
import { resolve } from 'path'

// The embed loader customers paste on their site. Built after the app bundle
// (see the `build` script), into the same dist/ without clearing it.
export default defineConfig({
  publicDir: false,
  build: {
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'src/loader.ts'),
      name: 'AlapaiWidgetLoader',
      fileName: () => 'widget-loader.js',
      formats: ['iife'],
    },
  },
})
