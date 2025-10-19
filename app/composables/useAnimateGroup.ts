import type { MaybeComputedElementRef, UseAnimateKeyframes, UseAnimateOptions, UseAnimateReturn } from '@vueuse/core';
// useAnimateGroup.ts
import type { ComputedRef, WritableComputedRef } from 'vue';
import { useAnimate } from '@vueuse/core';
import { computed } from 'vue';

export interface UseAnimateGroupReturn {
  /** true if all items report supported */
  isSupported: ComputedRef<boolean>

  /** array of underlying Animation refs (one per item) */
  animates: ComputedRef<Array<Animation | undefined>>

  /** control actions apply to all items */
  play: () => void
  pause: () => void
  reverse: () => void
  finish: () => void
  cancel: () => void

  /**
   * Aggregated states:
   * - pending: true if any are pending
   * - playState / replaceState: reflects the first available item (group is meant to be in sync)
   */
  pending: ComputedRef<boolean>
  playState: ComputedRef<AnimationPlayState>
  replaceState: ComputedRef<AnimationReplaceState>

  /**
   * Group-level writable properties.
   * Getter reflects the first available item; setter writes to all items.
   */
  startTime: WritableComputedRef<CSSNumberish | number | null>
  currentTime: WritableComputedRef<CSSNumberish | null>
  timeline: WritableComputedRef<AnimationTimeline | null>
  playbackRate: WritableComputedRef<number>

  /** Access to the individual useAnimate returns if needed */
  useAnimates: UseAnimateReturn[]
}

/**
 * Group controller for multiple useAnimate() instances.
 *
 * Usage:
 * const group = useAnimateGroup(
 *   [
 *     [elA, keyframesA],
 *     [elB, keyframesB],
 *   ],
 *   { duration: 1200, iterations: Infinity, immediate: true }
 * )
 *
 * group.play() // plays all
 * group.currentTime.value = 500 // seeks all
 */
export function useAnimateGroup(
  elAndKeyframeSets: Array<[MaybeComputedElementRef, UseAnimateKeyframes]>,
  options?: UseAnimateOptions,
): UseAnimateGroupReturn {
  const useAnimates = elAndKeyframeSets.map(([element, keyframes]) => useAnimate(element, keyframes, options));

  const first = computed(() => useAnimates.find(i => i.animate.value != null) ?? useAnimates[0]);

  const isSupported = computed(() => useAnimates.every(i => i.isSupported.value));
  const animates = computed(() => useAnimates.map(i => i.animate.value));

  const play = () => {
    for (const i of useAnimates) i.play();
  };
  const pause = () => {
    for (const i of useAnimates) i.pause();
  };
  const reverse = () => {
    for (const i of useAnimates) i.reverse();
  };
  const finish = () => {
    for (const i of useAnimates) i.finish();
  };
  const cancel = () => {
    for (const i of useAnimates) i.cancel();
  };

  const pending = computed(() => useAnimates.some(i => i.pending.value));

  // For these, we mirror the first available item for reads; writes broadcast to all.
  const playState = computed(() => first.value?.playState.value || 'running');

  const replaceState = computed<AnimationReplaceState>(() => first.value?.replaceState.value ?? 'active');

  const startTime = computed<CSSNumberish | number | null>({
    get: () => first.value?.startTime.value ?? null,
    set: (v) => { for (const i of useAnimates) i.startTime.value = v; },
  });

  const currentTime = computed<CSSNumberish | null>({
    get: () => first.value?.currentTime.value ?? 0,
    set: (v) => { for (const i of useAnimates) i.currentTime.value = v; },
  });

  const timeline = computed<AnimationTimeline | null>({
    get: () => first.value?.timeline.value ?? null,
    set: (v) => { for (const i of useAnimates) i.timeline.value = v; },
  });

  const playbackRate = computed<number>({
    get: () => first.value?.playbackRate.value ?? 1,
    set: (v) => { for (const i of useAnimates) i.playbackRate.value = v; },
  });

  return {
    isSupported,
    animates,

    play,
    pause,
    reverse,
    finish,
    cancel,

    pending,
    playState,
    replaceState,
    startTime,
    currentTime,
    timeline,
    playbackRate,

    useAnimates,
  };
}
