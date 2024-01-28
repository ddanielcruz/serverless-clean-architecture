import tsConfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

// TODO Add coverage thresholds
// TODO Make config from a function to be reused
export default defineConfig({
  test: {
    include: ['**/*.e2e-spec.ts', '**/*.spec.ts'],
    globals: true,
    root: './',
    passWithNoTests: true,
    setupFiles: ['./test/setup.ts'],
  },
  plugins: [tsConfigPaths()],
})
