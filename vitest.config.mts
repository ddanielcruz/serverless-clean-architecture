import tsConfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

// TODO Add coverage thresholds
export default defineConfig({
  test: {
    include: ['**/*.e2e-spec.ts', '**/*.spec.ts'],
    globals: true,
    root: './',
    passWithNoTests: true,
  },
  plugins: [tsConfigPaths()],
})
