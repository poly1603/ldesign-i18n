/**
 * @ldesign/i18n - Context-Aware Translation
 * 上下文感知翻译：根据环境智能选择最合适的翻译变体
 */
/**
 * 上下文类型
 */
export interface TranslationContext {
    userRole?: 'admin' | 'user' | 'guest' | 'premium' | 'developer';
    userAge?: number;
    userGender?: 'male' | 'female' | 'other';
    userPreferences?: Record<string, any>;
    deviceType?: 'mobile' | 'tablet' | 'desktop' | 'watch' | 'tv';
    platform?: 'ios' | 'android' | 'windows' | 'mac' | 'linux' | 'web';
    screenSize?: 'small' | 'medium' | 'large' | 'xlarge';
    environment?: 'development' | 'staging' | 'production';
    region?: string;
    timezone?: string;
    season?: 'spring' | 'summer' | 'autumn' | 'winter';
    timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
    businessContext?: 'formal' | 'casual' | 'technical' | 'marketing';
    industry?: string;
    brand?: string;
    campaign?: string;
    pageType?: 'landing' | 'dashboard' | 'settings' | 'profile' | 'checkout';
    section?: string;
    feature?: string;
    culturalContext?: 'conservative' | 'moderate' | 'progressive';
    formality?: 'formal' | 'informal' | 'casual';
    tone?: 'friendly' | 'professional' | 'playful' | 'serious';
    accessibility?: {
        screenReader?: boolean;
        highContrast?: boolean;
        reducedMotion?: boolean;
        fontSize?: 'small' | 'normal' | 'large' | 'xlarge';
    };
    custom?: Record<string, any>;
}
/**
 * 翻译变体
 */
export interface TranslationVariant {
    id: string;
    value: string;
    context: TranslationContext;
    priority: number;
    conditions?: ContextCondition[];
    metadata?: {
        author?: string;
        createdAt?: Date;
        updatedAt?: Date;
        usage?: number;
        rating?: number;
    };
}
/**
 * 上下文条件
 */
export interface ContextCondition {
    field: string;
    operator: 'equals' | 'contains' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'regex';
    value: any;
    weight?: number;
}
/**
 * 上下文规则
 */
export interface ContextRule {
    id: string;
    name: string;
    description?: string;
    conditions: ContextCondition[];
    variants: Map<string, string>;
    priority: number;
    enabled: boolean;
}
/**
 * 上下文感知翻译器
 */
export declare class ContextAwareTranslator {
    private readonly variants;
    private readonly rules;
    private currentContext;
    private contextHistory;
    private readonly cache;
    private readonly performanceData;
    private readonly MAX_HISTORY_SIZE;
    private readonly MAX_CACHE_SIZE;
    private readonly MAX_PERFORMANCE_DATA;
    constructor(initialContext?: TranslationContext);
    /**
     * 设置当前上下文
     */
    setContext(context: TranslationContext): void;
    /**
     * 获取当前上下文
     */
    getContext(): TranslationContext;
    /**
     * 自动检测上下文
     */
    private detectContext;
    /**
     * 注册翻译变体
     */
    registerVariant(key: string, variant: TranslationVariant): void;
    /**
     * 注册上下文规则
     */
    registerRule(rule: ContextRule): void;
    /**
     * 获取最佳翻译变体
     */
    getBestVariant(key: string, fallback?: string): string;
    /**
     * 计算变体得分
     */
    private calculateVariantScore;
    /**
     * 计算上下文匹配度
     */
    private calculateContextMatch;
    /**
     * 评估条件
     */
    private evaluateCondition;
    /**
     * A/B测试
     */
    private applyABTesting;
    /**
     * 记录性能数据
     */
    private recordPerformance;
    /**
     * 批量翻译
     */
    translateBatch(keys: string[], fallbacks?: Record<string, string>): Record<string, string>;
    /**
     * 获取所有匹配的变体
     */
    getAllMatchingVariants(key: string): TranslationVariant[];
    /**
     * 导出配置
     */
    exportConfiguration(): {
        variants: Array<[string, TranslationVariant[]]>;
        rules: Array<[string, ContextRule]>;
    };
    /**
     * 导入配置
     */
    importConfiguration(config: {
        variants: Array<[string, TranslationVariant[]]>;
        rules: Array<[string, ContextRule]>;
    }): void;
    /**
     * 清理所有内部数据，释放内存
     */
    destroy(): void;
    private detectDeviceType;
    private detectPlatform;
    private detectScreenSize;
    private detectTimeOfDay;
    private detectSeason;
    private detectEnvironment;
    private detectAccessibility;
    private isScreenReaderActive;
    private isHighContrastMode;
    private isPrefersReducedMotion;
    private detectFontSize;
    private getCacheKey;
    private getNestedValue;
    private isPartialMatch;
    private initializeDefaultRules;
}
/**
 * 创建上下文感知翻译器 - 单例模式
 */
export declare function createContextAwareTranslator(initialContext?: TranslationContext): ContextAwareTranslator;
/**
 * 清理上下文翻译器
 */
export declare function clearContextAwareTranslator(): void;
//# sourceMappingURL=context-aware.d.ts.map