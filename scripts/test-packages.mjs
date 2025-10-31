/**
 * 测试包是否可以正常导入和使用
 */

console.log('🧪 测试 @ldesign/i18n 包...\n')

// 测试 Core 包
console.log('1️⃣ 测试 @ldesign/i18n-core...')
try {
  const corePath = '../packages/core/es/index.js'
  const core = await import(corePath)
  console.log('✅ Core 包导入成功')
  console.log('   导出:', Object.keys(core).slice(0, 5).join(', '), '...')
} catch (error) {
  console.error('❌ Core 包导入失败:', error.message)
  process.exit(1)
}

// 测试 React 包
console.log('\n2️⃣ 测试 @ldesign/i18n-react...')
try {
  const reactPath = '../packages/react/es/index.js'
  const react = await import(reactPath)
  console.log('✅ React 包导入成功')
  console.log('   导出:', Object.keys(react).slice(0, 5).join(', '), '...')
} catch (error) {
  console.error('❌ React 包导入失败:', error.message)
  process.exit(1)
}

console.log('\n✨ 所有包测试通过!')
console.log('\n📦 可以使用的包:')
console.log('  - @ldesign/i18n-core ✅')
console.log('  - @ldesign/i18n-react ✅')
