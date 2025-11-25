import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  input: 'packages/core/src/index.ts',

  output: {
    format: ['esm', 'cjs', 'umd'],
    esm: {
      dir: 'es',
      preserveStructure: true,
    },
    cjs: {
      dir: 'lib',
      preserveStructure: true,
    },
    umd: {
      dir: 'dist',
      name: 'LDesignI18n',
    },
  },

  dts: true,
  sourcemap: true,
  minify: false,
  clean: true,

  external: [
    'vue',
    'react',
    'react-dom',
    /^@ldesign\//,
    /^lodash/,
    /^@vue\//,
  ],
})
