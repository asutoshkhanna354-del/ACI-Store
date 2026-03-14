import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  root: 'client',
  plugins: [react()],
  resolve: {
    alias: {
      '@assets': path.resolve(__dirname, 'attached_assets')
    }
  },
  build: {
    outDir: path.resolve(__dirname, 'client/dist'),
    emptyOutDir: true
  }
})
