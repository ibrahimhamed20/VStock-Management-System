import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@features': path.resolve(__dirname, './src/features'),
      '@auth': path.resolve(__dirname, './src/features/auth'),
      '@core': path.resolve(__dirname, './src/features/core'),
      '@common': path.resolve(__dirname, './src/features/common'),
      '@layout': path.resolve(__dirname, './src/features/core/layout'),
    },
  },
})
