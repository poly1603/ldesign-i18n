/**
 * 批量为所有框架包创建 example 目录和演示项目
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')

// 框架配置
const frameworks = [
  {
    name: 'react',
    displayName: 'React',
    vitePlugin: '@vitejs/plugin-react',
    deps: ['react', 'react-dom'],
    devDeps: ['@types/react', '@types/react-dom', '@vitejs/plugin-react'],
  },
  {
    name: 'vue',
    displayName: 'Vue',
    vitePlugin: '@vitejs/plugin-vue',
    deps: ['vue'],
    devDeps: ['@vitejs/plugin-vue'],
  },
  {
    name: 'solid',
    displayName: 'Solid',
    vitePlugin: 'vite-plugin-solid',
    deps: ['solid-js'],
    devDeps: ['vite-plugin-solid'],
  },
  {
    name: 'svelte',
    displayName: 'Svelte',
    vitePlugin: '@sveltejs/vite-plugin-svelte',
    deps: ['svelte'],
    devDeps: ['@sveltejs/vite-plugin-svelte', 'svelte'],
  },
  {
    name: 'preact',
    displayName: 'Preact',
    vitePlugin: '@preact/preset-vite',
    deps: ['preact'],
    devDeps: ['@preact/preset-vite'],
  },
  {
    name: 'lit',
    displayName: 'Lit',
    vitePlugin: null,
    deps: ['lit'],
    devDeps: [],
  },
]

// 生成 package.json
function generatePackageJson(framework) {
  const packageName = framework.name
  const i18nPackage = `@ldesign/i18n-${packageName}`
  
  const deps = {
    '@ldesign/i18n-core': 'workspace:*',
    [i18nPackage]: 'workspace:*',
  }
  
  framework.deps.forEach(dep => {
    deps[dep] = 'latest'
  })
  
  const devDeps = {
    typescript: '^5.3.0',
    vite: '^5.0.0',
  }
  
  framework.devDeps.forEach(dep => {
    devDeps[dep] = 'latest'
  })
  
  return {
    name: `${packageName}-i18n-example`,
    version: '1.0.0',
    private: true,
    type: 'module',
    scripts: {
      dev: 'vite',
      build: 'vite build',
      preview: 'vite preview',
    },
    dependencies: deps,
    devDependencies: devDeps,
  }
}

// 生成 vite.config.ts
function generateViteConfig(framework) {
  const pluginImport = framework.vitePlugin 
    ? `import ${framework.name}Plugin from '${framework.vitePlugin}'`
    : ''
  const plugins = framework.vitePlugin ? `[${framework.name}Plugin()]` : '[]'

  return `import { defineConfig } from 'vite'
${pluginImport}

export default defineConfig({
  plugins: ${plugins},
  server: {
    port: 3000,
  },
})
`
}

// 生成 index.html
function generateIndexHtml(framework) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${framework.displayName} i18n Example</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.${framework.name === 'svelte' ? 'js' : 'ts'}"></script>
  </body>
</html>
`
}

// 生成 README.md
function generateReadme(framework) {
  return `# ${framework.displayName} Example - @ldesign/i18n

演示如何在 ${framework.displayName} 中使用 @ldesign/i18n-${framework.name}

## 安装

\`\`\`bash
pnpm install
\`\`\`

## 运行

\`\`\`bash
pnpm dev
\`\`\`

访问 http://localhost:3000

## 构建

\`\`\`bash
pnpm build
\`\`\`
`
}

// 创建目录结构
function createExampleStructure(framework) {
  const packagePath = join(rootDir, 'packages', framework.name)
  const examplePath = join(packagePath, 'example')
  const srcPath = join(examplePath, 'src')
  const localesPath = join(srcPath, 'locales')

  // 创建目录
  if (!existsSync(examplePath)) {
    mkdirSync(examplePath, { recursive: true })
  }
  if (!existsSync(srcPath)) {
    mkdirSync(srcPath, { recursive: true })
  }
  if (!existsSync(localesPath)) {
    mkdirSync(localesPath, { recursive: true })
  }

  return { examplePath, srcPath, localesPath }
}

// 生成翻译文件
const enTranslations = {
  welcome: 'Welcome to @ldesign/i18n',
  description: 'A powerful internationalization solution',
  switchLanguage: 'Switch to Chinese',
  counter: 'Count: {{count}}',
  increment: 'Increment',
  decrement: 'Decrement',
}

const zhTranslations = {
  welcome: '欢迎使用 @ldesign/i18n',
  description: '强大的国际化解决方案',
  switchLanguage: '切换到英文',
  counter: '计数: {{count}}',
  increment: '增加',
  decrement: '减少',
}

// 为每个框架创建示例
console.log('🚀 开始创建示例项目...\n')

for (const framework of frameworks) {
  console.log(`📦 创建 ${framework.displayName} 示例...`)
  
  try {
    const { examplePath, srcPath, localesPath } = createExampleStructure(framework)

    // 创建配置文件
    writeFileSync(
      join(examplePath, 'package.json'),
      JSON.stringify(generatePackageJson(framework), null, 2),
    )
    
    writeFileSync(
      join(examplePath, 'vite.config.ts'),
      generateViteConfig(framework),
    )
    
    writeFileSync(
      join(examplePath, 'index.html'),
      generateIndexHtml(framework),
    )
    
    writeFileSync(
      join(examplePath, 'README.md'),
      generateReadme(framework),
    )

    // 创建翻译文件
    writeFileSync(
      join(localesPath, 'en.json'),
      JSON.stringify(enTranslations, null, 2),
    )
    
    writeFileSync(
      join(localesPath, 'zh.json'),
      JSON.stringify(zhTranslations, null, 2),
    )

    // 创建 tsconfig.json
    const tsconfig = {
      compilerOptions: {
        target: 'ES2020',
        module: 'ESNext',
        lib: ['ES2020', 'DOM', 'DOM.Iterable'],
        skipLibCheck: true,
        moduleResolution: 'bundler',
        allowImportingTsExtensions: true,
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
        strict: true,
        jsx: framework.name === 'react' || framework.name === 'preact' ? 'react-jsx' : 'preserve',
      },
      include: ['src'],
    }
    
    writeFileSync(
      join(examplePath, 'tsconfig.json'),
      JSON.stringify(tsconfig, null, 2),
    )

    console.log(`   ✅ ${framework.displayName} 示例创建成功`)
  }
  catch (error) {
    console.error(`   ❌ ${framework.displayName} 创建失败:`, error.message)
  }
}

console.log('\n✨ 基础配置文件创建完成!')
console.log('\n📝 提示: 需要为每个框架创建源代码文件')
console.log('   - App 组件')
console.log('   - main 入口文件')
console.log('   - i18n 配置文件')
