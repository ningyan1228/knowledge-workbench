import { defineConfig } from 'vitest/config'
import { loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const configuredBase = loadEnv(mode, '.', '').VITE_BASE_PATH
  return {
    base: configuredBase || '/',
    plugins: [react()],
    test: {
      environment: 'node',
      include: ['tests/**/*.test.ts'],
    },
  }
})
