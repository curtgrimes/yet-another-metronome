import { createEventHook } from "@vueuse/core";
import type { Metronome } from "~/types";

 
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

    const millisecondsBetweenTicks = computed(() => (60 / toValue(metronome).configuration.bpm) * 1000);

    const doTick = () => {
        enabled.value = true;
        triggerTick();

        const elapsedMs = performance.now() - firstTick.value;
        const driftCorrectionMs = elapsedMs % millisecondsBetweenTicks.value;

        const nextScheduledTick = driftCorrectionMs > 100 ?
            (millisecondsBetweenTicks.value - driftCorrectionMs) + millisecondsBetweenTicks.value :
            millisecondsBetweenTicks.value - driftCorrectionMs;

        scheduleTick(nextScheduledTick);
    };

    return {
        onTick,
        enabled,
        millisecondsBetweenTicks,
    };
};