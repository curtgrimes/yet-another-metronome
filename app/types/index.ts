export interface MetronomeStyleBase {
  id: MetronomeStyleId;
}

export type MetronomeStyleId = 'rectangle';

export type MetronomeStyle =
  | MetronomeStyleRectangle;

export interface MetronomeConfiguration<TStyle extends MetronomeStyle = MetronomeStyle> {
  title: string;
  bpm: number;
  timeSignature: TimeSignature;
  style: TStyle;
  startAutomatically: boolean;
}

interface MetronomeState {
  paused: boolean;
  visibleInMainView: boolean;
  playbackRate: number;
}

export interface Metronome<TStyle extends MetronomeStyle = MetronomeStyle> {
  configuration: MetronomeConfiguration<TStyle>,
  state: MetronomeState
}

/**
 * Represents a musical time signature as a tuple of two numbers.
 * The first element is the number of beats per measure (e.g., 4 in 4/4 time),
 * and the second element is the note value that gets the beat (e.g., 4 for quarter note in 4/4 time).
 *
 * Example: [3, 4] represents 3/4 time signature.
 */
export type TimeSignature = [number, number];
// [beatsPerMeasure, noteValueGettingOneBeat]

export interface MetronomeStyleRectangle extends MetronomeStyleBase {
  id: 'rectangle';
  // Background color in hex format. Example: "#FFFF00"
  colorBackground: string;
}