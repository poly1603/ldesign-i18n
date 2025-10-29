import { defineConfig } from '@ldesign/launcher'
import { resolve } from 'path'

export default defineConfig({
  server: {
    port: 5005
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '../src'),
      '@ldesign/i18n-angular': resolve(__dirname, '../../../angular/src'),
      '@ldesign/i18n-core': resolve(__dirname, '../../../core/src')
    }
  }
})

