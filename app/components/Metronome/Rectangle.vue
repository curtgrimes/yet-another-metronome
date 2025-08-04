<script setup lang="ts">
import type { Metronome, MetronomeStyleRectangle } from '~/types';
import { HueSlider } from 'vue-color';

const metronome = defineModel<Metronome<MetronomeStyleRectangle>>({ required: true });

const { showControls = true } = defineProps<{showControls?: boolean}>();

const { onTick, enabled, millisecondsBetweenTicks } = useMetronome(metronome);

const TICK_LENGTH_MS = 100;
const ticking = ref(false);

onTick(() => {
    ticking.value = true;
    

    setTimeout(() => ticking.value = false, TICK_LENGTH_MS);
});

const lighten = (hex: string, percent: number) => {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const r = (num >> 16) + amt;
    const g = (num >> 8 & 0x00FF) + amt;
    const b = (num & 0x0000FF) + amt;
    return '#' + (
        0x1000000 +
        (r < 255 ? (r < 1 ? 0 : r) : 255) * 0x10000 +
        (g < 255 ? (g < 1 ? 0 : g) : 255) * 0x100 +
        (b < 255 ? (b < 1 ? 0 : b) : 255)
    ).toString(16).slice(1);
};

const colorBackground = computed(() => metronome.value.configuration.style.colorBackground);
</script>

<template>
    <MetronomeBase
        v-model="metronome"
        text-classes="text-black dark:text-white"
        :show-controls
        :style="{
            '--side-to-side-duration': `${millisecondsBetweenTicks * 2}ms`,
            '--ticking-background-color': lighten(colorBackground, -20),
            '--ticking-background-color-dark-mode': lighten(colorBackground, 50),
            '--ticking-border-color': lighten(colorBackground, -40),
            '--ticking-border-color-dark-mode': lighten(colorBackground, 50),
            '--not-ticking-background-color': lighten(colorBackground, 70),
            '--not-ticking-background-color-dark-mode': lighten(colorBackground, -45),
            '--text-color': lighten(colorBackground, -30),
            '--text-color-dark-mode': lighten(colorBackground, 50),
        }"
    >
        <template #default>
            <div   
                v-if="enabled" 
                :class="['rounded-3xl relative w-full h-full flex items-center justify-center font-bold text-5xl shadow-[0_0_50px_-5px_inset_#0001] overflow-hidden text-[var(--text-color)] dark:text-[var(--text-color-dark-mode)]', metronome.state.paused && '!animate-none !bg-[var(--not-ticking-background-color)]']"
                data-animate-flash
            >
                <textarea
                    v-model="metronome.configuration.title"
                    :disabled="!showControls"
                    class="w-full mx-20 resize-none text-center field-sizing-content"
                />
                <div
                    ref="side-to-side-effect"
                    data-animate-side-to-side-indicator-parent
                    :class="['absolute will-change-transform inset-0 pointer-events-none', metronome.state.paused && '!animate-none translate-x-1/8']"
                    :style="{
                        '--width': 'calc(var(--spacing) * 4)'
                    }"
                >
                    <div
                        data-animate-side-to-side-indicator
                        :class="['absolute will-change-transform h-full left-0 w-4 bg-[var(--ticking-background-color)] opacity-60', metronome.state.paused && '!animate-none']"
                    />
                </div>
            </div>
        </template>
        <template #floating-settings>
            <MetronomeQuickSettingButton
                tooltip="Change color"
            >
                <UIcon
                    name="i-ic-outline-palette"
                    data-palette-icon
                    mode="svg"
                    class="text-2xl transition-none"
                />
                <template #popover>
                    <ColorInput v-model="metronome.configuration.style.colorBackground" />
                </template>
            </MetronomeQuickSettingButton>
        </template>
    </MetronomeBase>
</template>


<style lang="css" scoped>
@reference "~/assets/css/main.css";

:deep([data-palette-icon] circle:nth-of-type(1)) {
    @apply fill-red-500;
}

:deep([data-palette-icon] circle:nth-of-type(2)) {
    @apply fill-orange-400;
}

:deep([data-palette-icon] circle:nth-of-type(3)) {
    @apply fill-green-400;
}

:deep([data-palette-icon] circle:nth-of-type(4)) {
    @apply fill-blue-400;
}

@keyframes flash {
  0%, 50% {
    background-color: var(--ticking-background-color);
    box-shadow:
        0 0 0 5px inset var(--ticking-border-color),
        0 0 0 10px inset var(--not-ticking-background-color);
  }

  30%, 49%, 80%, 100% {
    box-shadow: none;
  }

  10%, 49%, 60%, 100% {
    background-color: var(--not-ticking-background-color);
  }
}

@keyframes side-to-side-parent {
  0%, 3%, 100% {
    transform: translateX(0%);
  }
  50%, 53% {
    transform: translateX(100%);
  }
}

@keyframes side-to-side {
  0%, 3%, 100% {
    transform: translateX(0%);
  }
  50%, 53% {
    transform: translateX(-100%);
  }
}

@media (prefers-color-scheme: dark) {
  [data-animate-flash] {
    --ticking-background-color: var(--ticking-background-color-dark-mode);
    --not-ticking-background-color: var(--not-ticking-background-color-dark-mode);
    --ticking-border-color: var(--ticking-border-color-dark-mode);
  }
}

[data-animate-flash] {
    animation: flash var(--side-to-side-duration) linear infinite;
}

[data-animate-side-to-side-indicator-parent] {
    animation: side-to-side-parent var(--side-to-side-duration) linear infinite;
}

[data-animate-side-to-side-indicator] {
    animation: side-to-side var(--side-to-side-duration) linear infinite;
}
</style>