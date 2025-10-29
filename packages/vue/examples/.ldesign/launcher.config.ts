import { defineConfig } from '@ldesign/launcher'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  server: {
    port: 5001
  },
  vitePlugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, '../src'),
      '@ldesign/i18n-vue': resolve(__dirname, '../../../vue/src'),
      '@ldesign/i18n-core': resolve(__dirname, '../../../core/src')
    }
  }
})

