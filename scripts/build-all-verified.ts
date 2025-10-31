/**
 * 批量构建并验证所有包
 */
import { execSync } from 'node:child_process'
import { join } from 'node:path'
import { existsSync } from 'node:fs'

const packages = [
  'core', // 先构建 core,其他包依赖它
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

const results: Array<{ package: string, status: 'success' | 'failed', error?: string }> = []

console.log('🚀 开始构建所有包...\n')

for (const pkg of packages) {
  const pkgPath = join(process.cwd(), 'packages', pkg)
  
  if (!existsSync(pkgPath)) {
    console.log(`⚠️  跳过: ${pkg} (目录不存在)`)
    results.push({ package: pkg, status: 'failed', error: '目录不存在' })
    continue
  }
  
  console.log(`📦 正在构建: ${pkg}...`)
  
  try {
    execSync('pnpm run build', {
      cwd: pkgPath,
      stdio: 'pipe',
      encoding: 'utf-8',
    })
    console.log(`✅ 成功: ${pkg}\n`)
    results.push({ package: pkg, status: 'success' })
  }
  catch (error: any) {
    console.error(`❌ 失败: ${pkg}`)
    console.error(`   错误: ${error.message}\n`)
    results.push({ package: pkg, status: 'failed', error: error.message })
  }
}

// 输出总结
console.log('\n' + '='.repeat(60))
console.log('📊 构建结果总结')
console.log('='.repeat(60))

const successCount = results.filter(r => r.status === 'success').length
const failedCount = results.filter(r => r.status === 'failed').length

console.log(`\n✅ 成功: ${successCount}/${packages.length}`)
console.log(`❌ 失败: ${failedCount}/${packages.length}`)

if (failedCount > 0) {
  console.log('\n❌ 失败的包:')
  results
    .filter(r => r.status === 'failed')
    .forEach(r => console.log(`   - ${r.package}: ${r.error || '未知错误'}`))
  process.exit(1)
}
else {
  console.log('\n🎉 所有包构建成功!')
  process.exit(0)
}
