<template>
  <UFormField
    class="flex flex-col gap-1 mb-4"
    size="lg"
  >
    <template #label>
      <slot name="label" />
    </template>
    <slot />
  </UFormField>
</template>
