export default {
  app: {
    title: '@ldesign/i18n 演示',
    subtitle: '高性能、现代化的国际化解决方案',
    nav: { core: 'Core (原生 JS)', engine: 'Engine Vue 模式', vue: '原生 Vue 模式' },
    footer: '由 @ldesign/i18n 提供支持',
  },

  common: {
    language: '语言',
    switchLanguage: '切换语言',
    currentLocale: '当前语言：{{locale}}',
    confirm: '确认',
    cancel: '取消',
    save: '保存',
    delete: '删除',
    edit: '编辑',
    loading: '加载中...',
    noData: '暂无数据',
    success: '操作成功',
    error: '操作失败',
    reset: '重置',
    submit: '提交',
  },

  demo: {
    basic: {
      title: '基础翻译',
      description: '使用 t() 函数进行基础翻译',
      hello: '你好，世界！',
      welcome: '欢迎来到 LDesign I18n',
      greeting: '你好，{{name}}！',
      greetingWithRole: '{{name}} ({{role}})，欢迎回来',
    },
    interpolation: {
      title: '变量插值',
      description: '使用 {{variable}} 语法进行变量插值',
      message: '{{user}} 在 {{time}} 发送了一条消息',
      nested: '订单 #{{orderId}} 包含 {{count}} 件商品，总计 {{total}}',
      withHtml: '请访问 <a href="{{url}}">这里</a> 了解更多',
    },
    plural: {
      title: '复数化',
      description: '使用 tc() / plural() 处理复数形式',
      item: '0:没有项目|other:{{count}} 个项目',
      apple: '0:没有苹果|other:{{count}} 个苹果',
      message: '0:没有消息|other:{{count}} 条新消息',
      file: '0:没有文件|other:{{count}} 个文件',
    },
    dateTime: {
      title: '日期和时间格式化',
      description: '使用 date() / d() 函数格式化日期',
      now: '当前时间',
      today: '今天',
    },
    number: {
      title: '数字和货币格式化',
      description: '使用 number() / currency() / n() 函数格式化',
      price: '价格',
      quantity: '数量',
      total: '总计',
      percentage: '百分比',
      compact: '紧凑格式',
      fileSize: '文件大小',
    },
    directive: {
      title: 'v-t 指令',
      description: '使用 v-t 指令设置元素文本内容',
      simpleText: '这是通过 v-t 指令翻译的文本',
      withParams: '你好，{{name}}！今天是 {{day}}',
    },
    htmlDirective: {
      title: 'v-t-html 指令',
      description: '使用 v-t-html 指令设置 HTML 内容（支持富文本）',
      richText: '这是<b>加粗</b>和<em>斜体</em>的文本',
      withLink: '访问 <a href="https://github.com" target="_blank">GitHub</a> 获取更多信息',
    },
    pluralDirective: {
      title: 'v-t-plural 指令',
      description: '使用 v-t-plural 指令进行复数化翻译',
    },
    tooltipDirective: {
      title: 'v-t-tooltip 指令',
      description: '显示翻译文本，悬停时显示翻译键（调试用）',
      hoverMe: '鼠标悬停查看翻译键信息',
    },
    component: {
      title: '翻译组件',
      description: '使用 I18nText / I18nTranslate 组件进行翻译',
      textExample: '这是通过 I18nText 组件渲染的',
      translateExample: '这是通过 I18nTranslate 组件渲染的',
    },
    provider: {
      title: 'I18nProvider 组件',
      description: '为子组件提供独立的 i18n 实例上下文',
    },
    scope: {
      title: '作用域翻译 (useI18nScope)',
      description: '使用 useI18nScope 进行命名空间化翻译',
    },
    format: {
      title: '格式化工具 (useI18nFormat)',
      description: '数字、货币、百分比、日期、相对时间、列表、文件大小等格式化',
    },
    validation: {
      title: '表单验证 (useI18nValidation)',
      description: '内置常用验证规则，错误消息自动国际化',
      enterEmail: '请输入邮箱地址',
      enterName: '请输入姓名',
      enterAge: '请输入年龄',
    },
    meta: {
      title: 'SEO 元数据 (useI18nMeta)',
      description: '自动管理页面 title、description、OG 标签',
      pageTitle: 'I18n Playground - 国际化演示',
      pageDescription: '展示 @ldesign/i18n 多语言功能的完整演示页面',
    },
    route: {
      title: '路由国际化 (useI18nRoute)',
      description: '为路由路径添加语言前缀，支持多种策略',
    },
    async: {
      title: '异步加载 (useI18nAsync)',
      description: '按需异步加载语言包，支持加载状态和错误处理',
    },
    performance: {
      title: '性能监控 (useI18nPerformance)',
      description: '监控翻译性能、缓存命中率、内存使用',
    },
    core: {
      title: 'Core 用法（框架无关）',
      subtitle: '@ldesign/i18n-core 可在任何 JS/TS 环境中使用，不依赖 Vue',
    },
    dateDirective: {
      title: 'v-t-date 日期格式化指令',
      description: '在模板中直接格式化日期，自动跟随语言切换',
    },
    numberDirective: {
      title: 'v-t-number 数字格式化指令',
      description: '在模板中直接格式化数字、货币、百分比，自动跟随语言切换',
    },
    numberComponent: {
      title: 'I18nNumber 数字格式化组件',
      description: '声明式数字格式化，支持普通数字、货币、百分比、紧凑格式',
    },
    datetimeComponent: {
      title: 'I18nDatetime 日期格式化组件',
      description: '声明式日期格式化，支持日期、时间、日期时间、相对时间',
    },
    missingKeys: {
      title: '缺失翻译键检测 (useI18nMissingKeys)',
      description: '开发调试工具，实时收集缺失的翻译键，帮助发现遗漏',
      triggerMissing: '触发缺失键',
      clearAll: '清除所有',
      noMissing: '暂无缺失的翻译键',
      total: '共 {{count}} 个缺失键',
    },
    // CoreDemo 专用
    formatting: {
      description: 'date() / number() / currency() / relativeTime() — 基于 Intl API，自动跟随 locale',
    },
    exists: {
      description: '检查翻译键是否存在，避免显示 fallback 键名',
    },
    localeManagement: {
      title: 'getAvailableLocales() / setLocale()',
      description: '获取可用语言列表，动态切换语言',
    },
    dynamicMessages: {
      title: 'mergeMessages() / addLocale()',
      description: '运行时动态合并或添加翻译消息',
      mergeButton: '合并到 {{locale}}',
      mergeSuccess: '✓ 合并成功！',
      invalidJSON: '✗ 无效的 JSON',
    },
    events: {
      title: "on('localeChanged') / on('missingKey')",
      description: '监听语言变化和缺失翻译键事件',
      triggerMissing: '触发缺失键',
      noEvents: '暂无事件。尝试切换语言或触发缺失键。',
    },
    enginePlugin: {
      title: 'Engine 插件 & 持久化配置',
      description: '通过 createI18nEnginePlugin 创建 Engine 插件，支持自动持久化和回调',
    },
    translationExists: {
      title: 'te() — 翻译键检测',
      description: '检查翻译键是否存在',
      descriptionConditional: '检查翻译键是否存在，用于条件渲染',
      exists: '✓ 存在',
      missing: '✗ 缺失',
    },
    validationStatus: {
      valid: '✓ 有效',
    },
    // VueDemo 专用
    compositionApi: {
      title: 'useI18n() — Composition API',
      description: '完整的组合式 API，提供翻译、复数、日期、数字格式化、消息管理等功能',
    },
    useLocale: {
      title: 'useLocale()',
      description: '语言管理 composable，提供语言状态和切换功能',
    },
    useTranslation: {
      title: 'useTranslation(namespace)',
      description: '简化的翻译 hook，内置命名空间（类似 react-i18next 的 useTranslation）',
    },
    useI18nScope: {
      title: 'useI18nScope(scope)',
      description: '组件级别作用域翻译，支持 gt() 全局回退',
    },
    dynamicTranslation: {
      title: '动态翻译',
      description: '输入翻译键并实时获取翻译结果',
      placeholder: '请输入翻译键...',
      translateButton: '翻译',
    },
    mergeLocaleMessage: {
      title: 'mergeLocaleMessage()',
      description: '运行时动态合并新的翻译消息到当前语言（不会覆盖已有键）',
    },
    setLocaleMessage: {
      title: 'setLocaleMessage() / getLocaleMessage()',
      description: '替换指定语言的整个消息对象，或获取当前消息进行修改',
      replacePath: '替换路径：{{path}}',
      replaceButton: '替换',
      replaceSuccess: '✓ 替换成功！查看下方 aboutScope。',
      error: '✗ 错误',
    },
    globalProperties: {
      title: '$t / $i18n 全局属性',
      description: '在模板中直接使用 $t 全局属性（Options API / 模板直接使用）',
    },
  },

  pages: {
    home: {
      title: '首页',
      description: '这是首页的描述',
      welcome: '欢迎回来，{{name}}！',
    },
    settings: {
      title: '设置',
      description: '管理您的偏好设置',
      theme: '主题',
      language: '语言',
      notifications: '通知',
    },
    about: {
      title: '关于',
      description: '了解更多信息',
      version: '版本 {{version}}',
    },
  },

  validation: {
    required: '此字段为必填项',
    email: '请输入有效的邮箱地址',
    min: '值不能小于 {{min}}',
    max: '值不能大于 {{max}}',
    minLength: '长度不能少于 {{length}} 个字符',
    maxLength: '长度不能超过 {{length}} 个字符',
    numeric: '请输入数字',
    url: '请输入有效的 URL',
    phone: '请输入有效的电话号码',
    pattern: '格式不正确',
  },

  mode: {
    core: {
      title: 'Core (原生 JS)',
      description: '纯 @ldesign/i18n-core，可在 Node.js、浏览器、Web Worker 等任何 JS 环境中使用',
    },
    engine: {
      title: 'Engine Vue 模式',
      description: '通过 @ldesign/engine-vue3 的 VueEngine 驱动，使用 createI18nEnginePlugin 集成',
      features: [
        '自动集成到 Engine 生命周期',
        '持久化语言偏好到 localStorage',
        '通过 Engine 事件系统广播语言变化',
        'Engine 状态管理集成',
        '支持 onReady / onLocaleChange 回调',
      ],
    },
    vue: {
      title: '原生 Vue 模式',
      description: '直接使用 createI18nPlugin 安装到 Vue 应用，无需 Engine',
      features: [
        '轻量级，无 Engine 依赖',
        '通过 app.use() 安装',
        '提供 $t / $i18n 全局属性',
        '支持所有 composables',
        '适合独立 Vue 项目',
      ],
    },
  },
}
