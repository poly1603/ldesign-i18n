/**
 * Load locale messages utility
 */
export async function loadLocaleMessages(locale, loader) {
    const messages = await loader();
    return messages;
}
//# sourceMappingURL=loadLocaleMessages.js.map