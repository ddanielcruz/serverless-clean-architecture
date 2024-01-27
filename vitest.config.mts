import tsConfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['**/*.e2e-spec.ts', '**/*.spec.ts'],
    globals: true,
    root: './',
    passWithNoTests: true,
  },
  plugins: [tsConfigPaths()],
})
