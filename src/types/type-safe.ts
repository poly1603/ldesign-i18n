/**
 * @ldesign/i18n - Type-Safe Translation Keys
 * Provides TypeScript type inference for translation keys
 */

/**
 * Extract all possible paths from a nested object type
 * e.g., { user: { name: string, age: number } } => 'user' | 'user.name' | 'user.age'
 */
export type NestedKeyOf<T> = T extends object
  ? {
    [K in keyof T & (string | number)]: K extends string
    ? T[K] extends object
    ? `${K}` | `${K}.${NestedKeyOf<T[K]>}`
    : `${K}`
    : never
  }[keyof T & (string | number)]
  : never;

/**
 * Extract the value type from a nested path
 */
export type PathValue<T, P extends string> = P extends keyof T
  ? T[P]
  : P extends `${infer K}.${infer R}`
  ? K extends keyof T
  ? PathValue<T[K], R>
  : never
  : never;

/**
 * Check if a path exists in the type
 */
export type PathExists<T, P extends string> = PathValue<T, P> extends never ? false : true;

/**
 * Type-safe translation key
 */
export type TranslationKey<T> = NestedKeyOf<T> extends never ? string : NestedKeyOf<T>;

/**
 * Type-safe translation function
 */
export type TypeSafeTranslationFunction<Messages> = {
  <K extends TranslationKey<Messages>>(
    key: K,
    params?: Record<string, any>
  ): string;

  // Fallback for dynamic keys
  (key: string, params?: Record<string, any>): string;
};

/**
 * Type-safe i18n interface with message type parameter
 */
export interface TypeSafeI18n<Messages = any> {
  t: TypeSafeTranslationFunction<Messages>;
  te: <K extends TranslationKey<Messages>>(key: K) => boolean;
  tm: <K extends TranslationKey<Messages>>(key: K) => any;

  // Allow fallback for runtime usage
  translate: (key: string, options?: any) => string;
  exists: (key: string, options?: any) => boolean;
}

/**
 * Helper to create type-safe i18n instance
 */
export type CreateTypeSafeI18n<Messages> = TypeSafeI18n<Messages>;

/**
 * Strict mode type that only allows defined keys (no fallback)
 */
export type StrictTranslationFunction<Messages> = <K extends TranslationKey<Messages>>(
  key: K,
  params?: Record<string, any>
) => string;

/**
 * Helper type to extract messages type from i18n instance
 */
export type ExtractMessagesType<T> = T extends TypeSafeI18n<infer M> ? M : never;

/**
 * Type guard to check if key exists in messages
 */
export function isValidTranslationKey<Messages>(
  messages: Messages,
  key: string
): key is TranslationKey<Messages> {
  const parts = key.split('.');
  let current: any = messages;

  for (const part of parts) {
    if (current === null || current === undefined || !(part in current)) {
      return false;
    }
    current = current[part];
  }

  return true;
}

/**
 * Get all available keys from messages object
 */
export function getAllTranslationKeys<Messages>(messages: Messages): TranslationKey<Messages>[] {
  const keys: string[] = [];

  function traverse(obj: any, prefix = ''): void {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const path = prefix ? `${prefix}.${key}` : key;
        keys.push(path);

        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          traverse(obj[key], path);
        }
      }
    }
  }

  traverse(messages);
  return keys as TranslationKey<Messages>[];
}

/**
 * Type-safe translation options
 */
export interface TypeSafeTranslateOptions<Messages, K extends TranslationKey<Messages>> {
  locale?: string;
  params?: PathValue<Messages, K> extends string ? Record<string, any> : never;
  defaultValue?: string;
  count?: number;
}

/**
 * Create a type-safe wrapper around an i18n instance
 */
export function createTypeSafeWrapper<Messages>(i18n: any): TypeSafeI18n<Messages> {
  return {
    t: ((key: string, params?: Record<string, any>) => {
      return i18n.t(key, params);
    }) as TypeSafeTranslationFunction<Messages>,

    te: (key: string) => {
      return i18n.exists(key);
    },

    tm: (key: string) => {
      const parts = key.split('.');
      const messages = i18n.getMessages(i18n.locale);
      let current: any = messages;

      for (const part of parts) {
        if (current && typeof current === 'object' && part in current) {
          current = current[part];
        } else {
          return undefined;
        }
      }

      return current;
    },

    translate: i18n.translate.bind(i18n),
    exists: i18n.exists.bind(i18n),
  };
}

/**
 * Example usage types for documentation
 */
export interface ExampleMessages {
  common: {
    hello: string;
    goodbye: string;
  };
  user: {
    profile: {
      name: string;
      age: string;
    };
    settings: {
      theme: string;
    };
  };
}

// Example of inferred types:
// TranslationKey<ExampleMessages> = 
//   'common' | 'common.hello' | 'common.goodbye' | 
//   'user' | 'user.profile' | 'user.profile.name' | 'user.profile.age' |
//   'user.settings' | 'user.settings.theme'


