<script setup lang="ts">
import type { Metronome, TimeSignature } from '~/types';

const metronome = defineModel<Metronome>({ required: true });

defineProps<{
  textColor?: 'text-black' | 'text-white';
}>();

const { tick } = useMetronome(metronome);

const isCurrentlySelected = (timeSignature: TimeSignature) => {
    return timeSignature[0] === metronome.value.timeSignature[0] && timeSignature[1] === metronome.value.timeSignature[1];
};
</script>

<template>
    <div :class="['w-full h-full max-w-3xl min-h-3xl max-h-[70%] relative group/metronome-base', textColor]">
        <div
            data-quick-setting-buttons-container
            class="absolute top-0 py-3 right-3 bottom-0 overflow-y-auto flex flex-col items-end opacity-50 group-hover/metronome-base:opacity-100 has-focus-within:opacity-100 group-hover/metronome-base:grayscale-0 has-[[aria-expanded='true']]:opacity-100 grayscale-100 has-[[aria-expanded='true']]:grayscale-0 gap-0.5 has-focus-within:grayscale-0">
            <MetronomeQuickSettingButton tooltip="Change tempo">
                <div class="flex flex-col">
                    {{ metronome.bpm }}
                    <span class="font-normal text-[9px]">BPM</span>
                </div>
                <template #popover>
                    <UInputNumber
                        v-model="metronome.bpm"
                        :ui="{ base: 'w-30' }" />
                </template>
            </MetronomeQuickSettingButton>
            <MetronomeQuickSettingButton tooltip="Change time signature">
                <TimeSignature :time-signature="metronome.timeSignature" />
                <template #popover>
                    <div class="p-2 flex gap-2">
                        <UButton
                            v-for="timeSignature in [[3, 4], [4, 4], [6, 8]] as TimeSignature[]"
                            :key="timeSignature.join(',')"
                            :variant="isCurrentlySelected(timeSignature) ? 'soft' : 'ghost'"
                            :color="isCurrentlySelected(timeSignature) ? 'primary' : 'neutral'"
                            @click="metronome.timeSignature = timeSignature">
                            <TimeSignature :time-signature />
                        </UButton>
                    </div>
                </template>
            </MetronomeQuickSettingButton>
            <slot name="floating-settings" />
        </div>
        <slot :tick />
    </div>
</template>