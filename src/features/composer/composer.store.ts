import { create } from "zustand";
import type { Emotion } from "../../engine/emotion/emotion.config";

type Snapshot = {
    key: string;
    emotion: Emotion;
    chords: string[][];
    melody: (string | null)[];
    tempo: number;
    scale: string;
};

interface ComposerState {
    key: string;
    emotion: Emotion;
    chords: string[][];
    scale: "major" | "minor";
    melody: (string | null)[];
    tempo: number;
    // history
    past: Snapshot[];
    future: Snapshot[];
    undo: () => void;
    redo: () => void;
    commit: () => void;

    // editing
    toggleNote: (note: string, step: number) => void;
    setEmotion: (emotion: Emotion) => void;
    setComposition: (data: {
        scale?: string[];
        melody: (string | null)[];
        chords: string[][];
        tempo: number;
    }) => void;

    // playback/grid
    quantize: "1/4" | "1/8" | "1/16";
    swing: number; // percent 0-50
    setQuantize: (q: "1/4" | "1/8" | "1/16") => void;
    setSwing: (s: number) => void;
}

const snapshotOf = (s: Partial<ComposerState>): Snapshot => ({
    key: s.key || "C",
    emotion: (s.emotion as Emotion) || ("happy" as Emotion),
    chords: s.chords || [],
    melody: s.melody || Array(16).fill(null),
    tempo: s.tempo || 120,
    scale: (s.scale as unknown as string) || "major",
});

export const useComposerStore = create<ComposerState>((set, get) => ({

    melody: Array(16).fill(null),
    key: "C",
    emotion: "happy",
    scale: "major",
    chords: [],
    tempo: 120,

    past: [],
    future: [],

    // grid
    quantize: "1/8",
    swing: 0,

    commit: () => {
        const state = get();
        const snap = snapshotOf(state);
        set((s) => ({ past: [...s.past.slice(-49), snap], future: [] }));
    },

    undo: () => {
        set((s) => {
            if (!s.past.length) return {} as Partial<ComposerState> as ComposerState;
            const last = s.past[s.past.length - 1];
            const before = s.past.slice(0, -1);
            const currentSnap = snapshotOf(s);
            return {
                ...last,
                past: before,
                future: [currentSnap, ...s.future],
            } as unknown as ComposerState;
        });
    },

    redo: () => {
        set((s) => {
            if (!s.future.length) return {} as Partial<ComposerState> as ComposerState;
            const [next, ...rest] = s.future;
            const currentSnap = snapshotOf(s);
            return {
                ...next,
                past: [...s.past, currentSnap],
                future: rest,
            } as unknown as ComposerState;
        });
    },

    toggleNote: (note, step) =>
        set((state) => {
            const newMelody = [...state.melody];
            // commit before change
            const snap = snapshotOf(state);
            state.past = [...state.past.slice(-49), snap];

            if (newMelody[step] === note) {
                newMelody[step] = null;
            } else {
                newMelody[step] = note;
            }

            return { melody: newMelody, past: state.past, future: [] } as unknown as ComposerState;
        }),

    setEmotion: (emotion) => set({ emotion }),

    setComposition: (data) =>
        set((s) => {
            const snap = snapshotOf(s);
            const past = [...s.past.slice(-49), snap];
            return {
                melody: data.melody,
                chords: data.chords,
                tempo: data.tempo,
                past,
                future: [],
            } as unknown as ComposerState;
        }),

    setQuantize: (q) => set({ quantize: q }),
    setSwing: (s) => set({ swing: Math.max(0, Math.min(50, s)) }),
}));

// Persist store to localStorage (hydrate on load and save on changes)
const STORAGE_KEY = "music_composer_state_v1";
try {
    if (typeof window !== "undefined") {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            try {
                const parsed = JSON.parse(raw);
                // Only set known fields to avoid functions
                useComposerStore.setState({
                    key: parsed.key || undefined,
                    emotion: parsed.emotion || undefined,
                    melody: parsed.melody || undefined,
                    chords: parsed.chords || undefined,
                    tempo: parsed.tempo || undefined,
                    past: parsed.past || undefined,
                    future: parsed.future || undefined,
                    quantize: parsed.quantize || undefined,
                    swing: parsed.swing || undefined,
                } as any);
            } catch (e) {
                console.warn("Failed to parse saved composer state", e);
            }
        }

        // subscribe and save changes (debounced lightly)
        let timeout: any = null;
        useComposerStore.subscribe((state) => {
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(() => {
                try {
                    const toSave = {
                        key: state.key,
                        emotion: state.emotion,
                        melody: state.melody,
                        chords: state.chords,
                        tempo: state.tempo,
                        past: state.past?.slice(-50) || [],
                        future: state.future?.slice(0, 50) || [],
                        quantize: state.quantize,
                        swing: state.swing,
                    };
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
                } catch (e) {
                    console.warn("Failed to save composer state", e);
                }
            }, 200);
        });
    }
} catch (e) {
    // ignore storage errors
}