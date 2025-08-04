<script setup lang="ts">
import { HueSlider } from 'vue-color';

const colorBackground = defineModel<string>({ required: true });

const hexToHue = (hex: string): number => {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) {
        hex = hex.split('').map(c => c + c).join('');
    }

    const r = parseInt(hex.slice(0, 2), 16) / 255;
    const g = parseInt(hex.slice(2, 4), 16) / 255;
    const b = parseInt(hex.slice(4, 6), 16) / 255;

    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0;

    if (max !== min) {
        const d = max - min;
        switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)); break;
        case g: h = ((b - r) / d + 2); break;
        case b: h = ((r - g) / d + 4); break;
        }
        h *= 60;
    }

    return Math.round(h);
};

const hslToHexWithNiceSaturatedColors = (hue: number): string => {
    const s = 0.75;
    const l = 0.5 + 0.1 * Math.sin(hue * Math.PI / 180);

    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => {
        const k = (n + hue / 30) % 12;
        const c = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(c * 255).toString(16).padStart(2, '0');
    };

    return `#${f(0)}${f(8)}${f(4)}`;
};
</script>

<template>
    <div class="p-2 w-50 flex [&_.picker]:!mt-0.5">
        <HueSlider
            :model-value="hexToHue(colorBackground)"
            @update:model-value="($event: number) => colorBackground = hslToHexWithNiceSaturatedColors($event)"
        /></div>
</template>