/*!
 * ***********************************
 * @ldesign/i18n v3.0.0            *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:23 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { parseLocale } from '../utils/helpers.js';

const PLURAL_RULES = {
  // Chinese, Japanese, Korean - no plurals
  zh: () => "other",
  ja: () => "other",
  ko: () => "other",
  // English, German, Dutch, Italian, Spanish, Portuguese
  en: (count) => count === 1 ? "one" : "other",
  de: (count) => count === 1 ? "one" : "other",
  nl: (count) => count === 1 ? "one" : "other",
  it: (count) => count === 1 ? "one" : "other",
  es: (count) => count === 1 ? "one" : "other",
  pt: (count) => count === 0 || count === 1 ? "one" : "other",
  // French
  fr: (count) => count === 0 || count === 1 ? "one" : "other",
  // Russian, Ukrainian, Serbian
  ru: (count) => {
    const mod10 = count % 10;
    const mod100 = count % 100;
    if (mod10 === 1 && mod100 !== 11) return "one";
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "few";
    return "many";
  },
  uk: (count) => {
    const mod10 = count % 10;
    const mod100 = count % 100;
    if (mod10 === 1 && mod100 !== 11) return "one";
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "few";
    return "many";
  },
  // Polish
  pl: (count) => {
    if (count === 1) return "one";
    const mod10 = count % 10;
    const mod100 = count % 100;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "few";
    return "many";
  },
  // Czech, Slovak
  cs: (count) => {
    if (count === 1) return "one";
    if (count >= 2 && count <= 4) return "few";
    return "other";
  },
  sk: (count) => {
    if (count === 1) return "one";
    if (count >= 2 && count <= 4) return "few";
    return "other";
  },
  // Arabic
  ar: (count) => {
    if (count === 0) return "zero";
    if (count === 1) return "one";
    if (count === 2) return "two";
    const mod100 = count % 100;
    if (mod100 >= 3 && mod100 <= 10) return "few";
    if (mod100 >= 11 && mod100 <= 99) return "many";
    return "other";
  },
  // Hebrew
  he: (count) => {
    if (count === 1) return "one";
    if (count === 2) return "two";
    if (count > 10 && count % 10 === 0) return "many";
    return "other";
  },
  // Turkish, Azerbaijani
  tr: () => "other",
  az: () => "other",
  // Hindi
  hi: (count) => count === 0 || count === 1 ? "one" : "other"
};
class PluralizationEngine {
  constructor(separator = "_") {
    Object.defineProperty(this, "rules", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: /* @__PURE__ */ new Map()
    });
    Object.defineProperty(this, "defaultRule", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: () => "other"
    });
    Object.defineProperty(this, "separator", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "categoryCache", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: /* @__PURE__ */ new Map()
    });
    Object.defineProperty(this, "CACHE_MAX_SIZE", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 1e3
    });
    this.separator = separator;
    this.loadBuiltInRules();
  }
  /**
   * Load built-in plural rules
   */
  loadBuiltInRules() {
    Object.entries(PLURAL_RULES).forEach(([locale, rule]) => {
      this.rules.set(locale, rule);
    });
  }
  /**
   * Add custom plural rule for a locale
   */
  addRule(locale, rule) {
    const {
      language
    } = parseLocale(locale);
    this.rules.set(language, rule);
  }
  /**
   * Get plural rule for a locale
   */
  getRule(locale) {
    const {
      language
    } = parseLocale(locale);
    return this.rules.get(language) || this.defaultRule;
  }
  /**
   * Get plural category for a count in a locale
   */
  getCategory(count, locale) {
    const cacheKey = `${locale}:${count}`;
    let category = this.categoryCache.get(cacheKey);
    if (category === void 0) {
      const rule = this.getRule(locale);
      category = rule(count, locale);
      if (this.categoryCache.size < this.CACHE_MAX_SIZE) {
        this.categoryCache.set(cacheKey, category);
      }
    }
    return category;
  }
  /**
   * Select the appropriate plural form from a message object
   */
  selectPlural(messages, count, locale) {
    if (typeof messages === "string") {
      return messages;
    }
    const category = this.getCategory(count, locale);
    if (messages[category]) {
      return messages[category];
    }
    if (messages[String(count)]) {
      return messages[String(count)];
    }
    const fallbackChain = ["other", "many", "few", "two", "one", "zero"];
    for (const fallback of fallbackChain) {
      if (messages[fallback]) {
        return messages[fallback];
      }
    }
    const keys = Object.keys(messages);
    return keys.length > 0 ? messages[keys[0]] : "";
  }
  /**
   * Parse a plural message string into forms
   * Format: "one:item|few:items|many:items|other:items"
   * Or: "0:no items|1:one item|other:{{count}} items"
   */
  parsePluralString(message, separator = "|") {
    const forms = {};
    const parts = message.split(separator);
    for (const part of parts) {
      const colonIndex = part.indexOf(":");
      if (colonIndex > 0) {
        const key = part.substring(0, colonIndex).trim();
        const value = part.substring(colonIndex + 1).trim();
        forms[key] = value;
      } else {
        forms.other = part.trim();
      }
    }
    return forms;
  }
  /**
   * Format a plural message with count
   */
  format(message, count, locale, params) {
    const messages = typeof message === "string" && message.includes("|") ? this.parsePluralString(message) : message;
    const selected = this.selectPlural(messages, count, locale);
    let result = selected.replace(/\{\{count\}\}/g, String(count));
    result = result.replace(/\{\{n\}\}/g, String(count));
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
        result = result.replace(regex, String(value));
      });
    }
    return result;
  }
  /**
   * Check if a message contains plural forms
   */
  hasPluralForms(message, separator = "|") {
    if (!message || typeof message !== "string") return false;
    if (message.includes(separator)) {
      const parts = message.split(separator);
      return parts.some((part) => part.includes(":"));
    }
    return false;
  }
  /**
   * Extract all plural forms from a message
   */
  extractPluralForms(message, separator = "|") {
    if (!this.hasPluralForms(message, separator)) {
      return [message];
    }
    const forms = this.parsePluralString(message, separator);
    return Object.values(forms);
  }
  /**
   * Validate plural forms for a locale
   */
  validatePluralForms(message, locale) {
    const messages = typeof message === "string" ? this.parsePluralString(message) : message;
    if (!messages.other && Object.keys(messages).length > 0) {
      return Object.keys(messages).some((key) => !Number.isNaN(Number(key)));
    }
    return true;
  }
  /**
   * Get supported plural categories for a locale
   */
  getSupportedCategories(locale) {
    const {
      language
    } = parseLocale(locale);
    switch (language) {
      case "zh":
      case "ja":
      case "ko":
      case "tr":
      case "az":
        return ["other"];
      case "en":
      case "de":
      case "nl":
      case "it":
      case "es":
      case "pt":
      case "fr":
      case "hi":
        return ["one", "other"];
      case "ru":
      case "uk":
      case "pl":
        return ["one", "few", "many"];
      case "cs":
      case "sk":
        return ["one", "few", "other"];
      case "ar":
        return ["zero", "one", "two", "few", "many", "other"];
      case "he":
        return ["one", "two", "many", "other"];
      default:
        return ["one", "other"];
    }
  }
}

export { PluralizationEngine };
/*! End of @ldesign/i18n | Powered by @ldesign/builder */
//# sourceMappingURL=pluralization.js.map
