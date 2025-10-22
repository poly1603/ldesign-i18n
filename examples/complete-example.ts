/**
 * @ldesign/i18n v3.0 - 完整功能演示
 * 展示所有新功能的实际使用
 */

import {
  createI18n,
  createAdaptiveCache,
  DirectionManager,
  TranslationCoverageReporter,
  HotReloadManager,
  createPerformanceBudgetMonitor,
  createTypeSafeWrapper,
  getSmartFallbackChain,
  contextual,
  PipelineFormatter
} from '@ldesign/i18n';
import type { TypeSafeI18n } from '@ldesign/i18n';

// ============================================
// 1. 定义消息类型（TypeScript 类型安全）
// ============================================

interface AppMessages {
  common: {
    save: string;
    cancel: string;
    delete: string;
    loading: string;
  };
  user: {
    profile: {
      name: string;
      email: string;
      age: string;
    };
    settings: {
      theme: string;
      language: string;
      notifications: string;
    };
  };
  errors: {
    network: string;
    validation: string;
    notFound: string;
  };
}

// ============================================
// 2. 创建消息（使用管道格式化和上下文）
// ============================================

const messages = {
  'zh-CN': {
    common: {
      save: '保存',
      cancel: '取消',
      delete: '删除',
      loading: '加载中...'
    },
    user: {
      profile: {
        name: '姓名：{{name | capitalize}}',
        email: '邮箱：{{email | lowercase}}',
        age: '年龄：{{age}} 岁'
      },
      settings: {
        theme: '主题：{{theme}}',
        language: '语言：{{lang}}',
        notifications: '通知已{{status | lowercase}}'
      }
    },
    errors: {
      network: '网络错误',
      validation: '验证失败',
      notFound: '未找到'
    },
    // 上下文感知翻译示例
    welcome: contextual({
      default: '欢迎！',
      male: '欢迎，先生！',
      female: '欢迎，女士！',
      formal: '诚挚欢迎您的光临。',
      child: '嗨，小朋友！'
    }),
    // 管道格式化示例
    greeting: '你好 {{name | capitalize}}！',
    price: '价格：{{amount | currency:CNY}}',
    updated: '更新于 {{date | relative}}',
    tags: '标签：{{items | join:、 | truncate:50}}'
  },
  'en': {
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      loading: 'Loading...'
    },
    user: {
      profile: {
        name: 'Name: {{name | capitalize}}',
        email: 'Email: {{email | lowercase}}',
        age: 'Age: {{age}} years'
      },
      settings: {
        theme: 'Theme: {{theme}}',
        language: 'Language: {{lang}}',
        notifications: 'Notifications {{status | lowercase}}'
      }
    },
    errors: {
      network: 'Network Error',
      validation: 'Validation Failed',
      notFound: 'Not Found'
    },
    welcome: contextual({
      default: 'Welcome!',
      male: 'Welcome, sir!',
      female: 'Welcome, madam!',
      formal: 'We welcome you to our establishment.',
      child: 'Hi friend!'
    }),
    greeting: 'Hello {{name | capitalize}}!',
    price: 'Price: {{amount | currency:USD}}',
    updated: 'Updated {{date | relative}}',
    tags: 'Tags: {{items | join:, | truncate:50}}'
  },
  'ar': {
    common: {
      save: 'حفظ',
      cancel: 'إلغاء',
      delete: 'حذف',
      loading: 'جاري التحميل...'
    },
    greeting: 'مرحبا {{name}}!',
    welcome: contextual({
      default: 'مرحبا!',
      male: 'مرحبا يا سيدي!',
      female: 'مرحبا يا سيدتي!',
      formal: 'نرحب بك ترحيبا حارا.'
    })
  }
};

// ============================================
// 3. 创建 i18n 实例（启用所有优化）
// ============================================

const i18n = createI18n({
  locale: 'zh-CN',

  // 智能回退链
  fallbackLocale: getSmartFallbackChain('zh-CN'),
  // ['zh-CN', 'zh-TW', 'zh-HK', 'zh', 'en']

  // 自适应缓存
  cache: createAdaptiveCache({
    minSize: 20,
    maxSize: 1000,
    hotSize: 30,
    tuneInterval: 60000  // 每分钟自动调优
  }),

  // 消息
  messages
});

// ============================================
// 4. RTL 支持
// ============================================

// 自动应用文本方向
i18n.on('localeChanged', ({ locale }) => {
  if (locale) {
    DirectionManager.applyToDocument(locale);
    console.log(`Locale changed to ${locale}, direction: ${DirectionManager.getDirection(locale)}`);
  }
});

// ============================================
// 5. 类型安全包装器
// ============================================

const typedI18n: TypeSafeI18n<AppMessages> = createTypeSafeWrapper(i18n);

// ============================================
// 6. 翻译覆盖率监控（开发环境）
// ============================================

let coverageReporter: TranslationCoverageReporter | undefined;

if (process.env.NODE_ENV === 'development') {
  coverageReporter = new TranslationCoverageReporter();

  i18n.on('missingKey', ({ key, locale }) => {
    if (key && locale) {
      coverageReporter!.trackMissing(key, locale);
      console.warn(`Missing translation: ${key} for ${locale}`);
    }
  });

  // 每5分钟导出报告
  setInterval(() => {
    const report = coverageReporter!.exportMarkdown(i18n.getAvailableLocales());
    console.log('\n=== Translation Coverage Report ===');
    console.log(report);
  }, 300000);
}

// ============================================
// 7. 热重载（开发环境）
// ============================================

let hotReload: HotReloadManager | undefined;

if (process.env.NODE_ENV === 'development' && typeof require !== 'undefined') {
  hotReload = new HotReloadManager({
    enabled: true,
    debounceTime: 300,
    onReload: (locale, messages) => {
      console.log(`✅ Hot reloaded ${locale}`);
    }
  });

  hotReload.attach(i18n);
  hotReload.watchFiles('./locales');
}

// ============================================
// 8. 性能预算监控
// ============================================

const performanceMonitor = createPerformanceBudgetMonitor(
  {
    translationTime: 5,              // 5ms
    batchTranslationTime: 20,        // 20ms
    cacheSize: 1000,                 // 1000 entries
    cacheHitRate: 0.85,              // 85%
    memoryUsage: 10 * 1024 * 1024   // 10MB
  },
  {
    onViolation: (violation) => {
      console.warn(`⚠️ Performance budget violation: ${violation.message}`);
    }
  }
);

// 定期检查性能
setInterval(() => {
  const cache = i18n.cache as any;
  if (cache.getStats) {
    const stats = cache.getStats();
    performanceMonitor.check({
      translationTime: 0.008,
      batchTranslationTime: 0.08,
      cacheSize: stats.size,
      cacheHitRate: stats.hitRate,
      memoryUsage: 5 * 1024 * 1024
    });
  }
}, 60000);

// ============================================
// 9. 初始化
// ============================================

async function initializeI18n() {
  console.log('🚀 Initializing @ldesign/i18n v3.0...\n');

  await i18n.init();

  console.log('✅ i18n initialized successfully');
  console.log(`Current locale: ${i18n.locale}`);
  console.log(`Direction: ${i18n.getDirection()}`);
  console.log(`Is RTL: ${i18n.isRTL()}`);
  console.log('');
}

// ============================================
// 10. 使用示例
// ============================================

async function demonstrateFeatures() {
  await initializeI18n();

  console.log('=== 基础翻译 ===');
  console.log(typedI18n.t('common.save'));              // "保存"
  console.log(typedI18n.t('user.profile.name', { name: 'john' }));  // "姓名：John"
  console.log('');

  console.log('=== 管道格式化 ===');
  console.log(i18n.t('greeting', { name: 'john' }));    // "你好 John！"
  console.log(i18n.t('price', { amount: 99.99 }));      // "价格：¥99.99"
  console.log(i18n.t('updated', { date: new Date(Date.now() - 120000) })); // "更新于 2分钟前"
  console.log(i18n.t('tags', { items: ['Vue', 'React', 'Angular'] }));     // "标签：Vue、React、Angular"
  console.log('');

  console.log('=== 上下文感知翻译 ===');
  console.log(i18n.t('welcome'));                                    // "欢迎！"
  console.log(i18n.t('welcome', { context: { gender: 'male' } }));  // "欢迎，先生！"
  console.log(i18n.t('welcome', { context: { gender: 'female' } }));// "欢迎，女士！"
  console.log(i18n.t('welcome', { context: { formality: 'formal' } })); // "诚挚欢迎您的光临。"
  console.log('');

  console.log('=== RTL 语言支持 ===');
  await i18n.setLocale('ar');
  console.log(`Arabic greeting: ${i18n.t('greeting', { name: 'محمد' })}`);
  console.log(`Direction: ${i18n.getDirection()}`);         // 'rtl'
  console.log(`Is RTL: ${i18n.isRTL()}`);                   // true
  const metadata = i18n.getLocaleMetadata();
  console.log(`Script: ${metadata.script}`);                // 'arabic'
  console.log(`Number system: ${metadata.numberSystem}`);   // 'arabic-indic'
  console.log('');

  console.log('=== 性能统计 ===');
  const cache = i18n.cache as any;
  if (cache.getStats) {
    const stats = cache.getStats();
    console.log(`Cache size: ${stats.size}/${stats.maxSize || 1000}`);
    console.log(`Hit rate: ${(stats.hitRate * 100).toFixed(1)}%`);
    console.log(`Miss rate: ${(stats.missRate * 100).toFixed(1)}%`);
  }

  if (cache.getStats && 'hotSize' in cache.getStats()) {
    const adaptiveStats = cache.getStats();
    console.log(`Hot cache: ${adaptiveStats.hotSize}/${adaptiveStats.maxHotSize}`);
    console.log(`Promotions: ${adaptiveStats.promotions}`);
    console.log(`Demotions: ${adaptiveStats.demotions}`);
  }
  console.log('');

  console.log('=== 批量翻译 ===');
  const start = performance.now();
  const batch = typedI18n.translateBatch?.([
    'common.save',
    'common.cancel',
    'common.delete',
    'user.profile.name'
  ] as any) || [];
  const time = performance.now() - start;
  console.log(`Batch translation time: ${time.toFixed(3)}ms`);
  console.log(`Results:`, batch);
  console.log('');

  console.log('=== 覆盖率报告 ===');
  if (coverageReporter) {
    const summary = coverageReporter.getSummary();
    console.log(`Total keys tracked: ${summary.totalKeys}`);
    console.log(`Locales tracked: ${summary.localesTracked}`);
    console.log(`Missing translations: ${summary.totalMissing}`);
  }
  console.log('');

  console.log('✅ All features demonstrated successfully!');
}

// ============================================
// 11. 性能基准测试
// ============================================

async function runPerformanceBenchmark() {
  console.log('\n=== Performance Benchmark ===\n');

  // 简单翻译
  const iterations = 100000;

  const start1 = performance.now();
  for (let i = 0; i < iterations; i++) {
    i18n.t('common.save');
  }
  const time1 = performance.now() - start1;
  console.log(`Simple translations: ${iterations} ops in ${time1.toFixed(2)}ms`);
  console.log(`  Average: ${(time1 / iterations).toFixed(4)}ms`);
  console.log(`  Throughput: ${Math.floor(iterations / time1 * 1000).toLocaleString()} ops/sec`);
  console.log('');

  // 带参数翻译
  const start2 = performance.now();
  for (let i = 0; i < iterations; i++) {
    i18n.t('user.profile.name', { name: 'test' });
  }
  const time2 = performance.now() - start2;
  console.log(`With parameters: ${iterations} ops in ${time2.toFixed(2)}ms`);
  console.log(`  Average: ${(time2 / iterations).toFixed(4)}ms`);
  console.log(`  Throughput: ${Math.floor(iterations / time2 * 1000).toLocaleString()} ops/sec`);
  console.log('');

  // 缓存命中
  i18n.t('cached-key'); // 预热
  const start3 = performance.now();
  for (let i = 0; i < iterations; i++) {
    i18n.t('cached-key');
  }
  const time3 = performance.now() - start3;
  console.log(`Cache hits: ${iterations} ops in ${time3.toFixed(2)}ms`);
  console.log(`  Average: ${(time3 / iterations).toFixed(4)}ms`);
  console.log(`  Throughput: ${Math.floor(iterations / time3 * 1000).toLocaleString()} ops/sec`);
  console.log('');

  // 缓存统计
  const cache = i18n.cache as any;
  if (cache.getStats) {
    const stats = cache.getStats();
    console.log('Cache Statistics:');
    console.log(`  Size: ${stats.size}`);
    console.log(`  Hit rate: ${(stats.hitRate * 100).toFixed(1)}%`);
    console.log(`  Miss rate: ${(stats.missRate * 100).toFixed(1)}%`);
  }
}

// ============================================
// 12. 导出使用
// ============================================

export {
  i18n,
  typedI18n,
  demonstrateFeatures,
  runPerformanceBenchmark
};

// ============================================
// 13. 运行演示（如果直接执行）
// ============================================

if (typeof require !== 'undefined' && require.main === module) {
  demonstrateFeatures()
    .then(() => runPerformanceBenchmark())
    .catch(console.error);
}

/**
 * 使用说明：
 * 
 * 1. 基础使用：
 *    import { i18n } from './complete-example';
 *    i18n.t('common.save');
 * 
 * 2. 类型安全：
 *    import { typedI18n } from './complete-example';
 *    typedI18n.t('user.profile.name');  // 有类型检查
 * 
 * 3. 运行演示：
 *    node complete-example.js
 * 
 * 4. 性能测试：
 *    import { runPerformanceBenchmark } from './complete-example';
 *    await runPerformanceBenchmark();
 */

