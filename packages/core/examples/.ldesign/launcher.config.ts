import { defineConfig } from '@ldesign/launcher'
import { resolve } from 'path'

export default defineConfig({
  server: {
    port: 5000
  },
  resolve: {
    alias: {
      '@ldesign/i18n-core': resolve(__dirname, '../../src/index.ts')
    }
  }
})

