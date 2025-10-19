import { createGlobalState } from "@vueuse/core";

export const useSettings = createGlobalState(() => ({
    debugMode: ref(false),
    appMode: ref<'edit' | 'perform'>('edit'),
}));