<script setup lang="ts">
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
</script>

<template>
    <div>
        <UModal
            title="Edit Metronome"
            default-open
            class="max-w-7xl"
            :ui="{
                body: 'p-0 sm:p-0',
                header: 'absolute inset-x-0 border-0 h-16',
            }"
            @after:leave="handleViewTransition('/')"
        >
            <template #body>
                <div class="flex h-[90vh]">
                    <div 
                        :style="{  '--grid-pattern': 
                            `linear-gradient(to right, var(--ui-bg-elevated) 1px, transparent 1px),
                            linear-gradient(to bottom, var(--ui-bg-elevated) 1px, transparent 1px)`
                        }"
                        class="flex items-center w-full justify-center px-8 pt-18 pb-2 gap-4 flex-col bg-[length:20px_20px] bg-[position:10px_10px] bg-[image:var(--grid-pattern)] border-r border-default/50 shadow-2xl/5"
                    >
                        <Metronome
                            v-if="!metronomes[Number($route.params.metronomeId)]?.state.visibleInMainView"
                            v-model="metronomes[Number($route.params.metronomeId)]"
                            :show-controls="false"
                            @before-unmount="metronomes[Number($route.params.metronomeId)]!.state.visibleInMainView = true"
                        />
                        <UButton
                            :icon="metronomes[Number($route.params.metronomeId)]!.state.paused
                                ? 'material-symbols:play-arrow-rounded'
                                : 'material-symbols:pause-rounded'"
                            size="xl"
                            variant="subtle"
                            color="neutral"
                            class="rounded-full"
                            @click="
                                metronomes[Number($route.params.metronomeId)]!.state.paused = !metronomes[Number($route.params.metronomeId)]!.state.paused
                            "
                        />
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
                                item: 'border-none',
                                content: 'pl-4'
                            }"
                        >
                            <template #tempoRhythm>
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
                                <EditField label="Display text">
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
