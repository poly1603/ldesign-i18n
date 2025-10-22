/**
 * @ldesign/i18n - Performance Budget Monitor
 * Warns when performance metrics exceed defined budgets
 */

/**
 * Performance budget configuration
 */
export interface PerformanceBudget {
  translationTime?: number;        // Max ms per translation
  batchTranslationTime?: number;   // Max ms per batch
  cacheSize?: number;              // Max cache entries
  cacheHitRate?: number;           // Min hit rate (0-1)
  memoryUsage?: number;            // Max memory in bytes
  bundleSize?: number;             // Max bundle size in bytes
}

/**
 * Budget violation
 */
export interface BudgetViolation {
  metric: string;
  actual: number;
  budget: number;
  severity: 'warning' | 'error' | 'critical';
  message: string;
  timestamp: number;
}

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  translationTime: number;
  batchTranslationTime: number;
  cacheSize: number;
  cacheHitRate: number;
  memoryUsage: number;
}

/**
 * Performance Budget Monitor
 */
export class PerformanceBudgetMonitor {
  private readonly budgets: Required<PerformanceBudget>;
  private readonly violations: BudgetViolation[] = [];
  private readonly maxViolations: number;
  private readonly onViolation?: (violation: BudgetViolation) => void;
  private checkCount = 0;

  constructor(
    budgets: PerformanceBudget = {},
    options: {
      maxViolations?: number;
      onViolation?: (violation: BudgetViolation) => void;
    } = {}
  ) {
    // Default budgets
    this.budgets = {
      translationTime: budgets.translationTime || 5,                    // 5ms
      batchTranslationTime: budgets.batchTranslationTime || 20,        // 20ms
      cacheSize: budgets.cacheSize || 1000,                            // 1000 entries
      cacheHitRate: budgets.cacheHitRate || 0.8,                       // 80%
      memoryUsage: budgets.memoryUsage || 10 * 1024 * 1024,           // 10MB
      bundleSize: budgets.bundleSize || 50 * 1024,                     // 50KB
    };

    this.maxViolations = options.maxViolations || 100;
    this.onViolation = options.onViolation;
  }

  /**
   * Check metrics against budgets
   */
  check(metrics: PerformanceMetrics): BudgetViolation[] {
    this.checkCount++;
    const violations: BudgetViolation[] = [];

    // Check translation time
    if (metrics.translationTime > this.budgets.translationTime) {
      violations.push(this.createViolation(
        'translationTime',
        metrics.translationTime,
        this.budgets.translationTime,
        this.getSeverity(metrics.translationTime, this.budgets.translationTime)
      ));
    }

    // Check batch translation time
    if (metrics.batchTranslationTime > this.budgets.batchTranslationTime) {
      violations.push(this.createViolation(
        'batchTranslationTime',
        metrics.batchTranslationTime,
        this.budgets.batchTranslationTime,
        this.getSeverity(metrics.batchTranslationTime, this.budgets.batchTranslationTime)
      ));
    }

    // Check cache size
    if (metrics.cacheSize > this.budgets.cacheSize) {
      violations.push(this.createViolation(
        'cacheSize',
        metrics.cacheSize,
        this.budgets.cacheSize,
        'warning'
      ));
    }

    // Check cache hit rate (inverse - lower is worse)
    if (metrics.cacheHitRate < this.budgets.cacheHitRate) {
      violations.push(this.createViolation(
        'cacheHitRate',
        metrics.cacheHitRate,
        this.budgets.cacheHitRate,
        'warning',
        `Cache hit rate below budget: ${(metrics.cacheHitRate * 100).toFixed(1)}% < ${(this.budgets.cacheHitRate * 100).toFixed(1)}%`
      ));
    }

    // Check memory usage
    if (metrics.memoryUsage > this.budgets.memoryUsage) {
      violations.push(this.createViolation(
        'memoryUsage',
        metrics.memoryUsage,
        this.budgets.memoryUsage,
        this.getSeverity(metrics.memoryUsage, this.budgets.memoryUsage)
      ));
    }

    // Store violations
    for (const violation of violations) {
      this.addViolation(violation);
    }

    return violations;
  }

  /**
   * Create violation object
   */
  private createViolation(
    metric: string,
    actual: number,
    budget: number,
    severity: 'warning' | 'error' | 'critical',
    customMessage?: string
  ): BudgetViolation {
    const message = customMessage ||
      `${metric} exceeded budget: ${actual.toFixed(2)} > ${budget.toFixed(2)}`;

    return {
      metric,
      actual,
      budget,
      severity,
      message,
      timestamp: Date.now()
    };
  }

  /**
   * Determine severity based on how much budget is exceeded
   */
  private getSeverity(actual: number, budget: number): 'warning' | 'error' | 'critical' {
    const ratio = actual / budget;

    if (ratio > 2) return 'critical';  // 2x over budget
    if (ratio > 1.5) return 'error';   // 1.5x over budget
    return 'warning';                   // Just over budget
  }

  /**
   * Add violation to history
   */
  private addViolation(violation: BudgetViolation): void {
    // Limit stored violations
    if (this.violations.length >= this.maxViolations) {
      this.violations.shift();
    }

    this.violations.push(violation);

    // Call violation callback
    if (this.onViolation) {
      try {
        this.onViolation(violation);
      } catch (error) {
        console.error('[PerformanceBudgetMonitor] Error in violation callback:', error);
      }
    }

    // Log violation
    this.logViolation(violation);
  }

  /**
   * Log violation to console
   */
  private logViolation(violation: BudgetViolation): void {
    const prefix = `[@ldesign/i18n Performance]`;

    switch (violation.severity) {
      case 'critical':
        console.error(`${prefix} 🔴 CRITICAL: ${violation.message}`);
        break;
      case 'error':
        console.error(`${prefix} ⚠️ ERROR: ${violation.message}`);
        break;
      case 'warning':
        console.warn(`${prefix} ⚡ WARNING: ${violation.message}`);
        break;
    }
  }

  /**
   * Get all violations
   */
  getViolations(): BudgetViolation[] {
    return [...this.violations];
  }

  /**
   * Get violations by severity
   */
  getViolationsBySeverity(severity: 'warning' | 'error' | 'critical'): BudgetViolation[] {
    return this.violations.filter(v => v.severity === severity);
  }

  /**
   * Get violations summary
   */
  getSummary(): {
    totalViolations: number;
    byMetric: Record<string, number>;
    bySeverity: Record<string, number>;
    checkCount: number;
  } {
    const byMetric: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};

    for (const violation of this.violations) {
      byMetric[violation.metric] = (byMetric[violation.metric] || 0) + 1;
      bySeverity[violation.severity] = (bySeverity[violation.severity] || 0) + 1;
    }

    return {
      totalViolations: this.violations.length,
      byMetric,
      bySeverity,
      checkCount: this.checkCount
    };
  }

  /**
   * Clear violation history
   */
  clearViolations(): void {
    this.violations.length = 0;
  }

  /**
   * Get current budgets
   */
  getBudgets(): Required<PerformanceBudget> {
    return { ...this.budgets };
  }

  /**
   * Update budgets
   */
  updateBudgets(budgets: Partial<PerformanceBudget>): void {
    Object.assign(this.budgets, budgets);
  }

  /**
   * Generate recommendations based on violations
   */
  generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const summary = this.getSummary();

    // Translation time recommendations
    if (summary.byMetric.translationTime) {
      recommendations.push(
        'Consider enabling template pre-compilation to improve translation performance'
      );
      recommendations.push(
        'Review and optimize complex interpolation patterns'
      );
    }

    // Cache recommendations
    if (summary.byMetric.cacheSize) {
      recommendations.push(
        'Increase cache size limit or enable adaptive caching'
      );
    }

    if (summary.byMetric.cacheHitRate) {
      recommendations.push(
        'Low cache hit rate detected. Consider pre-warming cache with common translations'
      );
      recommendations.push(
        'Review translation patterns - frequent unique translations reduce cache effectiveness'
      );
    }

    // Memory recommendations
    if (summary.byMetric.memoryUsage) {
      recommendations.push(
        'High memory usage detected. Consider enabling memory optimization features'
      );
      recommendations.push(
        'Review loaded language packs - unload unused locales'
      );
    }

    return recommendations;
  }
}

/**
 * Create performance budget monitor
 */
export function createPerformanceBudgetMonitor(
  budgets?: PerformanceBudget,
  options?: {
    maxViolations?: number;
    onViolation?: (violation: BudgetViolation) => void;
  }
): PerformanceBudgetMonitor {
  return new PerformanceBudgetMonitor(budgets, options);
}


