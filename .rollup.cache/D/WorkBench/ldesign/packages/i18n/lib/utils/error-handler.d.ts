/**
 * @ldesign/i18n - Enhanced Error Handling
 * Improved error messages, debugging, and developer experience
 */
import type { Locale, MessageKey, TranslateOptions } from '../types';
/**
 * Error severity levels
 */
export declare enum ErrorSeverity {
    INFO = "info",
    WARNING = "warning",
    ERROR = "error",
    CRITICAL = "critical"
}
/**
 * I18n error types
 */
export declare enum I18nErrorType {
    MISSING_KEY = "MISSING_KEY",
    INVALID_LOCALE = "INVALID_LOCALE",
    LOADER_ERROR = "LOADER_ERROR",
    INTERPOLATION_ERROR = "INTERPOLATION_ERROR",
    PLURALIZATION_ERROR = "PLURALIZATION_ERROR",
    FORMAT_ERROR = "FORMAT_ERROR",
    PLUGIN_ERROR = "PLUGIN_ERROR",
    CONFIG_ERROR = "CONFIG_ERROR",
    CACHE_ERROR = "CACHE_ERROR",
    NAMESPACE_ERROR = "NAMESPACE_ERROR"
}
/**
 * Enhanced error class for i18n
 */
export declare class I18nError extends Error {
    readonly type: I18nErrorType;
    readonly severity: ErrorSeverity;
    readonly context: Record<string, any>;
    readonly timestamp: Date;
    readonly suggestions: string[];
    readonly documentation?: string;
    constructor(type: I18nErrorType, message: string, options?: {
        severity?: ErrorSeverity;
        context?: Record<string, any>;
        suggestions?: string[];
        documentation?: string;
        cause?: Error;
    });
    /**
     * Format error for console output
     */
    toConsoleMessage(): string;
    /**
     * Convert to JSON for logging
     */
    toJSON(): Record<string, any>;
}
/**
 * Error handler with detailed debugging
 */
export declare class ErrorHandler {
    private readonly isDev;
    private readonly errorLog;
    private readonly maxLogSize;
    private errorCallbacks;
    constructor(options?: {
        isDev?: boolean;
        maxLogSize?: number;
    });
    /**
     * Handle missing translation key
     */
    handleMissingKey(key: MessageKey, locale: Locale, namespace?: string, options?: TranslateOptions): string;
    /**
     * Handle interpolation errors
     */
    handleInterpolationError(template: string, params: Record<string, any>, error: Error): string;
    /**
     * Handle loader errors
     */
    handleLoaderError(locale: Locale, namespace?: string, error?: Error): void;
    /**
     * Handle configuration errors
     */
    handleConfigError(message: string, config: any): void;
    /**
     * Create debug message for missing keys
     */
    private createDebugMessage;
    /**
     * Find similar keys (for suggestions)
     */
    private findSimilarKeys;
    /**
     * Find missing interpolation parameters
     */
    private findMissingParams;
    /**
     * Log error
     */
    private logError;
    /**
     * Get appropriate console method based on severity
     */
    private getConsoleMethod;
    /**
     * Register error callback
     */
    onError(type: I18nErrorType, callback: (error: I18nError) => void): void;
    /**
     * Emit error to registered callbacks
     */
    private emitError;
    /**
     * Get error log
     */
    getErrorLog(): I18nError[];
    /**
     * Clear error log
     */
    clearErrorLog(): void;
    /**
     * Get error statistics
     */
    getErrorStats(): Record<I18nErrorType, number>;
    /**
     * Export errors for debugging
     */
    exportErrors(): string;
}
/**
 * Global error handler instance
 */
export declare const globalErrorHandler: ErrorHandler;
/**
 * Utility function for safe translation with error boundary
 */
export declare function safeTranslate(translateFn: () => string, fallback: string): string;
/**
 * Assertion utilities for development
 */
export declare const assert: {
    /**
     * Assert locale is valid
     */
    locale(locale: string): void;
    /**
     * Assert key is valid
     */
    key(key: string): void;
    /**
     * Assert configuration is valid
     */
    config(config: any, requiredFields?: string[]): void;
};
/**
 * Development-only warning utility
 */
export declare function warn(message: string, details?: any): void;
/**
 * Development-only info utility
 */
export declare function info(message: string, details?: any): void;
/**
 * Create error boundary for components
 */
export declare function createErrorBoundary(componentName: string, fallback: any): (error: Error) => any;
