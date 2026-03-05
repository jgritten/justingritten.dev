import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

// Extends Vite so path alias and env work the same in tests.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    env: {
      // Predictable base URL in tests (no .env required).
      VITE_API_URL: 'http://localhost:5237',
    },
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.{test,spec}.{ts,tsx}',
        'src/main.tsx',
        'src/vite-env.d.ts',
      ],
    },
  },
})
