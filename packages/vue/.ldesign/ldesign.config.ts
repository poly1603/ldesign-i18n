import { defineConfig } from '@ldesign/builder'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  input: 'src/index.ts',

  output: {
    format: ['esm', 'cjs'],
    esm: {
      dir: 'es',
      preserveStructure: true,
    },
    cjs: {
      dir: 'lib',
      preserveStructure: true,
    },
  },

  dts: true,
  sourcemap: true,
  minify: false,
  clean: true,

  vitePlugins: [vue()],

  external: [
    'vue',
    '@vue/runtime-core',
    /^@ldesign\//,
    /^lodash/,
  ],
})

