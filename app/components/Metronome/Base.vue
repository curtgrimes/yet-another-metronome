<script setup lang="ts">
import type { Metronome, TimeSignature } from '~/types';

const metronome = defineModel<Metronome>({ required: true });

const {
    showControls = true,
    textClasses = '',
    showSettingsSectionOnly = undefined,
} = defineProps<{
  textClasses?: string;
  showControls?: boolean;
  showSettingsSectionOnly?: 'tempo-rhythm' | 'appearance';
}>();

const showSettingsModal = ref(false);
const showMetronomeInSettingsModalOnly = ref(false);
watch(showSettingsModal, () => {
    showMetronomeInSettingsModalOnly.value = showSettingsModal.value;
});

const router = useRouter();

const handleViewTransition = (to: string) => {
    if ('startViewTransition' in document) {
        document.startViewTransition(() => router.push(to));
    } else {
        router.push(to);
    }
};
</script>

<template>
    <div v-if="showSettingsSectionOnly === 'tempo-rhythm'">
        <slot
            name="settings-section-tempo-rhythm"
        />
    </div>
    <div v-else-if="showSettingsSectionOnly === 'appearance'">
        <slot
            name="settings-section-appearance"
        />
    </div>
    <div
        v-else
        :class="['w-full h-full max-w-3xl min-h-3xl max-h-[70%] relative group/metronome-base', textClasses]"
        :style="{viewTransitionName: 'metronome-base'}"
    >
        <slot  />

        <div
            v-if="showControls"
            data-quick-setting-buttons-container
            class="absolute top-0 py-3 right-3 bottom-0 overflow-y-auto flex flex-col items-end opacity-50 group-hover/metronome-base:opacity-100 has-focus-within:opacity-100 group-hover/metronome-base:grayscale-0 has-[[aria-expanded='true']]:opacity-100 grayscale-100 has-[[aria-expanded='true']]:grayscale-0 gap-0.5 has-focus-within:grayscale-0 z-10"
        >
            <MetronomeQuickSettingButton tooltip="Change tempo">
                <div class="flex flex-col">
                    {{ metronome.configuration.bpm }}
                    <span class="font-normal text-[9px]">BPM</span>
                </div>
                <template #popover>
                    <BPMInput v-model="metronome.configuration.bpm" />
                </template>
            </MetronomeQuickSettingButton>
            <slot name="floating-settings" />
            <NuxtLink
                to="/metronomes/0/edit"
                @click.prevent="handleViewTransition('/metronomes/0/edit')"
            >
                <MetronomeQuickSettingButton
                    tooltip="More settings"
                >
                    <UIcon
                        name="i-mingcute-more-1-fill"
                        data-palette-icon
                        mode="svg"
                        class="text-2xl transition-none"
                    />
                </MetronomeQuickSettingButton>
            </NuxtLink>
        </div>
    </div>
</template>