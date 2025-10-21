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

exports.ErrorSeverity = void 0;
(function(ErrorSeverity2) {
  ErrorSeverity2["INFO"] = "info";
  ErrorSeverity2["WARNING"] = "warning";
  ErrorSeverity2["ERROR"] = "error";
  ErrorSeverity2["CRITICAL"] = "critical";
})(exports.ErrorSeverity || (exports.ErrorSeverity = {}));
exports.I18nErrorType = void 0;
(function(I18nErrorType2) {
  I18nErrorType2["MISSING_KEY"] = "MISSING_KEY";
  I18nErrorType2["INVALID_LOCALE"] = "INVALID_LOCALE";
  I18nErrorType2["LOADER_ERROR"] = "LOADER_ERROR";
  I18nErrorType2["INTERPOLATION_ERROR"] = "INTERPOLATION_ERROR";
  I18nErrorType2["PLURALIZATION_ERROR"] = "PLURALIZATION_ERROR";
  I18nErrorType2["FORMAT_ERROR"] = "FORMAT_ERROR";
  I18nErrorType2["PLUGIN_ERROR"] = "PLUGIN_ERROR";
  I18nErrorType2["CONFIG_ERROR"] = "CONFIG_ERROR";
  I18nErrorType2["CACHE_ERROR"] = "CACHE_ERROR";
  I18nErrorType2["NAMESPACE_ERROR"] = "NAMESPACE_ERROR";
})(exports.I18nErrorType || (exports.I18nErrorType = {}));
class I18nError extends Error {
  constructor(type, message, options = {}) {
    super(message);
    Object.defineProperty(this, "type", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "severity", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "context", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "timestamp", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "suggestions", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "documentation", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    this.name = "I18nError";
    this.type = type;
    this.severity = options.severity || exports.ErrorSeverity.ERROR;
    this.context = options.context || {};
    this.suggestions = options.suggestions || [];
    this.documentation = options.documentation;
    this.timestamp = /* @__PURE__ */ new Date();
    if (options.cause && "cause" in Error.prototype) {
      this.cause = options.cause;
    }
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, I18nError);
    }
  }
  /**
   * Format error for console output
   */
  toConsoleMessage() {
    const lines = [`[I18n ${this.severity.toUpperCase()}] ${this.type}`, `Message: ${this.message}`];
    if (Object.keys(this.context).length > 0) {
      lines.push(`Context: ${JSON.stringify(this.context, null, 2)}`);
    }
    if (this.suggestions.length > 0) {
      lines.push("Suggestions:");
      this.suggestions.forEach((s) => lines.push(`  - ${s}`));
    }
    if (this.documentation) {
      lines.push(`Documentation: ${this.documentation}`);
    }
    return lines.join("\n");
  }
  /**
   * Convert to JSON for logging
   */
  toJSON() {
    return {
      name: this.name,
      type: this.type,
      severity: this.severity,
      message: this.message,
      context: this.context,
      suggestions: this.suggestions,
      documentation: this.documentation,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack
    };
  }
}
class ErrorHandler {
  constructor(options = {}) {
    Object.defineProperty(this, "isDev", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "errorLog", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: []
    });
    Object.defineProperty(this, "maxLogSize", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "errorCallbacks", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: /* @__PURE__ */ new Map()
    });
    this.isDev = options.isDev ?? (typeof window !== "undefined" && window.__DEV__ === true);
    this.maxLogSize = options.maxLogSize ?? 100;
  }
  /**
   * Handle missing translation key
   */
  handleMissingKey(key, locale, namespace, options) {
    const similarKeys = this.findSimilarKeys(key);
    const suggestions = [];
    if (similarKeys.length > 0) {
      suggestions.push(`Did you mean: ${similarKeys.join(", ")}?`);
    }
    suggestions.push(`Check if the key "${key}" exists in locale "${locale}"`);
    suggestions.push("Ensure the locale messages are properly loaded");
    if (namespace) {
      suggestions.push(`Verify namespace "${namespace}" is loaded`);
    }
    const error = new I18nError(exports.I18nErrorType.MISSING_KEY, `Translation key "${key}" not found for locale "${locale}"`, {
      severity: exports.ErrorSeverity.WARNING,
      context: {
        key,
        locale,
        namespace,
        options
      },
      suggestions,
      documentation: "https://docs.ldesign.io/i18n/missing-keys"
    });
    this.logError(error);
    if (this.isDev) {
      return this.createDebugMessage(key, locale, namespace);
    }
    return options?.defaultValue || key;
  }
  /**
   * Handle interpolation errors
   */
  handleInterpolationError(template, params, error) {
    const missingParams = this.findMissingParams(template, params);
    const suggestions = [];
    if (missingParams.length > 0) {
      suggestions.push(`Missing parameters: ${missingParams.join(", ")}`);
    }
    suggestions.push("Check parameter names match template placeholders");
    suggestions.push("Ensure parameter values are valid");
    const i18nError = new I18nError(exports.I18nErrorType.INTERPOLATION_ERROR, `Interpolation failed for template: ${template}`, {
      severity: exports.ErrorSeverity.ERROR,
      context: {
        template,
        params
      },
      suggestions,
      cause: error,
      documentation: "https://docs.ldesign.io/i18n/interpolation"
    });
    this.logError(i18nError);
    if (this.isDev) {
      return `[INTERPOLATION_ERROR: ${template}]`;
    }
    return template;
  }
  /**
   * Handle loader errors
   */
  handleLoaderError(locale, namespace, error) {
    const suggestions = [`Check if locale file for "${locale}" exists`, "Verify network connectivity", "Check CORS settings if loading from external source", "Ensure the loader is properly configured"];
    const i18nError = new I18nError(exports.I18nErrorType.LOADER_ERROR, `Failed to load messages for locale "${locale}"${namespace ? ` (namespace: ${namespace})` : ""}`, {
      severity: exports.ErrorSeverity.ERROR,
      context: {
        locale,
        namespace
      },
      suggestions,
      cause: error,
      documentation: "https://docs.ldesign.io/i18n/loaders"
    });
    this.logError(i18nError);
    this.emitError(i18nError);
  }
  /**
   * Handle configuration errors
   */
  handleConfigError(message, config) {
    const suggestions = ["Review the configuration documentation", "Check for typos in configuration keys", "Ensure required fields are provided", "Validate data types match expected values"];
    const error = new I18nError(exports.I18nErrorType.CONFIG_ERROR, message, {
      severity: exports.ErrorSeverity.CRITICAL,
      context: {
        config
      },
      suggestions,
      documentation: "https://docs.ldesign.io/i18n/configuration"
    });
    this.logError(error);
    throw error;
  }
  /**
   * Create debug message for missing keys
   */
  createDebugMessage(key, locale, namespace) {
    const parts = [`[Missing: ${key}]`, `[Locale: ${locale}]`];
    if (namespace) {
      parts.push(`[NS: ${namespace}]`);
    }
    return parts.join(" ");
  }
  /**
   * Find similar keys (for suggestions)
   */
  findSimilarKeys(key) {
    return [];
  }
  /**
   * Find missing interpolation parameters
   */
  findMissingParams(template, params) {
    const placeholders = template.match(/\{\{?\s*(\w+)\s*\}?\}/g) || [];
    const missing = [];
    placeholders.forEach((placeholder) => {
      const paramName = placeholder.replace(/\{\{?\s*|\s*\}?\}/g, "");
      if (!(paramName in params)) {
        missing.push(paramName);
      }
    });
    return missing;
  }
  /**
   * Log error
   */
  logError(error) {
    this.errorLog.push(error);
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.shift();
    }
    if (this.isDev) {
      const consoleMethod = this.getConsoleMethod(error.severity);
      console[consoleMethod](error.toConsoleMessage());
    }
  }
  /**
   * Get appropriate console method based on severity
   */
  getConsoleMethod(severity) {
    switch (severity) {
      case exports.ErrorSeverity.INFO:
        return "log";
      case exports.ErrorSeverity.WARNING:
        return "warn";
      case exports.ErrorSeverity.ERROR:
      case exports.ErrorSeverity.CRITICAL:
        return "error";
      default:
        return "log";
    }
  }
  /**
   * Register error callback
   */
  onError(type, callback) {
    if (!this.errorCallbacks.has(type)) {
      this.errorCallbacks.set(type, []);
    }
    this.errorCallbacks.get(type).push(callback);
  }
  /**
   * Emit error to registered callbacks
   */
  emitError(error) {
    const callbacks = this.errorCallbacks.get(error.type) || [];
    callbacks.forEach((cb) => cb(error));
  }
  /**
   * Get error log
   */
  getErrorLog() {
    return [...this.errorLog];
  }
  /**
   * Clear error log
   */
  clearErrorLog() {
    this.errorLog.length = 0;
  }
  /**
   * Get error statistics
   */
  getErrorStats() {
    const stats = {};
    for (const error of this.errorLog) {
      stats[error.type] = (stats[error.type] || 0) + 1;
    }
    return stats;
  }
  /**
   * Export errors for debugging
   */
  exportErrors() {
    return JSON.stringify(this.errorLog.map((e) => e.toJSON()), null, 2);
  }
}
const globalErrorHandler = new ErrorHandler();
function safeTranslate(translateFn, fallback) {
  try {
    return translateFn();
  } catch (error) {
    if (typeof window !== "undefined" && window.__DEV__ === true) {
      console.error("[I18n] Translation failed:", error);
    }
    return fallback;
  }
}
const assert = {
  /**
   * Assert locale is valid
   */
  locale(locale) {
    if (!locale || typeof locale !== "string") {
      throw new I18nError(exports.I18nErrorType.INVALID_LOCALE, `Invalid locale: ${locale}`, {
        severity: exports.ErrorSeverity.ERROR,
        suggestions: ["Locale must be a non-empty string", 'Use format like "en", "en-US", "zh-CN"']
      });
    }
  },
  /**
   * Assert key is valid
   */
  key(key) {
    if (!key || typeof key !== "string") {
      throw new I18nError(exports.I18nErrorType.MISSING_KEY, `Invalid translation key: ${key}`, {
        severity: exports.ErrorSeverity.ERROR,
        suggestions: ["Key must be a non-empty string", 'Use dot notation for nested keys: "page.title"']
      });
    }
  },
  /**
   * Assert configuration is valid
   */
  config(config, requiredFields = []) {
    if (!config || typeof config !== "object") {
      throw new I18nError(exports.I18nErrorType.CONFIG_ERROR, "Invalid configuration object", {
        severity: exports.ErrorSeverity.CRITICAL,
        suggestions: ["Configuration must be an object"]
      });
    }
    for (const field of requiredFields) {
      if (!(field in config)) {
        throw new I18nError(exports.I18nErrorType.CONFIG_ERROR, `Missing required configuration field: ${field}`, {
          severity: exports.ErrorSeverity.CRITICAL,
          context: {
            config,
            requiredFields
          }
        });
      }
    }
  }
};
function warn(message, details) {
  if (typeof window !== "undefined" && window.__DEV__ === true) {
    console.warn(`[I18n Warning] ${message}`, details || "");
  }
}
function info(message, details) {
  if (typeof window !== "undefined" && window.__DEV__ === true) {
    console.info(`[I18n Info] ${message}`, details || "");
  }
}
function createErrorBoundary(componentName, fallback) {
  return (error) => {
    const i18nError = new I18nError(exports.I18nErrorType.PLUGIN_ERROR, `Component "${componentName}" encountered an error`, {
      severity: exports.ErrorSeverity.ERROR,
      context: {
        componentName
      },
      cause: error,
      suggestions: ["Check component props are valid", "Ensure i18n instance is properly initialized", "Review component implementation"]
    });
    globalErrorHandler.logError(i18nError);
    return fallback;
  };
}

exports.ErrorHandler = ErrorHandler;
exports.I18nError = I18nError;
exports.assert = assert;
exports.createErrorBoundary = createErrorBoundary;
exports.globalErrorHandler = globalErrorHandler;
exports.info = info;
exports.safeTranslate = safeTranslate;
exports.warn = warn;
/*! End of @ldesign/i18n | Powered by @ldesign/builder */
//# sourceMappingURL=error-handler.cjs.map
