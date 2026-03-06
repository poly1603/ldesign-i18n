export default {
  app: {
    title: '@ldesign/i18n Demo',
    subtitle: 'High-performance, modern internationalization solution',
    nav: { core: 'Core (Vanilla JS)', engine: 'Engine Vue Mode', vue: 'Native Vue Mode' },
    footer: 'Powered by @ldesign/i18n',
  },

  common: {
    language: 'Language',
    switchLanguage: 'Switch Language',
    currentLocale: 'Current locale: {{locale}}',
    confirm: 'Confirm',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    loading: 'Loading...',
    noData: 'No data',
    success: 'Success',
    error: 'Error',
    reset: 'Reset',
    submit: 'Submit',
  },

  demo: {
    basic: {
      title: 'Basic Translation',
      description: 'Use t() function for basic translation',
      hello: 'Hello, World!',
      welcome: 'Welcome to LDesign I18n',
      greeting: 'Hello, {{name}}!',
      greetingWithRole: 'Welcome back, {{name}} ({{role}})',
    },
    interpolation: {
      title: 'Variable Interpolation',
      description: 'Use {{variable}} syntax for interpolation',
      message: '{{user}} sent a message at {{time}}',
      nested: 'Order #{{orderId}} contains {{count}} items, total {{total}}',
      withHtml: 'Visit <a href="{{url}}">here</a> for more info',
    },
    plural: {
      title: 'Pluralization',
      description: 'Use tc() / plural() for plural forms',
      item: '0:No items|one:{{count}} item|other:{{count}} items',
      apple: '0:No apples|one:{{count}} apple|other:{{count}} apples',
      message: '0:No messages|one:{{count}} new message|other:{{count}} new messages',
      file: '0:No files|one:{{count}} file|other:{{count}} files',
    },
    dateTime: {
      title: 'Date & Time Formatting',
      description: 'Use date() / d() for date formatting',
      now: 'Current time',
      today: 'Today',
    },
    number: {
      title: 'Number & Currency Formatting',
      description: 'Use number() / currency() / n() for formatting',
      price: 'Price',
      quantity: 'Quantity',
      total: 'Total',
      percentage: 'Percentage',
      compact: 'Compact format',
      fileSize: 'File size',
    },
    directive: {
      title: 'v-t Directive',
      description: 'Use v-t directive to set element text content',
      simpleText: 'This text is translated via v-t directive',
      withParams: 'Hello, {{name}}! Today is {{day}}',
    },
    htmlDirective: {
      title: 'v-t-html Directive',
      description: 'Use v-t-html to set HTML content (supports rich text)',
      richText: 'This is <b>bold</b> and <em>italic</em> text',
      withLink: 'Visit <a href="https://github.com" target="_blank">GitHub</a> for more info',
    },
    pluralDirective: {
      title: 'v-t-plural Directive',
      description: 'Use v-t-plural directive for pluralized translation',
    },
    tooltipDirective: {
      title: 'v-t-tooltip Directive',
      description: 'Show translated text, hover to see translation key (debug)',
      hoverMe: 'Hover to see translation key info',
    },
    component: {
      title: 'Translation Components',
      description: 'Use I18nText / I18nTranslate components',
      textExample: 'This is rendered via I18nText component',
      translateExample: 'This is rendered via I18nTranslate component',
    },
    provider: {
      title: 'I18nProvider Component',
      description: 'Provide independent i18n instance context for children',
    },
    scope: {
      title: 'Scoped Translation (useI18nScope)',
      description: 'Use useI18nScope for namespaced translation',
    },
    format: {
      title: 'Format Utilities (useI18nFormat)',
      description: 'Number, currency, percent, date, relative time, list, file size formatting',
    },
    validation: {
      title: 'Form Validation (useI18nValidation)',
      description: 'Built-in validation rules with auto i18n error messages',
      enterEmail: 'Enter email address',
      enterName: 'Enter name',
      enterAge: 'Enter age',
    },
    meta: {
      title: 'SEO Metadata (useI18nMeta)',
      description: 'Auto-manage page title, description, and OG tags',
      pageTitle: 'I18n Playground - Internationalization Demo',
      pageDescription: 'A comprehensive demo showcasing @ldesign/i18n features',
    },
    route: {
      title: 'Route i18n (useI18nRoute)',
      description: 'Add locale prefix to route paths with multiple strategies',
    },
    async: {
      title: 'Async Loading (useI18nAsync)',
      description: 'Load language packs on demand with loading state and error handling',
    },
    performance: {
      title: 'Performance Monitor (useI18nPerformance)',
      description: 'Monitor translation performance, cache hit rate, and memory usage',
    },
    core: {
      title: 'Core Usage (Framework-agnostic)',
      subtitle: '@ldesign/i18n-core works in any JS/TS environment, no Vue dependency',
    },
    dateDirective: {
      title: 'v-t-date Date Formatting Directive',
      description: 'Format dates directly in templates, auto-updates on locale change',
    },
    numberDirective: {
      title: 'v-t-number Number Formatting Directive',
      description: 'Format numbers, currency, and percentages in templates, auto-updates on locale change',
    },
    numberComponent: {
      title: 'I18nNumber Formatting Component',
      description: 'Declarative number formatting with support for plain numbers, currency, percent, and compact',
    },
    datetimeComponent: {
      title: 'I18nDatetime Formatting Component',
      description: 'Declarative date formatting with support for date, time, datetime, and relative time',
    },
    missingKeys: {
      title: 'Missing Keys Detection (useI18nMissingKeys)',
      description: 'Dev tool to collect missing translation keys in real-time',
      triggerMissing: 'Trigger Missing Key',
      clearAll: 'Clear All',
      noMissing: 'No missing translation keys',
      total: '{{count}} missing key(s)',
    },
    // CoreDemo
    formatting: {
      description: 'date() / number() / currency() / relativeTime() — Based on Intl API, auto-follows locale',
    },
    exists: {
      description: 'Check if a translation key exists to avoid showing fallback key names',
    },
    localeManagement: {
      title: 'getAvailableLocales() / setLocale()',
      description: 'Get available locales list, dynamically switch language',
    },
    dynamicMessages: {
      title: 'mergeMessages() / addLocale()',
      description: 'Dynamically merge or add translation messages at runtime',
      mergeButton: 'Merge to {{locale}}',
      mergeSuccess: '✓ Merged!',
      invalidJSON: '✗ Invalid JSON',
    },
    events: {
      title: "on('localeChanged') / on('missingKey')",
      description: 'Listen to locale change and missing key events',
      triggerMissing: 'Trigger missingKey',
      noEvents: 'No events yet. Try switching locale or triggering a missing key.',
    },
    enginePlugin: {
      title: 'Engine Plugin & Persistence Config',
      description: 'Create Engine plugin via createI18nEnginePlugin with auto-persistence and callbacks',
    },
    translationExists: {
      title: 'te() — Translation Exists',
      description: 'Check if a translation key exists',
      descriptionConditional: 'Check if a translation key exists, for conditional rendering',
      exists: '✓ exists',
      missing: '✗ missing',
    },
    validationStatus: {
      valid: '✓ Valid',
    },
    // VueDemo
    compositionApi: {
      title: 'useI18n() — Composition API',
      description: 'Full Composition API with translation, pluralization, date, number formatting, and message management',
    },
    useLocale: {
      title: 'useLocale()',
      description: 'Locale management composable with locale state and switching',
    },
    useTranslation: {
      title: 'useTranslation(namespace)',
      description: 'Simplified translation hook with built-in namespace (similar to react-i18next useTranslation)',
    },
    useI18nScope: {
      title: 'useI18nScope(scope)',
      description: 'Component-level scoped translation with gt() global fallback',
    },
    dynamicTranslation: {
      title: 'Dynamic Translation',
      description: 'Enter a translation key and get the result in real-time',
      placeholder: 'Enter translation key...',
      translateButton: 'Translate',
    },
    mergeLocaleMessage: {
      title: 'mergeLocaleMessage()',
      description: 'Dynamically merge new translation messages into the current locale at runtime',
    },
    setLocaleMessage: {
      title: 'setLocaleMessage() / getLocaleMessage()',
      description: 'Replace the entire message object for a locale, or get current messages for modification',
      replacePath: 'Replace path: {{path}}',
      replaceButton: 'Replace',
      replaceSuccess: '✓ Replaced! Check aboutScope below.',
      error: '✗ Error',
    },
    globalProperties: {
      title: '$t / $i18n Global Properties',
      description: 'Use $t global property directly in templates (Options API / template usage)',
    },
  },

  pages: {
    home: {
      title: 'Home',
      description: 'This is the home page description',
      welcome: 'Welcome back, {{name}}!',
    },
    settings: {
      title: 'Settings',
      description: 'Manage your preferences',
      theme: 'Theme',
      language: 'Language',
      notifications: 'Notifications',
    },
    about: {
      title: 'About',
      description: 'Learn more about us',
      version: 'Version {{version}}',
    },
  },

  validation: {
    required: 'This field is required',
    email: 'Please enter a valid email address',
    min: 'Value must be at least {{min}}',
    max: 'Value must not exceed {{max}}',
    minLength: 'Must be at least {{length}} characters',
    maxLength: 'Must not exceed {{length}} characters',
    numeric: 'Please enter a number',
    url: 'Please enter a valid URL',
    phone: 'Please enter a valid phone number',
    pattern: 'Invalid format',
  },

  mode: {
    core: {
      title: 'Core (Vanilla JS)',
      description: 'Pure @ldesign/i18n-core, works in Node.js, browsers, Web Workers, and any JS environment',
    },
    engine: {
      title: 'Engine Vue Mode',
      description: 'Powered by @ldesign/engine-vue3 VueEngine, integrated via createI18nEnginePlugin',
      features: [
        'Auto-integration with Engine lifecycle',
        'Persist language preference to localStorage',
        'Broadcast locale changes via Engine event system',
        'Engine state management integration',
        'Support onReady / onLocaleChange callbacks',
      ],
    },
    vue: {
      title: 'Native Vue Mode',
      description: 'Directly use createI18nPlugin to install into Vue app, no Engine required',
      features: [
        'Lightweight, no Engine dependency',
        'Install via app.use()',
        'Provides $t / $i18n global properties',
        'Supports all composables',
        'Suitable for standalone Vue projects',
      ],
    },
  },
}
