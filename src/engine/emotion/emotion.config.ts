export type Emotion =
    | "happy"
    | "sad"
    | "epic"
    | "chill"
    | "dark";

interface EmotionConfig {
    scale: "major" | "minor";
    tempo: number;
    progrssion: number[];
}

export const EMOTION_CONFIG: Record<Emotion, EmotionConfig> = {
    happy: {
        scale: 'major',
        tempo: 120,
        progrssion: [0, 4, 5, 3],
    },
    sad: {
        scale: "minor",
        tempo: 70,
        progrssion: [0, 5, 2, 6],
    },
    epic: {
        scale: "major",
        tempo: 90,
        progrssion: [0, 5, 3, 4],
    },
    chill: {
        scale: "major",
        tempo: 85,
        progrssion: [0, 2, 4, 5],
    },
    dark: {
        scale: "minor",
        tempo: 100,
        progrssion: [0, 3, 4],
    },
};