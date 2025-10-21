/**
 * useI18nAsync - Async loading hook
 */
import { onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from './useI18n';
export function useI18nAsync(options = {}) {
    const { locale, mergeLocaleMessage } = useI18n();
    const loading = ref(false);
    const error = ref(null);
    const ready = ref(false);
    let abortController = null;
    const loadMessages = async (targetLocale) => {
        if (!options.loader) {
            console.warn('[useI18nAsync] No loader provided');
            return;
        }
        // Cancel previous request if exists
        if (abortController) {
            abortController.abort();
        }
        abortController = new AbortController();
        loading.value = true;
        error.value = null;
        try {
            const messages = await options.loader(targetLocale);
            // Check if request was aborted
            if (!abortController.signal.aborted) {
                mergeLocaleMessage(targetLocale, messages);
                ready.value = true;
            }
        }
        catch (err) {
            if (err?.name !== 'AbortError') {
                error.value = err;
                console.error('[useI18nAsync] Failed to load messages:', err);
            }
        }
        finally {
            loading.value = false;
            abortController = null;
        }
    };
    onMounted(() => {
        if (options.loadLocale) {
            const targetLocale = options.locale || locale.value;
            loadMessages(targetLocale);
        }
    });
    // Cleanup on unmount
    onUnmounted(() => {
        if (abortController) {
            abortController.abort();
            abortController = null;
        }
    });
    return {
        loading,
        error,
        ready,
        loadMessages
    };
}
//# sourceMappingURL=useI18nAsync.js.map