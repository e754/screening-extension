import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        // Your popup (default UI)
        popup: resolve(__dirname, 'index.html'),
        // Your content script
        content: resolve(__dirname, 'src/content.js'),
      },
      output: {
        // Prevents hashed filenames
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]'
      }
    },
    outDir: 'dist',
    emptyOutDir: true
  },
  define: {
    'process.env': process.env
  }
})
