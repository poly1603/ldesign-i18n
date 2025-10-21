/*!
 * ***********************************
 * @ldesign/i18n v3.0.0            *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:23 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
'use strict';

class ContextAwareTranslator {
  constructor(initialContext) {
    Object.defineProperty(this, "variants", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: /* @__PURE__ */ new Map()
    });
    Object.defineProperty(this, "rules", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: /* @__PURE__ */ new Map()
    });
    Object.defineProperty(this, "currentContext", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: {}
    });
    Object.defineProperty(this, "contextHistory", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: []
    });
    Object.defineProperty(this, "cache", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: /* @__PURE__ */ new Map()
    });
    Object.defineProperty(this, "performanceData", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: /* @__PURE__ */ new Map()
    });
    Object.defineProperty(this, "MAX_HISTORY_SIZE", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 50
    });
    Object.defineProperty(this, "MAX_CACHE_SIZE", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 500
    });
    Object.defineProperty(this, "MAX_PERFORMANCE_DATA", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 1e3
    });
    if (initialContext) {
      this.setContext(initialContext);
    }
    this.initializeDefaultRules();
    this.detectContext();
  }
  /**
   * 设置当前上下文
   */
  setContext(context) {
    this.currentContext = {
      ...this.currentContext,
      ...context
    };
    this.contextHistory.push({
      ...this.currentContext
    });
    if (this.contextHistory.length > this.MAX_HISTORY_SIZE) {
      this.contextHistory.shift();
    }
    if (this.cache.size > this.MAX_CACHE_SIZE) {
      const halfSize = Math.floor(this.cache.size / 2);
      const keysToDelete = Array.from(this.cache.keys()).slice(0, halfSize);
      keysToDelete.forEach((key) => this.cache.delete(key));
    }
  }
  /**
   * 获取当前上下文
   */
  getContext() {
    return {
      ...this.currentContext
    };
  }
  /**
   * 自动检测上下文
   */
  detectContext() {
    this.currentContext.deviceType = this.detectDeviceType();
    this.currentContext.platform = this.detectPlatform();
    this.currentContext.screenSize = this.detectScreenSize();
    this.currentContext.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    this.currentContext.timeOfDay = this.detectTimeOfDay();
    this.currentContext.season = this.detectSeason();
    this.currentContext.environment = this.detectEnvironment();
    this.currentContext.accessibility = this.detectAccessibility();
  }
  /**
   * 注册翻译变体
   */
  registerVariant(key, variant) {
    if (!this.variants.has(key)) {
      this.variants.set(key, []);
    }
    const variants = this.variants.get(key);
    const existingIndex = variants.findIndex((v) => v.id === variant.id);
    if (existingIndex >= 0) {
      variants[existingIndex] = variant;
    } else {
      variants.push(variant);
    }
    variants.sort((a, b) => b.priority - a.priority);
  }
  /**
   * 注册上下文规则
   */
  registerRule(rule) {
    this.rules.set(rule.id, rule);
  }
  /**
   * 获取最佳翻译变体
   */
  getBestVariant(key, fallback) {
    const cacheKey = this.getCacheKey(key);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    const variants = this.variants.get(key) || [];
    if (variants.length === 0) {
      return fallback || key;
    }
    const scoredVariants = variants.map((variant) => ({
      variant,
      score: this.calculateVariantScore(variant)
    }));
    scoredVariants.sort((a, b) => b.score - a.score);
    const selected = this.applyABTesting(scoredVariants);
    this.recordPerformance(key, selected.variant.id);
    this.cache.set(cacheKey, selected.variant.value);
    return selected.variant.value;
  }
  /**
   * 计算变体得分
   */
  calculateVariantScore(variant) {
    let score = variant.priority * 10;
    if (variant.conditions) {
      for (const condition of variant.conditions) {
        if (this.evaluateCondition(condition)) {
          score += condition.weight || 1;
        } else {
          score -= (condition.weight || 1) * 2;
        }
      }
    }
    score += this.calculateContextMatch(variant.context);
    const performance = this.performanceData.get(variant.id);
    if (performance) {
      score += performance.successRate * 5;
      score += Math.min(performance.usageCount / 100, 5);
    }
    if (variant.metadata) {
      if (variant.metadata.rating) {
        score += variant.metadata.rating * 2;
      }
      if (variant.metadata.usage) {
        score += Math.log10(variant.metadata.usage + 1);
      }
    }
    return score;
  }
  /**
   * 计算上下文匹配度
   */
  calculateContextMatch(variantContext) {
    let matchScore = 0;
    let totalFields = 0;
    for (const [key, value] of Object.entries(variantContext)) {
      totalFields++;
      if (this.currentContext[key] === value) {
        matchScore += 2;
      } else if (this.isPartialMatch(this.currentContext[key], value)) {
        matchScore += 1;
      }
    }
    return totalFields > 0 ? matchScore / totalFields * 10 : 0;
  }
  /**
   * 评估条件
   */
  evaluateCondition(condition) {
    const contextValue = this.getNestedValue(this.currentContext, condition.field);
    switch (condition.operator) {
      case "equals":
        return contextValue === condition.value;
      case "contains":
        return String(contextValue).includes(String(condition.value));
      case "gt":
        return Number(contextValue) > Number(condition.value);
      case "lt":
        return Number(contextValue) < Number(condition.value);
      case "gte":
        return Number(contextValue) >= Number(condition.value);
      case "lte":
        return Number(contextValue) <= Number(condition.value);
      case "in":
        return Array.isArray(condition.value) && condition.value.includes(contextValue);
      case "regex":
        try {
          return new RegExp(condition.value).test(String(contextValue));
        } catch {
          return false;
        }
      default:
        return false;
    }
  }
  /**
   * A/B测试
   */
  applyABTesting(scoredVariants) {
    const topVariants = scoredVariants.slice(0, 3);
    if (topVariants.length <= 1) {
      return topVariants[0];
    }
    const totalScore = topVariants.reduce((sum, v) => sum + v.score, 0);
    const random = Math.random() * totalScore;
    let accumulated = 0;
    for (const variant of topVariants) {
      accumulated += variant.score;
      if (random <= accumulated) {
        return variant;
      }
    }
    return topVariants[0];
  }
  /**
   * 记录性能数据
   */
  recordPerformance(key, variantId) {
    if (this.performanceData.size >= this.MAX_PERFORMANCE_DATA && !this.performanceData.has(variantId)) {
      const oldestKey = Array.from(this.performanceData.entries()).sort((a, b) => a[1].lastUsed.getTime() - b[1].lastUsed.getTime())[0]?.[0];
      if (oldestKey) {
        this.performanceData.delete(oldestKey);
      }
    }
    if (!this.performanceData.has(variantId)) {
      this.performanceData.set(variantId, {
        variantId,
        usageCount: 0,
        successCount: 0,
        successRate: 0,
        avgResponseTime: 0,
        lastUsed: /* @__PURE__ */ new Date()
      });
    }
    const performance = this.performanceData.get(variantId);
    performance.usageCount++;
    performance.lastUsed = /* @__PURE__ */ new Date();
  }
  /**
   * 批量翻译
   */
  translateBatch(keys, fallbacks) {
    const results = {};
    for (const key of keys) {
      results[key] = this.getBestVariant(key, fallbacks?.[key]);
    }
    return results;
  }
  /**
   * 获取所有匹配的变体
   */
  getAllMatchingVariants(key) {
    const variants = this.variants.get(key) || [];
    return variants.map((variant) => ({
      variant,
      score: this.calculateVariantScore(variant)
    })).filter((item) => item.score > 0).sort((a, b) => b.score - a.score).map((item) => item.variant);
  }
  /**
   * 导出配置
   */
  exportConfiguration() {
    return {
      variants: Array.from(this.variants.entries()),
      rules: Array.from(this.rules.entries())
    };
  }
  /**
   * 导入配置
   */
  importConfiguration(config) {
    this.variants.clear();
    for (const [k, arr] of config.variants) {
      this.variants.set(k, arr);
    }
    this.rules.clear();
    for (const [k, r] of config.rules) {
      this.rules.set(k, r);
    }
    this.cache.clear();
  }
  /**
   * 清理所有内部数据，释放内存
   */
  destroy() {
    this.variants.clear();
    this.rules.clear();
    this.cache.clear();
    this.performanceData.clear();
    this.contextHistory.length = 0;
    this.currentContext = {};
  }
  // ============= 检测辅助方法 =============
  detectDeviceType() {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/mobile|android|iphone/i.test(userAgent)) return "mobile";
    if (/ipad|tablet/i.test(userAgent)) return "tablet";
    if (/tv|smart-tv|smarttv/i.test(userAgent)) return "tv";
    if (/watch/i.test(userAgent)) return "watch";
    return "desktop";
  }
  detectPlatform() {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/i.test(userAgent)) return "ios";
    if (/android/i.test(userAgent)) return "android";
    if (/windows/i.test(userAgent)) return "windows";
    if (/mac/i.test(userAgent)) return "mac";
    if (/linux/i.test(userAgent)) return "linux";
    return "web";
  }
  detectScreenSize() {
    const width = window.innerWidth;
    if (width < 576) return "small";
    if (width < 768) return "medium";
    if (width < 1200) return "large";
    return "xlarge";
  }
  detectTimeOfDay() {
    const hour = (/* @__PURE__ */ new Date()).getHours();
    if (hour >= 5 && hour < 12) return "morning";
    if (hour >= 12 && hour < 17) return "afternoon";
    if (hour >= 17 && hour < 21) return "evening";
    return "night";
  }
  detectSeason() {
    const month = (/* @__PURE__ */ new Date()).getMonth();
    if (month >= 2 && month <= 4) return "spring";
    if (month >= 5 && month <= 7) return "summer";
    if (month >= 8 && month <= 10) return "autumn";
    return "winter";
  }
  detectEnvironment() {
    const hostname = window.location.hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1") return "development";
    if (hostname.includes("staging") || hostname.includes("test")) return "staging";
    return "production";
  }
  detectAccessibility() {
    return {
      screenReader: this.isScreenReaderActive(),
      highContrast: this.isHighContrastMode(),
      reducedMotion: this.isPrefersReducedMotion(),
      fontSize: this.detectFontSize()
    };
  }
  isScreenReaderActive() {
    return document.body.getAttribute("aria-busy") !== null;
  }
  isHighContrastMode() {
    if (window.matchMedia) {
      return window.matchMedia("(prefers-contrast: high)").matches;
    }
    return false;
  }
  isPrefersReducedMotion() {
    if (window.matchMedia) {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
    return false;
  }
  detectFontSize() {
    const fontSize = Number.parseFloat(window.getComputedStyle(document.body).fontSize);
    if (fontSize < 14) return "small";
    if (fontSize < 18) return "normal";
    if (fontSize < 24) return "large";
    return "xlarge";
  }
  // ============= 工具方法 =============
  getCacheKey(key) {
    const contextKey = [this.currentContext.userRole, this.currentContext.deviceType, this.currentContext.environment, this.currentContext.formality].filter(Boolean).join(":");
    return `${key}:${contextKey}`;
  }
  getNestedValue(obj, path) {
    const keys = path.split(".");
    let current = obj;
    for (const key of keys) {
      if (current && typeof current === "object" && key in current) {
        current = current[key];
      } else {
        return void 0;
      }
    }
    return current;
  }
  isPartialMatch(value1, value2) {
    if (typeof value1 === "string" && typeof value2 === "string") {
      return value1.toLowerCase().includes(value2.toLowerCase()) || value2.toLowerCase().includes(value1.toLowerCase());
    }
    return false;
  }
  initializeDefaultRules() {
    this.registerRule({
      id: "mobile-short-text",
      name: "Mobile Short Text",
      description: "Use shorter text on mobile devices",
      conditions: [{
        field: "deviceType",
        operator: "equals",
        value: "mobile",
        weight: 5
      }],
      variants: /* @__PURE__ */ new Map([["actions.save", "Save"], ["actions.cancel", "Cancel"]]),
      priority: 10,
      enabled: true
    });
    this.registerRule({
      id: "formal-context",
      name: "Formal Context",
      description: "Use formal language in business context",
      conditions: [{
        field: "businessContext",
        operator: "equals",
        value: "formal",
        weight: 10
      }],
      variants: /* @__PURE__ */ new Map([["greeting", "Good day"], ["farewell", "Best regards"]]),
      priority: 15,
      enabled: true
    });
  }
}
let contextAwareTranslatorInstance = null;
function createContextAwareTranslator(initialContext) {
  if (!contextAwareTranslatorInstance) {
    contextAwareTranslatorInstance = new ContextAwareTranslator(initialContext);
  } else if (initialContext) {
    contextAwareTranslatorInstance.setContext(initialContext);
  }
  return contextAwareTranslatorInstance;
}
function clearContextAwareTranslator() {
  if (contextAwareTranslatorInstance) {
    contextAwareTranslatorInstance.destroy();
  }
  contextAwareTranslatorInstance = null;
}

exports.ContextAwareTranslator = ContextAwareTranslator;
exports.clearContextAwareTranslator = clearContextAwareTranslator;
exports.createContextAwareTranslator = createContextAwareTranslator;
/*! End of @ldesign/i18n | Powered by @ldesign/builder */
//# sourceMappingURL=context-aware.cjs.map
