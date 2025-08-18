<script setup lang="ts">
import type { UPopover } from '#components';

const { tooltip = undefined, popoverProps = {} } = defineProps<{
    tooltip?: string;
    popoverProps?: InstanceType<typeof UPopover>['$props'];
}>();

</script>

<template>
    <UPopover v-bind="{ ...popoverProps, content: { side: 'right', align: 'center', ...popoverProps.content } }">
        <template #default="{ open: popoverOpen }">
            <UTooltip
                :text="tooltip"
                :delay-duration="0"
                :content="{ side: 'right' }"
                :disabled="popoverOpen"
            >
                <UButton
                    variant="ghost"
                    color="neutral"
                    v-bind="$attrs"
                    :class="['aspect-square w-10 p-1 rounded-xl hover:bg-default focus-visible:bg-default hover:!text-(--ui-text) focus-visible:!text-(--ui-text)  aria-expanded:!text-(--ui-text) text-xs flex items-center justify-center font-black !text-inherit transition-none', popoverOpen && '!bg-default opacity-100']"
                >
                    <slot />
                </UButton>
            </UTooltip>
        </template>
        <template #content>
            <slot name="popover" />
        </template>
    </UPopover>
</template>