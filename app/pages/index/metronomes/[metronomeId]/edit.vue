<script setup lang="ts">
import type { ContextMenuItem } from '@nuxt/ui';

const router = useRouter();
const route = useRoute();
const { metronomes } = useMetronomes();


const handleViewTransition = (to: string) => {
    router.push(to);
    return;
};

onMounted(() => {
    const maybeMetronomeId = Number(route.params.metronomeId);
    if (route.params.metronomeId && !Number.isNaN(maybeMetronomeId) && metronomes.value[maybeMetronomeId]) {
        metronomes.value[maybeMetronomeId].state.visibleInMainView = false;
    }
});

const activeSections = ref(['0', '1']);

/**
 * The current animation progress as a number between 0 and 1.
 */
const currentAnimationProgress = ref<number>(0);

const items = computed<ContextMenuItem[]>(() => [
    {
        label: 'Play',
        icon: 'i-material-symbols-play-arrow-rounded',
        disabled: playState.value === 'running',
        onSelect() {
            playState.value = 'running';
        },
    },
    {
        label: 'Pause',
        icon: 'i-material-symbols-pause-rounded',
        disabled: playState.value !== 'running',
        onSelect() {
            playState.value = 'paused';
        },
    },
    {
        type: 'separator',
    },
    {
        label: 'Slow',
        type: 'checkbox',
        icon: 'fluent:slow-mode-20-regular',
        checked: metronomes.value[Number(route.params.metronomeId)]!.state.playbackRate < 1,
        onSelect() {
            if (metronomes.value[Number(route.params.metronomeId)]!.state.playbackRate < 1) {
                metronomes.value[Number(route.params.metronomeId)]!.state.playbackRate = 1;
            } else {
                metronomes.value[Number(route.params.metronomeId)]!.state.playbackRate = 0.3;

                // Start playing (if not already)
                playState.value = 'running';
            }
        },
    },
]);

const playState = ref<AnimationPlayState>();

const playStateAtStartOfSeek = ref<AnimationPlayState>();
</script>

<template>
    <div>
        <UModal
            title="Edit Metronome"
            description="Edit the metronome"
            default-open
            class="max-w-7xl"
            :ui="{
                body: 'p-0 sm:p-0',
                header: 'absolute inset-x-0 border-0 h-16',
                description: 'hidden'
            }"
            @after:leave="handleViewTransition('/')"
        >
            <template #body>
                <div class="flex h-[90vh]">
                    <div 
                        :style="{  '--grid-pattern': 
                            `linear-gradient(to right, var(--ui-bg-muted) 1px, transparent 1px),
                            linear-gradient(to bottom, var(--ui-bg-muted) 1px, transparent 1px)`
                        }"
                        class="flex items-center w-full justify-center px-8 pt-18 pb-2 gap-4 flex-col bg-[length:20px_20px] bg-[position:10px_10px] bg-[image:var(--grid-pattern)] border-r border-default/50 shadow-2xl/5"
                    >
                        <Metronome
                            v-if="!metronomes[Number($route.params.metronomeId)]?.state.visibleInMainView"
                            v-model="metronomes[Number($route.params.metronomeId)]"
                            v-model:current-animation-progress="currentAnimationProgress"
                            v-model:play-state="playState"
                            :show-controls="false"
                            @before-unmount="metronomes[Number($route.params.metronomeId)]!.state.visibleInMainView = true"
                        />
                        <div class="flex items-center gap-4">
                            <UContextMenu
                                :items="items"
                                :ui="{ item: 'disabled:cursor-default disabled:!opacity-30'}"
                            >
                                <UButton
                                    :key="playState"
                                    :icon="
                                        playState === 'running'
                                            ? 'i-material-symbols-pause-rounded'
                                            : 'i-material-symbols-play-arrow-rounded'
                                    "
                                    size="xl"
                                    variant="subtle"
                                    color="neutral"
                                    class="rounded-full"
                                    @click="
                                        playState = (playState === 'running') ? 'paused' : 'running';
                                    "
                                />
                            </UContextMenu>
                            <UButton
                                v-if="metronomes[Number(route.params.metronomeId)]!.state.playbackRate < 1"
                                variant="subtle"
                                color="warning"
                                class="group"
                                @click="metronomes[Number(route.params.metronomeId)]!.state.playbackRate = 1"
                            >
                                <UIcon
                                    name="fluent:slow-mode-20-regular"
                                    class="text-xl group-hover:hidden"
                                /> 
                                <UIcon
                                    name="material-symbols:close-rounded"
                                    class="text-xl hidden group-hover:block"
                                /> Slow
                            </UButton>
                            <div
                                class="bg-(--ui-bg) px-2.5 py-3 rounded-full border border-[var(--ui-bg-accented)]"
                            >
                                <USlider
                                    v-model="currentAnimationProgress"
                                    :min="0"
                                    :max="1"
                                    size="sm"
                                    :step="0.001"
                                    class="w-40"
                                    @update:model-value="
                                        if (!playStateAtStartOfSeek) {
                                            playStateAtStartOfSeek = playState;
                                        }
                                        playState = 'paused'
                                    "
                                    @click="
                                        if (playStateAtStartOfSeek) {
                                            playState = playStateAtStartOfSeek;

                                        }
                                        playStateAtStartOfSeek = undefined;
                                    "
                                />
                            </div>
                        </div>
                    </div>
                    <div class="p-8 pt-16 w-sm shrink-0 flex flex-col gap-4 overflow-y-auto">
                        <UAccordion
                            v-model="activeSections"
                            type="multiple"
                            :items="[
                                {
                                    label: 'Tempo & Rhythm',
                                    icon: 'i-heroicons-musical-note-solid',
                                    slot: 'tempoRhythm' as const,
                                },
                                {
                                    label: 'Appearance',
                                    icon: 'i-f7-paintbrush-fill',
                                    slot: 'appearance' as const,
                                }
                            ]"
                            :ui="{
                                trigger: 'bg-elevated rounded-lg px-4 mb-4',
                                item: 'border-none mb-4',
                                content: 'pl-4'
                            }"
                        >
                            <template #tempoRhythm>
                                <!-- Fields that are supported by all metronome types: -->
                                <EditField label="Beats per minute (BPM)">
                                    <BPMInput v-model="metronomes[Number($route.params.metronomeId)]!.configuration.bpm" />
                                </EditField>

                                <!-- Custom fields for this metronome type: -->
                                <Metronome
                                    v-model="metronomes[Number($route.params.metronomeId)]"
                                    show-settings-section-only="tempo-rhythm"
                                />
                            </template>
                            <template #appearance>
                                <!-- Fields that are supported by all metronome types: -->
                                <EditField
                                    :ui="{label: 'w-full'}"
                                >
                                    <template #label>
                                        <div class="flex justify-between items-end">
                                            <span>Display text</span>
                                            <UButton
                                                v-if="metronomes[Number($route.params.metronomeId)]!.configuration.title.toLowerCase() !== `${metronomes[Number($route.params.metronomeId)]!.configuration.bpm} BPM`.toLowerCase()"
                                                size="xs"
                                                variant="link"
                                                color="primary"
                                                class="p-0 pb-0.5 font-light"
                                                @click="metronomes[Number($route.params.metronomeId)]!.configuration.title = `${metronomes[Number($route.params.metronomeId)]!.configuration.bpm} BPM`"
                                            >
                                                <UIcon
                                                    name="material-symbols:sync-outline"
                                                /> Sync with BPM
                                            </UButton>
                                        </div>
                                    </template>
                                    <UInput
                                        v-model="metronomes[Number($route.params.metronomeId)]!.configuration.title"
                                        placeholder="Display Text"
                                        type="text"
                                        class="w-full"
                                        autocomplete="off"
                                    />
                                </EditField>

                                <!-- Custom fields for this metronome type: -->
                                <Metronome
                                    v-model="metronomes[Number($route.params.metronomeId)]"
                                    show-settings-section-only="appearance"
                                />
                            </template>
                        </UAccordion>
                    </div>
                </div>
            </template>
        </UModal>
    </div>
</template>
