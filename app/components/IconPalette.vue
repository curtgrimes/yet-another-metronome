<template>
  <UIcon
    name="i-ic-outline-palette"
    data-palette-icon
    mode="svg"
    class="text-2xl transition-none"
  />
</template>

<style lang="css" scoped>
@reference "~/assets/css/main.css";

:deep([data-palette-icon] circle:nth-of-type(1)) {
  @apply fill-red-500;
}

:deep([data-palette-icon] circle:nth-of-type(2)) {
  @apply fill-orange-400;
}

:deep([data-palette-icon] circle:nth-of-type(3)) {
  @apply fill-green-400;
}

:deep([data-palette-icon] circle:nth-of-type(4)) {
  @apply fill-blue-400;
}
</style>
