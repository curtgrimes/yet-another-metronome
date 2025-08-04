<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui/runtime/components/Tabs.vue.js';

const editPerformTabItems = ref<TabsItem[]>([
    {
        label: 'Edit',
        icon: 'i-mingcute-edit-2-line',
        value: 'edit',
        description: 'Edit metronomes and layout.',
    },
    {
        label: 'Perform',
        icon: 'i-mingcute-fullscreen-2-line',
        value: 'perform',
        description: 'Hide controls and maximize space.',
    },
]);

const mode = ref<'edit' | 'perform'>('edit');

const minimizeNavbar = ref(false);
const viewTransitionName = ref<'navbar-minimize' | undefined>();
watch(mode, () => {
    viewTransitionName.value = 'navbar-minimize';
    document.startViewTransition(async () => {
        minimizeNavbar.value = mode.value === 'perform';
    }).finished.finally(() => (viewTransitionName.value = undefined));
});
</script>

<template>
    <div class="fixed inset-x-0">
        <UTooltip
            text="Edit"
            :delay-duration="0"
        >
            <UButton
                v-if="minimizeNavbar"
                :style="{ viewTransitionName }"
                size="lg"
                class="absolute top-4 right-4 aspect-square rounded-full text-xl p-2"
                variant="soft"
                @click="mode = 'edit'"
            >
                <UIcon name="i-mingcute-settings-7-line" />
            </UButton>
        </UTooltip>
        <UCard
            v-if="!minimizeNavbar"
            variant="soft"
            class="max-w-4xl mx-auto mt-4 backdrop-blur-2xl"
            :style="{ viewTransitionName }"
        >
            <div class="flex gap-4">
                <UPopover mode="hover">
                    <UButton
                        size="lg"
                        icon="i-mingcute-add-line"
                        label="Add Metronome"
                        variant="soft"
                    />

                    <template #content>
                        Hello world
                    </template>
                </UPopover>
                <UButton
                    size="lg"
                    icon="i-mingcute-layout-3-line"
                    label="Edit Layout"
                    variant="ghost"
                />
                <UPopover
                    mode="hover"
                    :dismissible="false"
                >
                    <UTabs
                        v-model="mode"
                        :content="false"
                        :items="editPerformTabItems"
                        class="ml-auto"
                    >
                        <template #default="{ item }">
                            {{ item.label }}
                        </template>
                    </UTabs>
                    <template #content>
                        <div class="p-4 flex flex-col gap-4 text-sm">
                            <div
                                v-for="(item, index) in editPerformTabItems"
                                :key="index"
                            >
                                <h3 class="font-bold flex items-center gap-2">
                                    <UIcon
                                        :name="item.icon!"
                                        class="w-4"
                                    /> {{ item.label }}
                                </h3>
                                <p class="ml-6">
                                    {{ item.description }}
                                </p>
                            </div>
                        </div>
                    </template>
                </UPopover>
            </div>
        </UCard>
    </div>
    <!-- Navbar spacer -->
    <div :class="['transition-all shrink-0 duration-200', minimizeNavbar ? 'h-0' : 'h-30']" />
</template>

<style>
::view-transition-old(navbar-minimize),
::view-transition-new(navbar-minimize) {
  height: 100%;
  filter: blur(3px);
}
</style>
