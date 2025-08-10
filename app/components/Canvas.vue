<script setup lang="ts">
import { useMetronomes } from '~/composables/useMetronomes';
import { Metronome } from '#components';

const { metronomes } = useMetronomes();
</script>

<template>
    <div class="h-full flex items-center justify-center mb-4">
        <component
            :is="metronome.state.visibleInMainView ? Metronome : 'div'"
            v-for="(metronome, index) in metronomes"
            :key="index"
            v-model="metronomes[index]"
        />
    </div>
</template>
