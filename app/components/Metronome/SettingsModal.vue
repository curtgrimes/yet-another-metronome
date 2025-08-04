<script setup lang="ts">
import type { Metronome } from '~/types';

defineProps<{
//   metronome: Metronome
}>();

const open = defineModel<boolean>('open');
</script>

<template>
    <UModal
        title="Hello World"
        :open
        @update:open="open = $event"
    >
        <slot />
        <template #body>
            Hello World
            <slot name="metronome-preview" />
        </template>
        <template #footer>
            <div class="flex gap-2">
                <UButton
                    color="neutral"
                    label="Dismiss"
                    @click="open = false"
                />
                <UButton
                    label="Success"
                    @click="open = false"
                />
            </div>
        </template>
    </UModal>
</template>
