import { defineConfig } from '@ldesign/launcher'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  server: {
    port: 5002
  },
  vitePlugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, '../src'),
      '@ldesign/i18n-react': resolve(__dirname, '../../../react/src'),
      '@ldesign/i18n-core': resolve(__dirname, '../../../core/src')
    }
  }
})

