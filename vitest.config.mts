import tsConfigPaths from 'vite-tsconfig-paths'
import type { UserConfig } from 'vitest/config'
import { defineConfig } from 'vitest/config'

const THIRTY_SECONDS_IN_MS = 30 * 1000

// TODO Add coverage thresholds
export function makeConfig(override?: Partial<UserConfig['test']>): UserConfig {
  return {
    test: {
      include: ['**/*.e2e-spec.ts', '**/*.spec.ts'],
      hookTimeout: THIRTY_SECONDS_IN_MS,
      globals: true,
      root: './',
      passWithNoTests: true,
      setupFiles: ['./test/setup.ts'],
      ...override,
    },
    plugins: [tsConfigPaths()],
  }
}

export default defineConfig(makeConfig())
