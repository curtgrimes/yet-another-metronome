import { createGlobalState } from "@vueuse/core";

/**
 * Keep track of metronomes that are visible on the main screen, to help with
 * keeping only one instance of these mounted at a time so the view transition
 * works.
 */
export const useMetronomesVisibleOnMainScreen = createGlobalState(() => ({
    metronomeIdsVisibleOnMainScreen: ref<number[]>(),
}));