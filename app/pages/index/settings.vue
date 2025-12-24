<script setup lang="ts">
const router = useRouter();

const { playMetronomesInEditMode } = useSettings();
</script>

<template>
  <UModal
    title="Settings"
    default-open
    :ui="{ footer: 'justify-end' }"
    @after:leave="router.replace('/')"
  >
    <template #body>
      <h3 class="mb-3">
        Editing
      </h3>
      <USwitch v-model="playMetronomesInEditMode" label="Play metronomes in edit mode" />
    </template>
    <template #footer="{ close }">
      <UButton label="Done" color="primary" @click="close" />
    </template>
  </UModal>
</template>
