import { defineConfig } from '@ldesign/launcher'
import solid from 'vite-plugin-solid'
import { resolve } from 'path'

export default defineConfig({
  server: {
    port: 5004
  },
  vitePlugins: [solid()],
  resolve: {
    alias: {
      '@': resolve(__dirname, '../src'),
      '@ldesign/i18n-solid': resolve(__dirname, '../../../solid/src'),
      '@ldesign/i18n-core': resolve(__dirname, '../../../core/src')
    }
  }
})

