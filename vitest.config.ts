import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['__tests__/setup.ts'],
    include: ['__tests__/**/*.{test,spec}.{js,ts}'],
    exclude: ['node_modules', 'dist', 'esm', 'cjs', 'types'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '__tests__/',
        'dist/',
        'esm/',
        'cjs/',
        'types/',
        '**/*.d.ts',
      ],
    },
  },
})
