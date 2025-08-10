import { createEventHook } from "@vueuse/core";
import type { Metronome } from "~/types";

/**
 * useMetronome() handles the metronome ticking logic. It schedules ticks based
 * on the BPM configuration of the provided Metronome instance.
 */
export const useMetronome = (metronome: MaybeRefOrGetter<Metronome>) => {
    const enabled = ref(false);
    const firstTick = ref<DOMHighResTimeStamp>(performance.now());
    
    const { on: onTick, trigger: triggerTick} = createEventHook();

    onMounted(() => {
        doTick();
    });

    watch(() => toValue(metronome).configuration.bpm, () => {
        scheduleTick(1000);
    });

    const pendingFutureTick = ref<ReturnType<typeof setTimeout>>();
    const scheduleTick = (milliseconds: number) => {
        clearTimeout(pendingFutureTick.value);
        pendingFutureTick.value = undefined;
        pendingFutureTick.value = setTimeout(doTick, milliseconds);
    };

    const millisecondsPerBeat = computed(() => (60 / toValue(metronome).configuration.bpm) * 1000);

    const doTick = () => {
        enabled.value = true;
        triggerTick();

        const elapsedMs = performance.now() - firstTick.value;
        const driftCorrectionMs = elapsedMs % millisecondsPerBeat.value;

        const nextScheduledTick = driftCorrectionMs > 100 ?
            (millisecondsPerBeat.value - driftCorrectionMs) + millisecondsPerBeat.value :
            millisecondsPerBeat.value - driftCorrectionMs;

        scheduleTick(nextScheduledTick);
    };

    return {
        onTick,
        enabled,
        millisecondsPerBeat,
    };
};