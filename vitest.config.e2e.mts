import { defineConfig } from 'vitest/config'

import { makeConfig } from './vitest.config.mts'

export default defineConfig(
  makeConfig({
    include: ['**/*.e2e-spec.ts'],
  }),
)
