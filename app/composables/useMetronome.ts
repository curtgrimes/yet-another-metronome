import type { Metronome } from '~/types';
import { createEventHook } from '@vueuse/core';

/**
 * useMetronome() handles the metronome ticking logic. It schedules ticks based
 * on the BPM configuration of the provided Metronome instance.
 */
export function useMetronome(metronome: MaybeRefOrGetter<Metronome>) {
  const enabled = ref(false);
  const firstTick = ref<DOMHighResTimeStamp>(performance.now());

  const millisecondsPerBeat = computed(() => (60 / toValue(metronome).configuration.bpm) * 1000);

  const { on: onTick, trigger: triggerTick } = createEventHook();

  const pendingFutureTick = ref<ReturnType<typeof setTimeout>>();

  const scheduleTick = (milliseconds: number) => {
    clearTimeout(pendingFutureTick.value);
    pendingFutureTick.value = undefined;
    // eslint-disable-next-line ts/no-use-before-define
    pendingFutureTick.value = setTimeout(doTick, milliseconds);
  };

  const doTick = () => {
    enabled.value = true;
    triggerTick();

    const elapsedMs = performance.now() - firstTick.value;
    const driftCorrectionMs = elapsedMs % millisecondsPerBeat.value;

    const nextScheduledTick = driftCorrectionMs > 100
      ? (millisecondsPerBeat.value - driftCorrectionMs) + millisecondsPerBeat.value
      : millisecondsPerBeat.value - driftCorrectionMs;

    scheduleTick(nextScheduledTick);
  };

  onMounted(() => {
    doTick();
  });

  watch(() => toValue(metronome).configuration.bpm, () => {
    scheduleTick(1000);
  });

  return {
    onTick,
    enabled: readonly(enabled),
    millisecondsPerBeat,
  };
}
