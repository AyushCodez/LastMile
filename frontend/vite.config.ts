import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import commonjs from 'vite-plugin-commonjs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    commonjs({
      filter(id) {
        return id.includes('src/proto/')
      }
    }),
    react()
  ],
})
