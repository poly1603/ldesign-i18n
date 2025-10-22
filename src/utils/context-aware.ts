/**
 * @ldesign/i18n - Context-Aware Translations
 * Support for gender, formality, audience-specific translations
 */

import type { Locale, MessageKey, Messages } from '../types';

/**
 * Translation context
 */
export interface TranslationContext {
  gender?: 'male' | 'female' | 'neutral' | 'other';
  formality?: 'formal' | 'informal' | 'casual';
  audience?: 'child' | 'teen' | 'adult' | 'senior';
  tone?: 'professional' | 'friendly' | 'humorous' | 'serious';
}

/**
 * Context-aware message structure
 */
export type ContextualMessages = {
  [key: string]: string | ContextualVariants | ContextualMessages;
};

/**
 * Contextual variants for a single message
 */
export interface ContextualVariants {
  default: string;
  male?: string;
  female?: string;
  neutral?: string;
  formal?: string;
  informal?: string;
  child?: string;
  teen?: string;
  adult?: string;
  [key: string]: string | undefined;
}

/**
 * Context resolver for translations
 */
export class ContextResolver {
  /**
   * Resolve context-aware translation
   */
  resolve(
    message: string | ContextualVariants | any,
    context?: TranslationContext
  ): string {
    // Simple string - return as is
    if (typeof message === 'string') {
      return message;
    }

    // Not an object - convert to string
    if (!message || typeof message !== 'object') {
      return String(message);
    }

    // Check if it's a contextual variants object
    if (!this.isContextualVariants(message)) {
      return String(message);
    }

    const variants = message as ContextualVariants;

    // No context provided - return default
    if (!context) {
      return variants.default || '';
    }

    // Try to find best matching variant
    const variant = this.findBestVariant(variants, context);
    return variant || variants.default || '';
  }

  /**
   * Check if object is contextual variants
   */
  private isContextualVariants(obj: any): boolean {
    return (
      typeof obj === 'object' &&
      'default' in obj &&
      typeof obj.default === 'string'
    );
  }

  /**
   * Find best matching variant for context
   */
  private findBestVariant(
    variants: ContextualVariants,
    context: TranslationContext
  ): string | undefined {
    // Priority order: gender > formality > audience > tone

    // 1. Try gender-specific variant
    if (context.gender && variants[context.gender]) {
      return variants[context.gender];
    }

    // 2. Try formality-specific variant
    if (context.formality && variants[context.formality]) {
      return variants[context.formality];
    }

    // 3. Try audience-specific variant
    if (context.audience && variants[context.audience]) {
      return variants[context.audience];
    }

    // 4. Try tone-specific variant
    if (context.tone && variants[context.tone]) {
      return variants[context.tone];
    }

    // 5. Fall back to default
    return undefined;
  }

  /**
   * Create contextual message structure
   */
  static createContextualMessage(variants: {
    default: string;
    [context: string]: string;
  }): ContextualVariants {
    if (!variants.default) {
      throw new Error('Contextual message must have a default variant');
    }
    return variants as ContextualVariants;
  }

  /**
   * Validate contextual messages
   */
  static validateContextualMessages(messages: ContextualMessages): boolean {
    const validate = (obj: any): boolean => {
      if (typeof obj === 'string') {
        return true;
      }

      if (typeof obj !== 'object' || !obj) {
        return false;
      }

      // Check if it's a variants object
      if ('default' in obj && typeof obj.default === 'string') {
        return true;
      }

      // Recursively validate nested messages
      return Object.values(obj).every(val => validate(val));
    };

    return validate(messages);
  }
}

/**
 * Context-aware translation helper
 */
export class ContextAwareTranslator {
  private readonly resolver = new ContextResolver();
  private defaultContext?: TranslationContext;

  constructor(defaultContext?: TranslationContext) {
    this.defaultContext = defaultContext;
  }

  /**
   * Translate with context
   */
  translate(
    message: string | ContextualVariants | any,
    context?: TranslationContext
  ): string {
    const effectiveContext = {
      ...this.defaultContext,
      ...context
    };

    return this.resolver.resolve(message, effectiveContext);
  }

  /**
   * Set default context
   */
  setDefaultContext(context: TranslationContext): void {
    this.defaultContext = context;
  }

  /**
   * Get default context
   */
  getDefaultContext(): TranslationContext | undefined {
    return this.defaultContext;
  }

  /**
   * Clear default context
   */
  clearDefaultContext(): void {
    this.defaultContext = undefined;
  }
}

/**
 * Create context-aware translator
 */
export function createContextAwareTranslator(
  defaultContext?: TranslationContext
): ContextAwareTranslator {
  return new ContextAwareTranslator(defaultContext);
}

/**
 * Helper to create contextual messages
 */
export function contextual(variants: {
  default: string;
  [context: string]: string;
}): ContextualVariants {
  return ContextResolver.createContextualMessage(variants);
}

/**
 * Example usage types for documentation
 */
export interface ExampleContextualMessages {
  welcome: ContextualVariants;
  greeting: {
    morning: ContextualVariants;
    evening: string;
  };
}

// Example:
// const messages: ExampleContextualMessages = {
//   welcome: contextual({
//     default: "Welcome!",
//     male: "Welcome, sir!",
//     female: "Welcome, madam!",
//     formal: "We welcome you.",
//     informal: "Hey there!",
//     child: "Hi friend!"
//   }),
//   greeting: {
//     morning: contextual({
//       default: "Good morning!",
//       formal: "Good morning. How may I assist you?",
//       informal: "Morning!"
//     }),
//     evening: "Good evening!"
//   }
// };


