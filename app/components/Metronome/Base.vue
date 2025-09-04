<script setup lang="ts">
import type { ContextMenuItem } from '@nuxt/ui';
import { useElementVisibility, useKeyModifier } from '@vueuse/core';
import type { Metronome } from '~/types';

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

// Set the metronome.configuration.title to "<n> BPM"
watch(() => metronome.value.configuration.bpm, (newBpm, oldBpm) => {
    const title = metronome.value.configuration.title ?? '';
    // Only update if title looks like "<n> BPM" or is empty. Otherwise, the user customized it,
    // so leave it at the user-customized value.
    const oldTitle = `${oldBpm} BPM`;
    const newTitle = `${newBpm} BPM`;
    if (title.toLowerCase() === oldTitle.toLowerCase() || title.trim() === '') {
        metronome.value.configuration.title = newTitle;
    }
}, { immediate: true });

const altPressed = useKeyModifier('Alt');

const { debugMode } = useSettings();

const contextMenuItems = computed<ContextMenuItem>(() => ([
    {
        label: 'Edit',
        icon: 'i-lucide-pencil',
    },
    ...(altPressed.value || debugMode.value
        ? 
        [
            {
                type: 'separator',
            },
            {
                label: 'Debug mode',
                type: 'checkbox',
                icon: 'material-symbols:bug-report-outline-rounded',
                checked: debugMode.value,
                onSelect: () => {
                    debugMode.value = !debugMode.value;
                },
                onUpdateChecked: (checked: boolean) => {
                    console.log('Debug mode toggled:', checked);
                    debugMode.value = checked;
                },
            },
        ]
        : []
    ),
]));

const metronomeBase = useTemplateRef<HTMLElement | null>('metronome-base');
const quickSettingButtonsOverflowObserver = useTemplateRef<HTMLElement | null>('quick-setting-buttons-overflow-observer');
const buttonsNotOverflowing = useElementVisibility(quickSettingButtonsOverflowObserver, {
    rootMargin: '-10px 0px -10px 0px',
    scrollTarget: metronomeBase,
});
const buttonsOverflowing = computed(() => !buttonsNotOverflowing.value);
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
        ref="metronome-base"
        :class="['w-full h-full relative group/metronome-base', textClasses]"
        :style="{viewTransitionName: 'metronome-base'}"
    >
        <UContextMenu
            :items="contextMenuItems"
        >
            <div class="w-full h-full">
                <slot  />
            </div>
        </UContextMenu>

        <div
            v-if="showControls"
            data-quick-setting-buttons-container
            class="absolute top-0 py-4 right-4 bottom-0 overflow-y-auto flex flex-col items-end opacity-50 group-hover/metronome-base:opacity-100 has-focus-within:opacity-100 group-hover/metronome-base:grayscale-0 has-[[aria-expanded='true']]:opacity-100 grayscale-100 has-[[aria-expanded='true']]:grayscale-0 gap-0.5 has-focus-within:grayscale-0 z-10"
        >
            <template v-if="buttonsNotOverflowing">
                <UPopover
                    :open="
                        metronome.state.showBpmSettingHintForBpm !== undefined
                            && metronome.configuration.bpm !== metronome.state.showBpmSettingHintForBpm
                    "
                    arrow
                    :dismissible="false"
                    :content="{ side: 'left' }"
                    :ui="{content: 'bg-elevated'}"
                >
                    <MetronomeQuickSettingButton
                        tooltip="Change tempo"
                        color="primary"
                        :class="metronome.state.showBpmSettingHintForBpm !== undefined && 'bg-default border-primary'"
                        class="rounded-tr-6xl"
                    >
                        <div class="flex flex-col">
                            {{ metronome.configuration.bpm }}
                            <span class="font-normal text-[9px]">BPM</span>
                        </div>
                        <template #popover>
                            <BPMInput v-model="metronome.configuration.bpm" />
                        </template>
                    </MetronomeQuickSettingButton>

                    <template #content>
                        <div class="p-2 text-sm">
                            <UButton
                                icon="material-symbols:close-rounded"
                                variant="link"
                                color="neutral"
                                size="sm"
                                class="float-right"
                                @click="metronome.state.showBpmSettingHintForBpm = undefined"
                            />
                            <p>You can change the tempo here.</p>
                            <UButton
                                variant="soft"
                                @click="
                                    if (metronome.state.showBpmSettingHintForBpm) {
                                        metronome.configuration.bpm = metronome.state.showBpmSettingHintForBpm;
                                        metronome.state.showBpmSettingHintForBpm = undefined;
                                    }
                                "
                            >Change to {{ metronome.state.showBpmSettingHintForBpm }} BPM</UButton>
                        </div>
                    </template>
                </UPopover>
                <slot name="floating-settings" />
            </template>
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
            <div
                v-if="buttonsOverflowing"
                class="h-80"
            />
            <div ref="quick-setting-buttons-overflow-observer" />
        </div>
    </div>
</template>