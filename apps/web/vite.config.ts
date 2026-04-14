/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig(({ command, mode }) => ({
  base: mode === 'demo' ? '/azure-atlas/' : undefined,
  plugins: [react()],
  server: {
    port: 5173,
    proxy:
      command === 'serve'
        ? {
            '/api/v1': {
              target: process.env.VITE_API_PROXY_TARGET || 'http://localhost:8000',
              changeOrigin: true,
            },
          }
        : undefined,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
}))
