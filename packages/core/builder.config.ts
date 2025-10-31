import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  input: 'src/index.ts',
  output: {
    esm: {
      enabled: true,
      dir: 'es',
    },
    cjs: {
      enabled: true,
      dir: 'lib',
    },
    umd: {
      enabled: false, // 禁用 UMD 构建
    },
  },
  // 生成类型声明文件
  dts: {
    enabled: true,
  },
  // 外部依赖
  external: [
    '@ldesign/shared',
    'tslib',
  ],
})
