<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui/runtime/components/Tabs.vue.js';

const { addRandomMetronome } = useMetronomes();

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

const { appMode } = useSettings();

const minimizeNavbar = ref(false);
const viewTransitionName = ref<'navbar-minimize' | undefined>();
watch(appMode, () => {
  viewTransitionName.value = 'navbar-minimize';
  document.startViewTransition(async () => {
    minimizeNavbar.value = appMode.value === 'perform';
  }).finished.finally(() => (viewTransitionName.value = undefined));
});
</script>

<template>
  <div class="inset-x-0 z-10">
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
        @click="appMode = 'edit'"
      >
        <UIcon name="i-mingcute-settings-7-line" />
      </UButton>
    </UTooltip>
    <UCard
      v-if="!minimizeNavbar"
      variant="subtle"
      class="max-w-4xl mx-auto mt-4 backdrop-blur-2xl rounded-full"
      :style="{ viewTransitionName }"
      :ui="{ body: '!p-2' }"
    >
      <div class="flex gap-4">
        <UPopover mode="hover">
          <UButton
            size="lg"
            icon="i-mingcute-add-line"
            label="Add Metronome"
            variant="soft"
            class="rounded-full"
            @click="addRandomMetronome"
          />

          <template #content />
        </UPopover>
        <div class="ml-auto flex gap-2">
          <UButton
            icon="i-mingcute-settings-7-line"
            label="Settings"
            variant="ghost"
            class="rounded-full"
            to="/settings"
          />
          <UPopover
            mode="hover"
            :dismissible="false"
          >
            <UTabs
              v-model="appMode"
              :content="false"
              :items="editPerformTabItems"
              :ui="{
                indicator: 'rounded-full',
                list: 'bg-accented rounded-full',
                trigger: 'rounded-full',
              }"
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
      </div>
    </UCard>
  </div>
</template>

<style>
::view-transition-old(navbar-minimize),
::view-transition-new(navbar-minimize) {
  height: 100%;
  filter: blur(3px);
}
</style>
