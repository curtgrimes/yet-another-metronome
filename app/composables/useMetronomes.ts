// import { useLocalStorage } from '@vueuse/core';
import { createGlobalState } from '@vueuse/core';
import type { Metronome } from '~/types';

export const useMetronomes = createGlobalState(() => {
    // const metronomes = useLocalStorage<Metronome[]>('metronomes', [
    //   {
    //     title: 'Default Metronome',
    //     bpm: 120,
    //     style: 'rectangle'
    //   }
    // ], { initOnMounted: true });

    const metronomes = ref<Metronome[]>([
        {
            configuration: {
                title: '',
                bpm: 60,
                timeSignature: [4, 4],
                style: {
                    id: 'rectangle',
                    colorBackground: "#5522aa",
                },
                startAutomatically: false,
            },
            state: {
                playbackRate: 1,
                visibleInMainView: true,
                showBpmSettingHintForBpm: undefined,
            },
        },
    ]);

    return {
        metronomes,
    };
});
