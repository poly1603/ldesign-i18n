import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  resolve: {
    alias: {
      '@ldesign/i18n-core': path.resolve(__dirname, '../core/src'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'es/',
        'lib/',
        'dist/',
        '**/*.spec.ts',
        '**/*.test.ts',
        '**/types.ts',
      ],
    },
  },
})
