import { defineConfig } from 'vitest/config'
import { loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import publicLeadDataPlugin from './scripts/public-lead-data-plugin.mjs'

export default defineConfig(({ mode }) => {
  const configuredBase = loadEnv(mode, '.', '').VITE_BASE_PATH
  return {
    base: configuredBase || '/',
    plugins: [react(), publicLeadDataPlugin()],
    test: {
      environment: 'node',
      include: ['tests/**/*.test.ts'],
    },
  }
})
