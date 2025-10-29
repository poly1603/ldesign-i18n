import { defineConfig } from '@ldesign/launcher'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { resolve } from 'path'

export default defineConfig({
  server: {
    port: 5003
  },
  vitePlugins: [svelte()],
  resolve: {
    alias: {
      '@': resolve(__dirname, '../src'),
      '@ldesign/i18n-svelte': resolve(__dirname, '../../../svelte/src'),
      '@ldesign/i18n-core': resolve(__dirname, '../../../core/src')
    }
  }
})

