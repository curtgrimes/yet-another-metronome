import { createGlobalState } from '@vueuse/core';

export const useSettings = createGlobalState(() => ({
  debugMode: ref(true),
  appMode: ref<'edit' | 'perform'>('edit'),
  playMetronomesInEditMode: ref(false),
}));
