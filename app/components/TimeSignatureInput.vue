<script setup lang="ts">
import type { TimeSignature } from '~/types';


const timeSignature = defineModel<TimeSignature>({ required: true });

const isCurrentlySelected = (timeSignatureOption: TimeSignature) => {
    return timeSignatureOption[0] === timeSignature.value[0] && timeSignatureOption[1] === timeSignature.value[1];
};
</script>


<template>
    <div class="p-2 flex gap-2">
        <UButton
            v-for="timeSignatureOption in [[3, 4], [4, 4], [6, 8]] as TimeSignature[]"
            :key="timeSignatureOption.join(',')"
            :variant="isCurrentlySelected(timeSignatureOption) ? 'soft' : 'ghost'"
            :color="isCurrentlySelected(timeSignatureOption) ? 'primary' : 'neutral'"
            @click="timeSignature = timeSignatureOption"
        >
            <TimeSignature :time-signature="timeSignatureOption" />
        </UButton>
    </div>
</template>