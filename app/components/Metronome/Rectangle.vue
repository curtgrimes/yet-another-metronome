<script setup lang="ts">
import type { Metronome, MetronomeStyleRectangle } from '~/types';

const metronome = defineModel<Metronome<MetronomeStyleRectangle>>({ required: true });

/**
 * The current animation progress as a number between 0 and 1.
 */
const currentAnimationProgress = defineModel<number>('current-animation-progress', { default: 0 });


/**
 * Whether or not this metronome is playing and not paused.
 */
const playStateVModel = defineModel<AnimationPlayState>('playState', { default: 'idle' });

const {
    showControls = true,
    showSettingsSectionOnly = undefined,
} = defineProps<{
    showControls?: boolean,
    showSettingsSectionOnly?: 'tempo-rhythm' | 'appearance';
}>();

const { onTick, enabled, millisecondsPerBeat } = useMetronome(metronome);

const TICK_LENGTH_MS = 100;
const ticking = ref(false);

onTick(() => {
    ticking.value = true;
    setTimeout(() => ticking.value = false, TICK_LENGTH_MS);
});

const lighten = (hex: string, percent: number, maximumBrightness = 1) => {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    let r = (num >> 16) + amt;
    let g = (num >> 8 & 0x00FF) + amt;
    let b = (num & 0x0000FF) + amt;

    // Clamp values to [0,255]
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));

    // Enforce maximum brightness if specified
    if (maximumBrightness < 1) {
        // Calculate perceived brightness (0-1)
        const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        if (brightness > maximumBrightness) {
            // Scale down RGB to match maximumBrightness
            const scale = maximumBrightness / brightness;
            r = Math.round(r * scale);
            g = Math.round(g * scale);
            b = Math.round(b * scale);
        }
    }

    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

const colorBackground = computed(() => metronome.value.configuration.style.colorBackground);

const flashingEffectEl = useTemplateRef<HTMLDivElement>('flashingEffectEl');
const sideToSideEffectParentEl = useTemplateRef<HTMLDivElement>('sideToSideEffectParentEl');
const sideToSideEffectEl = useTemplateRef<HTMLDivElement>('sideToSideEffectEl');

const tickingBg = 'var(--ticking-background-color)';
const notTickingBg = 'var(--not-ticking-background-color)';
const tickingShadow = `
  0 0 0 5px inset var(--ticking-border-color),
  0 0 0 10px inset var(--not-ticking-background-color)
`;
const noShadow = '0 0 0 2px inset var(--border-color)';

const tickingTextColor = notTickingBg;
const notTickingTextColor = 'var(--not-ticking-text-color)';

const {
    play,
    pause,
    finish,
    currentTime,
    animates,
    playbackRate,
    playState,
} = useAnimateGroup(
    [
        // All these keyframes are TWO beats long.

        // Flashing effect
        [
            flashingEffectEl,
            [
                { offset: 0,    backgroundColor: tickingBg,    boxShadow: tickingShadow, color: tickingTextColor },
                { offset: 0.1,  backgroundColor: notTickingBg, boxShadow: tickingShadow, color: notTickingTextColor },
                { offset: 0.3,  backgroundColor: notTickingBg, boxShadow: noShadow, color: notTickingTextColor },
                { offset: 0.49999999, backgroundColor: notTickingBg, boxShadow: noShadow, color: notTickingTextColor },
                { offset: 0.5,  backgroundColor: tickingBg,    boxShadow: tickingShadow, color: tickingTextColor },
                { offset: 0.6,  backgroundColor: notTickingBg, boxShadow: tickingShadow, color: notTickingTextColor },
                { offset: 0.8,  backgroundColor: notTickingBg, boxShadow: noShadow, color: notTickingTextColor },
                { offset: 1,    backgroundColor: notTickingBg, boxShadow: noShadow, color: notTickingTextColor },
            ],
        ],

        // Side-to-side parent
        [
            sideToSideEffectParentEl,
            [
                { transform: 'translateX(0%)',   offset: 0 },
                { transform: 'translateX(0%)',   offset: 0.03 },
                { transform: 'translateX(100%)', offset: 0.5 },
                { transform: 'translateX(100%)', offset: 0.53 },
                { transform: 'translateX(0%)',   offset: 1 },
            ],
        ],

        // Side-to-side child
        [
            sideToSideEffectEl,
            [
                { transform: 'translateX(0%)',   offset: 0 },
                { transform: 'translateX(0%)',   offset: 0.03 },
                { transform: 'translateX(-100%)', offset: 0.5 },
                { transform: 'translateX(-100%)', offset: 0.53 },
                { transform: 'translateX(0%)',   offset: 1 },
            ],
        ],
    ],
    {
        immediate: true,
        iterations: Infinity,
        // duration gets set via effect.updateTiming()
    },
);


watch(playStateVModel, (newPlayStateVModel) => {
    switch(newPlayStateVModel) {
    case 'running':
        play();
        break;
    case 'paused':
    case 'idle':
        pause();
        break;
    case 'finished': 
        finish();
        break;
    default:
        console.warn(`Unknown play state: ${newPlayStateVModel}`);
    }
});

watch(playState, newPlayState => {
    playStateVModel.value = newPlayState;
}, { immediate:true });

// Handle BPM changes
watch(() => [animates.value, millisecondsPerBeat.value], () => {
    animates.value.forEach(animation => 
        animation?.effect?.updateTiming({
            // Each animation is 2 beats long, so we multiply the
            // millisecondsPerBeat by 2
            duration: millisecondsPerBeat.value * 2,
        }));
});

watch(currentTime, (newCurrentTime = 0) => {
    const timeInMilliseconds = Number(newCurrentTime) || 0;
    const beatLengthInMilliseconds = millisecondsPerBeat.value;
    const twoBeatLengthInMilliseconds = beatLengthInMilliseconds * 2;
    const epsilon = 1e-9;

    // Use a two-beat window. If we're within epsilon of a two-beat boundary, show 1
    // instead of 0 so dragging the slider fully right keeps 1 and doesn't snap to 0.
    currentAnimationProgress.value =
    Math.abs(timeInMilliseconds % twoBeatLengthInMilliseconds) < epsilon && timeInMilliseconds !== 0
        ? 1
        : (timeInMilliseconds % twoBeatLengthInMilliseconds) / twoBeatLengthInMilliseconds;
});

watch(currentAnimationProgress, (newProgress = 0) => {
    const twoBeats = millisecondsPerBeat.value * 2;
    const desired = newProgress * twoBeats;
    const epsilon = 0.25; // ms tolerance; adjust as needed

    const current = Number(currentTime.value ?? 0);
    if (Math.abs(current - desired) < epsilon) return;

    currentTime.value = desired;
});


watch(() => metronome.value.state.playbackRate, (newPlaybackRate) => {
    playbackRate.value = newPlaybackRate;
});

const { debugMode } = useSettings();

let onTitleInputTimeout: ReturnType<typeof setTimeout>;
const onTitleInput = (event: Event)=> {
    // Check, after a delay, if the title has been changed to a string in the
    // format ""<n> BPM" but with a different <n> than the current BPM, meaning
    // the user is trying to set the BPM through changing the title:
    clearTimeout(onTitleInputTimeout);
    onTitleInputTimeout = setTimeout(
        () => {
            const target = event.target as HTMLTextAreaElement;
            const title = target.value.trim();
            const match = title.match(/^(?<bpm>\d+)\s*BPM$/i);
            const bpm = match?.groups?.bpm ? parseInt(match.groups.bpm, 10) : NaN;
            if (!isNaN(bpm) && bpm > 0 && bpm !== metronome.value.configuration.bpm) {
                metronome.value.state.showBpmSettingHintForBpm = bpm;
            }
        }, 
        500,
    );
};
</script>

<template>
    <MetronomeBase
        v-model="metronome"
        text-classes="text-black dark:text-white"
        :show-controls
        :show-settings-section-only
        :style="{
            '--ticking-background-color': lighten(colorBackground, -20, 0.5),
            '--ticking-background-color-dark-mode': lighten(colorBackground, 60),

            '--ticking-border-color': lighten(colorBackground, -40),
            '--ticking-border-color-dark-mode': lighten(colorBackground, 50),

            '--not-ticking-background-color': lighten(colorBackground, 50),
            '--not-ticking-background-color-dark-mode': lighten(colorBackground, -45, 0.4),

            '--not-ticking-text-color': lighten(colorBackground, -30, 0.4),
            '--not-ticking-text-color-dark-mode': lighten(colorBackground, 50),

            '--border-color': 'rgba(0,0,0,0.08)',
            '--border-color-dark-mode': lighten(colorBackground, 20),
        }"
        class="
            dark:![--ticking-background-color:var(--ticking-background-color-dark-mode)]
            dark:![--ticking-border-color:var(--ticking-border-color-dark-mode)]
            dark:![--not-ticking-background-color:var(--not-ticking-background-color-dark-mode)]
            dark:![--border-color:var(--border-color-dark-mode)]
            dark:![--not-ticking-text-color:var(--not-ticking-text-color-dark-mode)]
        "
    >
        <template #default>
            <div   
                v-if="enabled"
                ref="flashingEffectEl"
                :class="['rounded-3xl relative w-full h-full flex items-center justify-center font-bold text-5xl shadow-[0_0_50px_-5px_inset_#0001] overflow-hidden']"
            >
                <div
                    v-if="debugMode"
                    class="absolute top-8 left-8 text-xs font-mono rounded text-[var(--ticking-background-color)] bg-elevated/80 p-2"
                >
                    <!-- Debug tools -->
                    millisecondsPerBeat: {{ millisecondsPerBeat.toFixed(2) }}<br>
                    currentTime: {{ Number(currentTime).toFixed(2) }}<br>
                    currentAnimationProgress: {{ Number(currentAnimationProgress).toFixed(3) }}<br>
                    playState: {{ playState }}<br>
                    playbackRate: {{ playbackRate }}<br>
                    visibleInMainView: {{ metronome.state.visibleInMainView }}<br>
                </div>
                <textarea
                    v-model="metronome.configuration.title"
                    :disabled="!showControls"
                    :class="[
                        `w-full
                        mx-20
                        resize-none
                        text-center
                        p-4
                        rounded-xl
                        field-sizing-content`,
                        showControls && `focus:outline-4
                        hover:outline-4
                        hover:outline-[var(--ticking-background-color)]/30 
                        focus:outline-[var(--ticking-background-color)]/70 
                        hover:outline-dashed
                        focus:outline-dashed
                        selection:bg-[var(--ticking-background-color)]
                        selection:text-[var(--not-ticking-background-color)]`
                    ]"
                    @input="onTitleInput"
                />
                <div
                    ref="sideToSideEffectParentEl"
                    data-animate-side-to-side-indicator-parent
                    :class="['absolute will-change-transform inset-0 pointer-events-none']"
                    :style="{
                        '--width': 'calc(var(--spacing) * 4)'
                    }"
                >
                    <div
                        data-animate-side-to-side-indicator
                        :class="['absolute will-change-transform h-full left-0 w-4 bg-[var(--ticking-background-color)] opacity-60']"
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
                    <div class="p-2">
                        <ColorInput v-model="metronome.configuration.style.colorBackground" />
                    </div>
                </template>
            </MetronomeQuickSettingButton>
        </template>
        <template #settings-section-tempo-rhythm/>
        <template #settings-section-appearance>
            <EditField label="Color">
                <ColorInput v-model="metronome.configuration.style.colorBackground" />
            </EditField>
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
</style>