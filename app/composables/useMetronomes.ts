import type { Metronome } from '~/types';
import { createGlobalState, useLocalStorage } from '@vueuse/core';

export const useMetronomes = createGlobalState(() => {
  const metronomes = useLocalStorage<Metronome[]>('metronomes', []);

  const colors = [
    '#FF0000', // Red
    '#FF2400', // Scarlet
    '#FF4500', // Orange Red
    '#FF6347', // Tomato
    '#FF7F50', // Coral
    '#FF8C00', // Dark Orange
    '#FF9500', // Tangerine
    '#FFB347', // Mango
    '#FF69B4', // Hot Pink
    '#FF1493', // Deep Pink
    '#DB7093', // Pale Violet Red
    '#C71585', // Medium Violet Red
    '#8B0000', // Dark Red
    '#A52A2A', // Brown
    '#7FFF00', // Chartreuse
    '#32CD32', // Lime Green
    '#228B22', // Forest Green
    '#008000', // Green
    '#006400', // Dark Green
    '#20B2AA', // Light Sea Green
    '#00CED1', // Dark Turquoise
    '#40E0D0', // Turquoise
    '#00BFFF', // Deep Sky Blue
    '#1E90FF', // Dodger Blue
    '#4169E1', // Royal Blue
    '#0000CD', // Medium Blue
    '#4B0082', // Indigo
    '#8A2BE2', // Blue Violet
    '#9400D3', // Dark Violet
    '#9932CC', // Dark Orchid
    '#FF00FF', // Magenta
    '#DA70D6', // Orchid
  ];
  const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)]!;

  const addRandomMetronome = () => {
    metronomes.value.push({
      configuration: {
        title: '',
        bpm: 60,
        timeSignature: [4, 4],
        style: {
          id: 'rectangle',
          colorBackground: getRandomColor(),
        },
      },
      state: {
        playbackRate: 1,
        visibleInMainView: true,
        showBpmSettingHintForBpm: undefined,
      },
    });
  };

  if (metronomes.value.length <= 0) {
    // Add one to start off with
    addRandomMetronome();
  }

  return {
    metronomes,
    addRandomMetronome,
  };
});
