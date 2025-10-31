#!/usr/bin/env node

import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

// Alpine.js 示例配置
const alpineExample = {
  framework: 'alpinejs',
  packageJson: {
    name: '@ldesign/i18n-alpinejs-example',
    version: '1.0.0',
    private: true,
    type: 'module',
    scripts: {
      dev: 'vite',
      build: 'vite build',
      preview: 'vite preview',
    },
    dependencies: {
      '@ldesign/i18n-alpinejs': 'workspace:*',
      '@ldesign/i18n-core': 'workspace:*',
      'alpinejs': '^3.13.0',
    },
    devDependencies: {
      typescript: '^5.0.0',
      vite: '^5.0.0',
    },
  },
  indexHtml: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Alpine.js i18n Example</title>
  </head>
  <body>
    <div x-data="app" style="padding: 2rem; font-family: system-ui, sans-serif;">
      <h1 x-text="t('welcome')"></h1>
      <p x-text="t('description')"></p>
      
      <div style="margin-top: 2rem;">
        <button @click="toggleLanguage()" x-text="t('switchLanguage')"></button>
        <span style="margin-left: 1rem;">Current: <span x-text="locale"></span></span>
      </div>

      <div style="margin-top: 2rem;">
        <h2><span x-text="t('counter')"></span>: <span x-text="count"></span></h2>
        <button @click="count++" x-text="t('increment')"></button>
        <button @click="count--" style="margin-left: 1rem;" x-text="t('decrement')"></button>
      </div>
    </div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>`,
  mainTs: `import Alpine from 'alpinejs'
import { createI18n } from '@ldesign/i18n-alpinejs'
import en from './locales/en.json'
import zh from './locales/zh.json'

const i18n = createI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages: { en, zh },
})

Alpine.data('app', () => ({
  count: 0,
  locale: i18n.locale,
  t(key: string) {
    return i18n.t(key)
  },
  toggleLanguage() {
    const newLocale = this.locale === 'en' ? 'zh' : 'en'
    i18n.setLocale(newLocale)
    this.locale = newLocale
  }
}))

Alpine.start()`,
}

// Remix 示例配置
const remixExample = {
  framework: 'remix',
  packageJson: {
    name: '@ldesign/i18n-remix-example',
    version: '1.0.0',
    private: true,
    type: 'module',
    scripts: {
      dev: 'remix vite:dev',
      build: 'remix vite:build',
      preview: 'remix-serve build/server/index.js',
    },
    dependencies: {
      '@ldesign/i18n-remix': 'workspace:*',
      '@ldesign/i18n-core': 'workspace:*',
      '@remix-run/node': '^2.0.0',
      '@remix-run/react': '^2.0.0',
      '@remix-run/serve': '^2.0.0',
      react: '^18.0.0',
      'react-dom': '^18.0.0',
    },
    devDependencies: {
      '@remix-run/dev': '^2.0.0',
      '@types/react': '^18.0.0',
      '@types/react-dom': '^18.0.0',
      typescript: '^5.0.0',
      vite: '^5.0.0',
    },
  },
}

function createExampleStructure(config) {
  const baseDir = resolve(`packages/${config.framework}/example`)
  
  console.log(`📦 Creating ${config.framework} example...`)
  
  try {
    // Create directories
    mkdirSync(`${baseDir}/src/locales`, { recursive: true })
    
    // Write package.json
    writeFileSync(
      `${baseDir}/package.json`,
      JSON.stringify(config.packageJson, null, 2)
    )
    
    // Write index.html if exists
    if (config.indexHtml) {
      writeFileSync(`${baseDir}/index.html`, config.indexHtml)
    }
    
    // Write main.ts if exists
    if (config.mainTs) {
      writeFileSync(`${baseDir}/src/main.ts`, config.mainTs)
    }
    
    // Write locale files
    const locales = {
      en: {
        welcome: `Welcome to ${config.framework} i18n`,
        description: `This is a demo of @ldesign/i18n-${config.framework}`,
        switchLanguage: 'Switch Language',
        counter: 'Counter',
        increment: 'Increment',
        decrement: 'Decrement',
      },
      zh: {
        welcome: `欢迎使用 ${config.framework} i18n`,
        description: `这是 @ldesign/i18n-${config.framework} 的演示`,
        switchLanguage: '切换语言',
        counter: '计数器',
        increment: '增加',
        decrement: '减少',
      },
    }
    
    writeFileSync(
      `${baseDir}/src/locales/en.json`,
      JSON.stringify(locales.en, null, 2)
    )
    writeFileSync(
      `${baseDir}/src/locales/zh.json`,
      JSON.stringify(locales.zh, null, 2)
    )
    
    // Write vite.config.ts
    writeFileSync(
      `${baseDir}/vite.config.ts`,
      `import { defineConfig } from 'vite'

export default defineConfig({
  // Vite configuration
})
`
    )
    
    // Write tsconfig.json
    writeFileSync(
      `${baseDir}/tsconfig.json`,
      JSON.stringify({
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
        },
        include: ['src'],
      }, null, 2)
    )
    
    // Write README
    writeFileSync(
      `${baseDir}/README.md`,
      `# ${config.framework} i18n Example

This is a demo project for \`@ldesign/i18n-${config.framework}\`.

## Usage

\`\`\`bash
pnpm install
pnpm dev
\`\`\`
`
    )
    
    console.log(`  ✅ ${config.framework} example created`)
  } catch (error) {
    console.log(`  ❌ ${config.framework} failed: ${error.message}`)
  }
}

// Create examples
console.log('🚀 Creating remaining examples...\n')
createExampleStructure(alpineExample)
// createExampleStructure(remixExample) // Uncomment when ready

console.log('\n✨ Done!')
