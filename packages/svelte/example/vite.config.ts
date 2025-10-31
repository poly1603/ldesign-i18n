import { defineConfig } from 'vite'
import sveltePlugin from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  plugins: [sveltePlugin()],
  server: {
    port: 3000,
  },
})
