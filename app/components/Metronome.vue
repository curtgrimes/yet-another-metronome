<script setup lang="ts">
import type { Metronome } from '~/types';
import MetronomeRectangle from './Metronome/Rectangle.vue';

const {
  showControls = true,
  showSettingsSectionOnly = undefined,
  initialPlayState = undefined,
} = defineProps<{
  showControls?: boolean
  showSettingsSectionOnly?: 'tempo-rhythm' | 'appearance'
  initialPlayState?: AnimationPlayState
}>();

const emit = defineEmits<{ beforeUnmount: [] }>();

const { appMode, playMetronomesInEditMode } = useSettings();

const metronome = defineModel<Metronome>();

const playState = ref<InstanceType<typeof MetronomeRectangle>['$props']['playState']>();

// Do not run metronomes in edit mode by default unless the setting is on
watch([appMode, playState, playMetronomesInEditMode], ([newAppMode]) => {
  playState.value = (newAppMode === 'edit' && !playMetronomesInEditMode.value) ? 'idle' : 'running';
});

onBeforeUnmount(() => {
  emit('beforeUnmount');
});
</script>

<template>
  <ClientOnly>
    <MetronomeRectangle
      v-if="metronome?.configuration.style.id === 'rectangle'"
      v-model="metronome"
      v-model:play-state="playState"
      :show-controls
      :show-settings-section-only
      :initial-play-state
    />
    <div
      v-else
      class="flex flex-col items-center justify-center gap-2 text-lg bg-gray-300/3 rounded-3xl mx-20 my-4 h-full w-full opacity-50 shadow-[0_0_50px_-5px_inset_#0001] max-w-3xl graph-paper"
    >
      <UIcon
        name="i-mingcute-alert-line"
        class="text-3xl"
      />
      Cannot display metronome
    </div>
  </ClientOnly>
</template>

<style lang="css" scoped>
@reference "~/assets/css/main.css";

.graph-paper {
  background-size: 12px 12px;
  background-image:
    linear-gradient(to right, var(--color-gray-100) 1px, transparent 1px),
    linear-gradient(to bottom, var(--color-gray-100) 1px, transparent 1px);
}
</style>
