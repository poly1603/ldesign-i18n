/**
 * Load locale messages utility
 */
import type { LocaleMessages } from '../../../types';
export declare function loadLocaleMessages(locale: string, loader: () => Promise<LocaleMessages> | LocaleMessages): Promise<LocaleMessages>;
