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
                title: 'bg-shadow-big-blur'
            }"
            @after:leave="handleViewTransition('/')"
        >
            <template #body>
                <div class="flex h-[90vh]">
                    <div 
                        class="flex items-center w-full justify-center px-8 pt-18 pb-2 gap-4 flex-col bg-grid-pattern border-r border-default/50 shadow-2xl/5"
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
                                    slot: 'tempoAndRhythm' as const,
                                },
                                {
                                    label: 'Appearance',
                                    icon: 'i-f7-paintbrush-fill',
                                    slot: 'colors' as const,
                                }
                            ]"
                            :ui="{
                                trigger: 'bg-neutral-100 rounded-lg px-4 mb-4',
                                item: 'border-none',
                                content: 'pl-4'
                            }"
                        >
                            <template #tempoAndRhythm>
                                <UFormField
                                    label="Beats per minute (BPM)"
                                    class="flex flex-col gap-1 mb-4"
                                >
                                    <BPMInput v-model="metronomes[Number($route.params.metronomeId)]!.configuration.bpm" />
                                </UFormField>
                                <UFormField
                                    label="Time signature"
                                    class="flex flex-col gap-1 mb-4"
                                >
                                    <TimeSignatureInput v-model="metronomes[Number($route.params.metronomeId)]!.configuration.timeSignature" />
                                </UFormField>
                            </template>
                            <template #colors>
                                <UFormField
                                    label="Display text"
                                    class="flex flex-col gap-1 mb-4"
                                >
                                    <UInput
                                        v-model="metronomes[Number($route.params.metronomeId)]!.configuration.title"
                                        placeholder="Display Text"
                                        type="text"
                                        class="w-full"
                                        autocomplete="off"
                                    />
                                </UFormField>
                                <UFormField
                                    label="Color"
                                    class="flex flex-col gap-1"
                                >
                                    <ColorInput v-model="metronomes[Number($route.params.metronomeId)]!.configuration.style.colorBackground" />
                                </UFormField>
                            </template>
                        </UAccordion>
                    </div>
                </div>
            </template>
        </UModal>
    </div>
</template>

<style lang="css" scoped>
.bg-grid-pattern {
  background-size: 20px 20px;
  background-position: 10px 10px;
  background-image:
    linear-gradient(to right, rgba(0,0,0,.03) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(0,0,0,.03) 1px, transparent 1px);
}
</style>

<style lang="css">
.bg-shadow-big-blur {
    filter:
        drop-shadow(0 0  50px #fff)
        drop-shadow(0 0  50px #fff)
        drop-shadow(0 0  20px #fff)
        drop-shadow(0 0  20px #fff)
        drop-shadow(0 0  10px #fff)
        drop-shadow(0 0  10px #fff);
}
</style>