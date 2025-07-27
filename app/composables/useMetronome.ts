import type { Metronome } from "~/types";

export const useMetronome = (metronome: MaybeRefOrGetter<Metronome>) => {
    const counter = ref(0);
    onMounted(() => {
        console.log('Mounted MetronomeBase');

        setInterval(() => {
            console.log('inside interval');
            counter.value++;
        }, 1000);
    });

    const tick = computed(() => counter.value % 2 === 0);

    return {
        tick
    };
}