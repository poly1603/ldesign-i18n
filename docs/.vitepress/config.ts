import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '@ldesign/i18n',
  description: '高性能、现代化的国际化解决方案',
  base: '/i18n/',

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: '指南', link: '/guide/introduction' },
      { text: 'API 参考', link: '/api/core' },
      { text: '示例', link: '/examples/basic' },
      {
        text: '更新日志',
        link: 'https://github.com/your-org/ldesign/blob/master/packages/i18n/CHANGELOG_V3.md'
      }
    ],

    sidebar: {
      '/guide/': [
        {
          text: '开始',
          items: [
            { text: '简介', link: '/guide/introduction' },
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '安装', link: '/guide/installation' }
          ]
        },
        {
          text: '核心概念',
          items: [
            { text: '国际化引擎', link: '/guide/i18n-engine' },
            { text: '消息格式化', link: '/guide/message-formatting' },
            { text: '插值与复数', link: '/guide/interpolation' },
            { text: '缓存机制', link: '/guide/caching' }
          ]
        },
        {
          text: '框架集成',
          items: [
            { text: 'Vue 3 集成', link: '/guide/vue-integration' },
            { text: 'React 集成', link: '/guide/react-integration' },
            { text: '原生 JavaScript', link: '/guide/vanilla-js' }
          ]
        },
        {
          text: '高级特性',
          items: [
            { text: '性能优化', link: '/guide/performance' },
            { text: '插件系统', link: '/guide/plugins' },
            { text: '懒加载', link: '/guide/lazy-loading' },
            { text: '实时同步', link: '/guide/realtime-sync' },
            { text: 'RTL 支持', link: '/guide/rtl-support' }
          ]
        },
        {
          text: '最佳实践',
          items: [
            { text: '项目结构', link: '/guide/project-structure' },
            { text: '类型安全', link: '/guide/type-safety' },
            { text: '性能监控', link: '/guide/monitoring' },
            { text: '测试', link: '/guide/testing' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API 参考',
          items: [
            { text: '核心 API', link: '/api/core' },
            { text: 'I18nEngine', link: '/api/i18n-engine' },
            { text: '格式化器', link: '/api/formatters' },
            { text: '缓存', link: '/api/cache' },
            { text: '插件', link: '/api/plugins' }
          ]
        },
        {
          text: 'Vue 适配器',
          items: [
            { text: '插件', link: '/api/vue-plugin' },
            { text: 'Composables', link: '/api/vue-composables' },
            { text: '组件', link: '/api/vue-components' },
            { text: '指令', link: '/api/vue-directives' }
          ]
        },
        {
          text: '工具函数',
          items: [
            { text: '辅助函数', link: '/api/helpers' },
            { text: '类型定义', link: '/api/types' }
          ]
        }
      ],
      '/examples/': [
        {
          text: '基础示例',
          items: [
            { text: '基本用法', link: '/examples/basic' },
            { text: '消息格式化', link: '/examples/formatting' },
            { text: '复数处理', link: '/examples/pluralization' }
          ]
        },
        {
          text: 'Vue 示例',
          items: [
            { text: 'Vue 基础', link: '/examples/vue-basic' },
            { text: 'Composition API', link: '/examples/vue-composition' },
            { text: '组件示例', link: '/examples/vue-components' },
            { text: '指令示例', link: '/examples/vue-directives' }
          ]
        },
        {
          text: 'React 示例',
          items: [
            { text: 'React 基础', link: '/examples/react-basic' },
            { text: 'Hooks 示例', link: '/examples/react-hooks' },
            { text: 'Context 示例', link: '/examples/react-context' }
          ]
        },
        {
          text: '高级示例',
          items: [
            { text: '懒加载', link: '/examples/lazy-loading' },
            { text: '实时同步', link: '/examples/realtime-sync' },
            { text: '版本控制', link: '/examples/version-control' },
            { text: '性能优化', link: '/examples/performance' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/your-org/ldesign' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025-present ldesign'
    },

    search: {
      provider: 'local'
    },

    editLink: {
      pattern: 'https://github.com/your-org/ldesign/edit/master/packages/i18n/docs/:path',
      text: '在 GitHub 上编辑此页'
    }
  }
})

