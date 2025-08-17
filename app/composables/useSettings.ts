import { createGlobalState } from "@vueuse/core";

export const useSettings = createGlobalState(() => ({
    debugMode: ref(true),
}));