/**
 * useTranslation - Simplified translation hook
 */
import type { InterpolationParams, MessageKey } from '../../../types';
export interface UseTranslationOptions {
    namespace?: string;
}
export interface UseTranslationReturn {
    t: (key: MessageKey, params?: InterpolationParams) => string;
    tc: (key: MessageKey, count: number, params?: InterpolationParams) => string;
    te: (key: MessageKey) => boolean;
    locale: string;
    ready: boolean;
}
export declare function useTranslation(namespace?: string): UseTranslationReturn;
