/*!
 * ***********************************
 * @ldesign/i18n v3.0.0            *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:23 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
const intlFormatterCache = /* @__PURE__ */ new Map();
const FORMATTER_CACHE_MAX = 100;
class AdvancedFormatter {
  constructor(locale = "en") {
    Object.defineProperty(this, "locale", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "customFormatters", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: /* @__PURE__ */ new Map()
    });
    Object.defineProperty(this, "formatterCache", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: intlFormatterCache
    });
    this.locale = locale;
    this.registerDefaultFormatters();
  }
  /**
   * 设置当前语言
   */
  setLocale(locale) {
    this.locale = locale;
  }
  /**
   * 注册自定义格式化器
   */
  registerFormatter(name, formatter) {
    this.customFormatters.set(name, formatter);
  }
  /**
   * 格式化值
   */
  format(value, format, options = {}) {
    const locale = options.locale || this.locale;
    if (this.customFormatters.has(format)) {
      return this.customFormatters.get(format).format(value, format, locale, options);
    }
    const [type, ...params] = format.split(":");
    const formatOptions = this.parseFormatOptions(params.join(":"));
    switch (type.toLowerCase()) {
      case "number":
        return this.formatNumber(value, {
          ...formatOptions,
          ...options
        }, locale);
      case "currency":
        return this.formatCurrency(value, {
          ...formatOptions,
          ...options
        }, locale);
      case "percent":
        return this.formatPercent(value, {
          ...formatOptions,
          ...options
        }, locale);
      case "date":
        return this.formatDate(value, {
          ...formatOptions,
          ...options
        }, locale);
      case "time":
        return this.formatTime(value, {
          ...formatOptions,
          ...options
        }, locale);
      case "datetime":
        return this.formatDateTime(value, {
          ...formatOptions,
          ...options
        }, locale);
      case "relative":
        return this.formatRelativeTime(value, {
          ...formatOptions,
          ...options
        }, locale);
      case "duration":
        return this.formatDuration(value, {
          ...formatOptions,
          ...options
        }, locale);
      case "filesize":
        return this.formatFileSize(value, {
          ...formatOptions,
          ...options
        }, locale);
      case "ordinal":
        return this.formatOrdinal(value, locale);
      case "list":
        return this.formatList(value, {
          ...formatOptions,
          ...options
        }, locale);
      case "phone":
        return this.formatPhoneNumber(value, {
          ...formatOptions,
          ...options
        }, locale);
      case "abbreviate":
        return this.abbreviateNumber(value, {
          ...formatOptions,
          ...options
        }, locale);
      default:
        return String(value);
    }
  }
  /**
   * 格式化数字
   */
  formatNumber(value, options = {}, locale) {
    const loc = locale || this.locale;
    const cacheKey = `number:${loc}:${JSON.stringify(options)}`;
    let formatter = this.formatterCache.get(cacheKey);
    if (!formatter) {
      formatter = new Intl.NumberFormat(loc, {
        minimumFractionDigits: options.minimumFractionDigits,
        maximumFractionDigits: options.maximumFractionDigits,
        minimumIntegerDigits: options.minimumIntegerDigits,
        useGrouping: options.useGrouping !== false,
        ...options
      });
      if (this.formatterCache.size >= FORMATTER_CACHE_MAX) {
        const firstKey = this.formatterCache.keys().next().value;
        if (firstKey !== void 0) {
          this.formatterCache.delete(firstKey);
        }
      }
      this.formatterCache.set(cacheKey, formatter);
    }
    return formatter.format(value);
  }
  /**
   * 格式化货币
   */
  formatCurrency(value, options = {}, locale) {
    const loc = locale || this.locale;
    const currency = options.currency || "USD";
    const cacheKey = `currency:${loc}:${currency}:${JSON.stringify(options)}`;
    let formatter = this.formatterCache.get(cacheKey);
    if (!formatter) {
      formatter = new Intl.NumberFormat(loc, {
        style: "currency",
        currency,
        currencyDisplay: options.currencyDisplay || "symbol",
        minimumFractionDigits: options.minimumFractionDigits,
        maximumFractionDigits: options.maximumFractionDigits,
        ...options
      });
      if (this.formatterCache.size >= FORMATTER_CACHE_MAX) {
        const firstKey = this.formatterCache.keys().next().value;
        if (firstKey !== void 0) {
          this.formatterCache.delete(firstKey);
        }
      }
      this.formatterCache.set(cacheKey, formatter);
    }
    return formatter.format(value);
  }
  /**
   * 格式化百分比
   */
  formatPercent(value, options = {}, locale) {
    const loc = locale || this.locale;
    const formatter = new Intl.NumberFormat(loc, {
      style: "percent",
      minimumFractionDigits: options.minimumFractionDigits || 0,
      maximumFractionDigits: options.maximumFractionDigits || 2,
      ...options
    });
    return formatter.format(value);
  }
  /**
   * 格式化日期
   */
  formatDate(value, options = {}, locale) {
    const loc = locale || this.locale;
    const date = this.toDate(value);
    const presets = {
      short: {
        year: "2-digit",
        month: "2-digit",
        day: "2-digit"
      },
      medium: {
        year: "numeric",
        month: "short",
        day: "numeric"
      },
      long: {
        year: "numeric",
        month: "long",
        day: "numeric"
      },
      full: {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      }
    };
    const formatOptions = options.preset ? presets[options.preset] || options : options;
    const formatter = new Intl.DateTimeFormat(loc, formatOptions);
    return formatter.format(date);
  }
  /**
   * 格式化时间
   */
  formatTime(value, options = {}, locale) {
    const loc = locale || this.locale;
    const date = this.toDate(value);
    const presets = {
      short: {
        hour: "2-digit",
        minute: "2-digit"
      },
      medium: {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      },
      long: {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZoneName: "short"
      }
    };
    const formatOptions = options.preset ? presets[options.preset] || options : options;
    const formatter = new Intl.DateTimeFormat(loc, formatOptions);
    return formatter.format(date);
  }
  /**
   * 格式化日期时间
   */
  formatDateTime(value, options = {}, locale) {
    const loc = locale || this.locale;
    const date = this.toDate(value);
    const dateOptions = options.date || {
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    };
    const timeOptions = options.time || {
      hour: "2-digit",
      minute: "2-digit"
    };
    const formatter = new Intl.DateTimeFormat(loc, {
      ...dateOptions,
      ...timeOptions,
      ...options
    });
    return formatter.format(date);
  }
  /**
   * 格式化相对时间
   */
  formatRelativeTime(value, options = {}, locale) {
    const loc = locale || this.locale;
    const date = this.toDate(value);
    const now = /* @__PURE__ */ new Date();
    const rtf = new Intl.RelativeTimeFormat(loc, {
      numeric: options.numeric || "auto",
      style: options.style || "long"
    });
    const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1e3);
    const absDiff = Math.abs(diffInSeconds);
    const units = [[60, "second"], [60, "minute"], [24, "hour"], [7, "day"], [4, "week"], [12, "month"], [Number.MAX_VALUE, "year"]];
    let value2 = absDiff;
    let unit = "second";
    for (const [threshold, u] of units) {
      if (value2 < threshold) {
        unit = u;
        break;
      }
      value2 = Math.floor(value2 / threshold);
    }
    const finalValue = diffInSeconds < 0 ? -value2 : value2;
    return rtf.format(finalValue, unit);
  }
  /**
   * 格式化持续时间
   */
  formatDuration(value, _options = {}, locale) {
    const loc = locale || this.locale;
    const seconds = Math.floor(value / 1e3);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const parts = [];
    if (days > 0) {
      parts.push(this.pluralize(days, "day", "days", loc));
    }
    if (hours % 24 > 0) {
      parts.push(this.pluralize(hours % 24, "hour", "hours", loc));
    }
    if (minutes % 60 > 0 && !days) {
      parts.push(this.pluralize(minutes % 60, "minute", "minutes", loc));
    }
    if (seconds % 60 > 0 && !hours && !days) {
      parts.push(this.pluralize(seconds % 60, "second", "seconds", loc));
    }
    if (parts.length === 0) {
      return this.pluralize(0, "second", "seconds", loc);
    }
    return parts.join(", ");
  }
  /**
   * 格式化文件大小
   */
  formatFileSize(value, options = {}, locale) {
    const loc = locale || this.locale;
    const units = options.binary ? ["B", "KiB", "MiB", "GiB", "TiB", "PiB"] : ["B", "KB", "MB", "GB", "TB", "PB"];
    const threshold = options.binary ? 1024 : 1e3;
    let size = Math.abs(value);
    let unitIndex = 0;
    while (size >= threshold && unitIndex < units.length - 1) {
      size /= threshold;
      unitIndex++;
    }
    const formatter = new Intl.NumberFormat(loc, {
      minimumFractionDigits: unitIndex === 0 ? 0 : 1,
      maximumFractionDigits: unitIndex === 0 ? 0 : 2
    });
    return `${formatter.format(size)} ${units[unitIndex]}`;
  }
  /**
   * 格式化序数词
   */
  formatOrdinal(value, locale) {
    const loc = locale || this.locale;
    if (loc.startsWith("en")) {
      const j = value % 10;
      const k = value % 100;
      if (j === 1 && k !== 11) {
        return `${value}st`;
      }
      if (j === 2 && k !== 12) {
        return `${value}nd`;
      }
      if (j === 3 && k !== 13) {
        return `${value}rd`;
      }
      return `${value}th`;
    }
    if (loc.startsWith("zh")) {
      return `\u7B2C${value}`;
    }
    return String(value);
  }
  /**
   * 格式化列表
   */
  formatList(value, options = {}, locale) {
    const loc = locale || this.locale;
    if (!Array.isArray(value)) {
      return String(value);
    }
    const type = options.type || "conjunction";
    const style = options.style || "long";
    try {
      const formatter = new Intl.ListFormat(loc, {
        type,
        style
      });
      return formatter.format(value);
    } catch {
      if (type === "disjunction") {
        return value.join(" or ");
      }
      return value.join(", ");
    }
  }
  /**
   * 格式化电话号码
   */
  formatPhoneNumber(value, _options = {}, locale) {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length === 11 && cleaned[0] === "1") {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    } else if (cleaned.length === 11 && (locale || this.locale).startsWith("zh")) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
    }
    return value;
  }
  /**
   * 缩写大数字
   */
  abbreviateNumber(value, options = {}, locale) {
    const loc = locale || this.locale;
    const abs = Math.abs(value);
    const abbreviations = [{
      threshold: 1e9,
      suffix: "B"
    }, {
      threshold: 1e6,
      suffix: "M"
    }, {
      threshold: 1e3,
      suffix: "K"
    }];
    for (const {
      threshold,
      suffix
    } of abbreviations) {
      if (abs >= threshold) {
        const abbreviated = value / threshold;
        const formatter = new Intl.NumberFormat(loc, {
          minimumFractionDigits: 0,
          maximumFractionDigits: options.decimals || 1
        });
        return formatter.format(abbreviated) + suffix;
      }
    }
    return this.formatNumber(value, options, loc);
  }
  /**
   * 注册默认格式化器
   */
  registerDefaultFormatters() {
    this.registerFormatter("boolean", {
      format: (value, format, locale) => {
        const isTrue = Boolean(value);
        if (locale.startsWith("zh")) {
          return isTrue ? "\u662F" : "\u5426";
        }
        return isTrue ? "Yes" : "No";
      }
    });
    this.registerFormatter("status", {
      format: (value, format, locale) => {
        const statusMap = {
          en: {
            pending: "Pending",
            processing: "Processing",
            completed: "Completed",
            failed: "Failed",
            cancelled: "Cancelled"
          },
          zh: {
            pending: "\u5F85\u5904\u7406",
            processing: "\u5904\u7406\u4E2D",
            completed: "\u5DF2\u5B8C\u6210",
            failed: "\u5931\u8D25",
            cancelled: "\u5DF2\u53D6\u6D88"
          }
        };
        const lang = locale.startsWith("zh") ? "zh" : "en";
        return statusMap[lang][value] || value;
      }
    });
    this.registerFormatter("gender", {
      format: (value, format, locale) => {
        const genderMap = {
          en: {
            male: "Male",
            female: "Female",
            other: "Other",
            unknown: "Unknown"
          },
          zh: {
            male: "\u7537",
            female: "\u5973",
            other: "\u5176\u4ED6",
            unknown: "\u672A\u77E5"
          }
        };
        const lang = locale.startsWith("zh") ? "zh" : "en";
        return genderMap[lang][value] || value;
      }
    });
  }
  /**
   * 解析格式选项
   */
  parseFormatOptions(optionsString) {
    if (!optionsString) return {};
    const options = {};
    const pairs = optionsString.split(",");
    for (const pair of pairs) {
      const [key, value] = pair.split("=").map((s) => s.trim());
      if (key && value) {
        if (value === "true") {
          options[key] = true;
        } else if (value === "false") {
          options[key] = false;
        } else if (!Number.isNaN(Number(value))) {
          options[key] = Number(value);
        } else {
          options[key] = value;
        }
      }
    }
    return options;
  }
  /**
   * 转换为日期对象
   */
  toDate(value) {
    if (value instanceof Date) {
      return value;
    }
    return new Date(value);
  }
  /**
   * 简单的复数化
   */
  pluralize(count, singular, plural, locale) {
    if (locale.startsWith("zh")) {
      const units = {
        day: "\u5929",
        hour: "\u5C0F\u65F6",
        minute: "\u5206\u949F",
        second: "\u79D2"
      };
      return `${count} ${units[singular] || singular}`;
    }
    return count === 1 ? `${count} ${singular}` : `${count} ${plural}`;
  }
}
let formatterInstance = null;
function createAdvancedFormatter(locale) {
  if (!formatterInstance) {
    formatterInstance = new AdvancedFormatter(locale);
  } else if (locale) {
    formatterInstance.setLocale(locale);
  }
  return formatterInstance;
}
function clearFormatterCache() {
  intlFormatterCache.clear();
}

export { AdvancedFormatter, clearFormatterCache, createAdvancedFormatter };
/*! End of @ldesign/i18n | Powered by @ldesign/builder */
//# sourceMappingURL=advanced-formatter.js.map
