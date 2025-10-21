/**
 * @ldesign/i18n - Context-Aware Translation
 * 上下文感知翻译：根据环境智能选择最合适的翻译变体
 */
/**
 * 上下文感知翻译器
 */
export class ContextAwareTranslator {
    constructor(initialContext) {
        Object.defineProperty(this, "variants", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "rules", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
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
            value: new Map()
        });
        Object.defineProperty(this, "performanceData", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
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
            value: 1000
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
        this.currentContext = { ...this.currentContext, ...context };
        this.contextHistory.push({ ...this.currentContext });
        // 限制历史记录大小
        if (this.contextHistory.length > this.MAX_HISTORY_SIZE) {
            this.contextHistory.shift();
        }
        // 清理缓存 - 只清理一半以保留热数据
        if (this.cache.size > this.MAX_CACHE_SIZE) {
            const halfSize = Math.floor(this.cache.size / 2);
            const keysToDelete = Array.from(this.cache.keys()).slice(0, halfSize);
            keysToDelete.forEach(key => this.cache.delete(key));
        }
    }
    /**
     * 获取当前上下文
     */
    getContext() {
        return { ...this.currentContext };
    }
    /**
     * 自动检测上下文
     */
    detectContext() {
        // 检测设备类型
        this.currentContext.deviceType = this.detectDeviceType();
        // 检测平台
        this.currentContext.platform = this.detectPlatform();
        // 检测屏幕大小
        this.currentContext.screenSize = this.detectScreenSize();
        // 检测时区
        this.currentContext.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        // 检测时间段
        this.currentContext.timeOfDay = this.detectTimeOfDay();
        // 检测季节
        this.currentContext.season = this.detectSeason();
        // 检测环境
        this.currentContext.environment = this.detectEnvironment();
        // 检测辅助功能
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
        // 检查是否已存在相同ID的变体
        const existingIndex = variants.findIndex(v => v.id === variant.id);
        if (existingIndex >= 0) {
            variants[existingIndex] = variant;
        }
        else {
            variants.push(variant);
        }
        // 按优先级排序
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
        // 检查缓存
        const cacheKey = this.getCacheKey(key);
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        // 获取所有变体
        const variants = this.variants.get(key) || [];
        if (variants.length === 0) {
            return fallback || key;
        }
        // 计算每个变体的得分
        const scoredVariants = variants.map(variant => ({
            variant,
            score: this.calculateVariantScore(variant)
        }));
        // 按得分排序
        scoredVariants.sort((a, b) => b.score - a.score);
        // A/B测试支持
        const selected = this.applyABTesting(scoredVariants);
        // 记录性能数据
        this.recordPerformance(key, selected.variant.id);
        // 缓存结果
        this.cache.set(cacheKey, selected.variant.value);
        return selected.variant.value;
    }
    /**
     * 计算变体得分
     */
    calculateVariantScore(variant) {
        let score = variant.priority * 10;
        // 检查条件匹配
        if (variant.conditions) {
            for (const condition of variant.conditions) {
                if (this.evaluateCondition(condition)) {
                    score += condition.weight || 1;
                }
                else {
                    score -= (condition.weight || 1) * 2;
                }
            }
        }
        // 上下文匹配度
        score += this.calculateContextMatch(variant.context);
        // 性能历史
        const performance = this.performanceData.get(variant.id);
        if (performance) {
            score += performance.successRate * 5;
            score += Math.min(performance.usageCount / 100, 5);
        }
        // 元数据评分
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
            }
            else if (this.isPartialMatch(this.currentContext[key], value)) {
                matchScore += 1;
            }
        }
        return totalFields > 0 ? (matchScore / totalFields) * 10 : 0;
    }
    /**
     * 评估条件
     */
    evaluateCondition(condition) {
        const contextValue = this.getNestedValue(this.currentContext, condition.field);
        switch (condition.operator) {
            case 'equals':
                return contextValue === condition.value;
            case 'contains':
                return String(contextValue).includes(String(condition.value));
            case 'gt':
                return Number(contextValue) > Number(condition.value);
            case 'lt':
                return Number(contextValue) < Number(condition.value);
            case 'gte':
                return Number(contextValue) >= Number(condition.value);
            case 'lte':
                return Number(contextValue) <= Number(condition.value);
            case 'in':
                return Array.isArray(condition.value) &&
                    condition.value.includes(contextValue);
            case 'regex':
                try {
                    return new RegExp(condition.value).test(String(contextValue));
                }
                catch {
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
        // 简单的A/B测试实现
        const topVariants = scoredVariants.slice(0, 3);
        if (topVariants.length <= 1) {
            return topVariants[0];
        }
        // 基于得分的概率选择
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
        // 限制性能数据大小
        if (this.performanceData.size >= this.MAX_PERFORMANCE_DATA && !this.performanceData.has(variantId)) {
            // 删除最旧的项
            const oldestKey = Array.from(this.performanceData.entries())
                .sort((a, b) => a[1].lastUsed.getTime() - b[1].lastUsed.getTime())[0]?.[0];
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
                lastUsed: new Date()
            });
        }
        const performance = this.performanceData.get(variantId);
        performance.usageCount++;
        performance.lastUsed = new Date();
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
        return variants
            .map(variant => ({
            variant,
            score: this.calculateVariantScore(variant)
        }))
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .map(item => item.variant);
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
        // Reset existing collections instead of reassigning readonly fields
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
        if (/mobile|android|iphone/i.test(userAgent))
            return 'mobile';
        if (/ipad|tablet/i.test(userAgent))
            return 'tablet';
        if (/tv|smart-tv|smarttv/i.test(userAgent))
            return 'tv';
        if (/watch/i.test(userAgent))
            return 'watch';
        return 'desktop';
    }
    detectPlatform() {
        const userAgent = navigator.userAgent.toLowerCase();
        if (/iphone|ipad|ipod/i.test(userAgent))
            return 'ios';
        if (/android/i.test(userAgent))
            return 'android';
        if (/windows/i.test(userAgent))
            return 'windows';
        if (/mac/i.test(userAgent))
            return 'mac';
        if (/linux/i.test(userAgent))
            return 'linux';
        return 'web';
    }
    detectScreenSize() {
        const width = window.innerWidth;
        if (width < 576)
            return 'small';
        if (width < 768)
            return 'medium';
        if (width < 1200)
            return 'large';
        return 'xlarge';
    }
    detectTimeOfDay() {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12)
            return 'morning';
        if (hour >= 12 && hour < 17)
            return 'afternoon';
        if (hour >= 17 && hour < 21)
            return 'evening';
        return 'night';
    }
    detectSeason() {
        const month = new Date().getMonth();
        if (month >= 2 && month <= 4)
            return 'spring';
        if (month >= 5 && month <= 7)
            return 'summer';
        if (month >= 8 && month <= 10)
            return 'autumn';
        return 'winter';
    }
    detectEnvironment() {
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1')
            return 'development';
        if (hostname.includes('staging') || hostname.includes('test'))
            return 'staging';
        return 'production';
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
        // 简化检测
        return document.body.getAttribute('aria-busy') !== null;
    }
    isHighContrastMode() {
        if (window.matchMedia) {
            return window.matchMedia('(prefers-contrast: high)').matches;
        }
        return false;
    }
    isPrefersReducedMotion() {
        if (window.matchMedia) {
            return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        }
        return false;
    }
    detectFontSize() {
        const fontSize = Number.parseFloat(window.getComputedStyle(document.body).fontSize);
        if (fontSize < 14)
            return 'small';
        if (fontSize < 18)
            return 'normal';
        if (fontSize < 24)
            return 'large';
        return 'xlarge';
    }
    // ============= 工具方法 =============
    getCacheKey(key) {
        // 优化缓存键生成 - 只使用关键属性
        const contextKey = [
            this.currentContext.userRole,
            this.currentContext.deviceType,
            this.currentContext.environment,
            this.currentContext.formality
        ].filter(Boolean).join(':');
        return `${key}:${contextKey}`;
    }
    getNestedValue(obj, path) {
        const keys = path.split('.');
        let current = obj;
        for (const key of keys) {
            if (current && typeof current === 'object' && key in current) {
                current = current[key];
            }
            else {
                return undefined;
            }
        }
        return current;
    }
    isPartialMatch(value1, value2) {
        if (typeof value1 === 'string' && typeof value2 === 'string') {
            return value1.toLowerCase().includes(value2.toLowerCase()) ||
                value2.toLowerCase().includes(value1.toLowerCase());
        }
        return false;
    }
    initializeDefaultRules() {
        // 添加一些默认规则
        // 移动端简短文本规则
        this.registerRule({
            id: 'mobile-short-text',
            name: 'Mobile Short Text',
            description: 'Use shorter text on mobile devices',
            conditions: [
                { field: 'deviceType', operator: 'equals', value: 'mobile', weight: 5 }
            ],
            variants: new Map([
                ['actions.save', 'Save'],
                ['actions.cancel', 'Cancel']
            ]),
            priority: 10,
            enabled: true
        });
        // 正式场合规则
        this.registerRule({
            id: 'formal-context',
            name: 'Formal Context',
            description: 'Use formal language in business context',
            conditions: [
                { field: 'businessContext', operator: 'equals', value: 'formal', weight: 10 }
            ],
            variants: new Map([
                ['greeting', 'Good day'],
                ['farewell', 'Best regards']
            ]),
            priority: 15,
            enabled: true
        });
    }
}
// 单例模式
let contextAwareTranslatorInstance = null;
/**
 * 创建上下文感知翻译器 - 单例模式
 */
export function createContextAwareTranslator(initialContext) {
    if (!contextAwareTranslatorInstance) {
        contextAwareTranslatorInstance = new ContextAwareTranslator(initialContext);
    }
    else if (initialContext) {
        contextAwareTranslatorInstance.setContext(initialContext);
    }
    return contextAwareTranslatorInstance;
}
/**
 * 清理上下文翻译器
 */
export function clearContextAwareTranslator() {
    if (contextAwareTranslatorInstance) {
        contextAwareTranslatorInstance.destroy();
    }
    contextAwareTranslatorInstance = null;
}
//# sourceMappingURL=context-aware.js.map