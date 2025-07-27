<script setup lang="ts">
import type { Metronome, MetronomeStyleRectangle } from '~/types';

const metronome = defineModel<Metronome<MetronomeStyleRectangle>>({ required: true });

const { tick } = useMetronome(metronome);

const backgroundColor = (tick: boolean) => {
    return tick ? metronome.value.style.colorBackground : lighten(metronome.value.style.colorBackground, 80);
};

const textColor = (tick: boolean) => {
    // Parse hex color string to RGB array
    const hexValue = backgroundColor(tick).replace('#', '');
    const r = parseInt(hexValue.substring(0, 2), 16);
    const g = parseInt(hexValue.substring(2, 4), 16);
    const b = parseInt(hexValue.substring(4, 6), 16);

    // Relative luminance weights from the YIQ color model
    const redWeight = 0.299;
    const greenWeight = 0.587;
    const blueWeight = 0.114;

    // Perceived brightness calculation
    const brightness = r * redWeight + g * greenWeight + b * blueWeight;

    // Midpoint threshold to decide between black and white text
    const threshold = 128;

    return brightness > threshold ? 'text-black' : 'text-white';
};

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

</script>

<template>
    <MetronomeBase
        v-model="metronome"
        :text-color="textColor(tick)">
        <template #default>
            <div
                :style="{ backgroundColor: backgroundColor(tick) }"
                :class="['rounded-3xl w-full h-full flex items-center justify-center font-bold text-3xl shadow-[0_0_50px_-5px_inset_#0001]', textColor(tick)]"
            >
                {{ metronome.title }}
            </div>
        </template>
        <template #floating-settings>
            <MetronomeQuickSettingButton
                tooltip="Change color"
                :popover-props="{ content: { align: 'start' } }">
                <UIcon
                    name="i-ic-outline-palette"
                    data-palette-icon
                    mode="svg"
                    class="text-2xl transition-none"
                />
                <template #popover>
                    <div class="p-2">
                        <UColorPicker
                            v-model="metronome.style.colorBackground"
                            format="hex"
                            size="xs" />
                    </div>
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
</style>