import { defineConfig } from 'vite'
import preactPlugin from '@preact/preset-vite'

export default defineConfig({
  plugins: [preactPlugin()],
  server: {
    port: 3000,
  },
})
