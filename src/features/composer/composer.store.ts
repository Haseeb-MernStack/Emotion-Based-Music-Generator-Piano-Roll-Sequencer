import { create } from "zustand";
import type { Emotion } from "../../engine/emotion/emotion.config";

interface ComposerState {
    key: string;
    emotion: Emotion;
    chords: string[][];
    scale: "major" | "minor";
    melody: (string | null)[];
    toggleNote:(note:string, step:number)=> void;
    tempo: number;

    setEmotion: (emotion:Emotion) => void;
    setComposition: (data: {
        scale?: string[];
        melody: (string | null)[];
        chords: string[][];
        tempo: number;
    }) => void;
}


export const useComposerStore = create<ComposerState>((set) => ({

    melody: Array(16).fill(null),

    toggleNote: (note, step) =>
        set((state) => {
            const newMelody = [...state.melody];

            if (newMelody[step] === note) {
                newMelody[step] = null;
            } else {
                newMelody[step] = note;
            }

            return { melody: newMelody };
        }),

    key: "C",
    emotion:"happy",
    scale: "major",
    chords:[],
    tempo:120,

    setEmotion: (emotion)=> set({emotion}),

    setComposition: (data) =>
        set(() => ({
            melody: data.melody,
            chords: data.chords,
            tempo: data.tempo,
        })),
}));