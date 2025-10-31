/**
 * 批量为所有框架包创建 builder 配置
 */
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'

const packages = [
  'alpinejs',
  'angular',
  'astro',
  'lit',
  'nextjs',
  'nuxtjs',
  'preact',
  'qwik',
  'react',
  'remix',
  'solid',
  'svelte',
  'sveltekit',
  'vue',
]

const builderConfigTemplate = `import { defineConfig } from '@ldesign/builder'

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
    '@ldesign/i18n-core',
    '@ldesign/shared',
    'tslib',
  ],
})
`

for (const pkg of packages) {
  const configPath = join(process.cwd(), 'packages', pkg, 'builder.config.ts')
  
  try {
    writeFileSync(configPath, builderConfigTemplate, 'utf-8')
    console.log(`✅ 已创建: ${pkg}/builder.config.ts`)
  }
  catch (error) {
    console.error(`❌ 创建失败 ${pkg}:`, error)
  }
}

console.log(`\n✨ 完成!共创建 ${packages.length} 个配置文件`)
