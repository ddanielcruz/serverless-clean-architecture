import tsConfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['**/*.spec.ts'],
    globals: true,
    root: './',
    passWithNoTests: true,
    setupFiles: ['./test/setup.ts'],
  },
  plugins: [tsConfigPaths()],
})
