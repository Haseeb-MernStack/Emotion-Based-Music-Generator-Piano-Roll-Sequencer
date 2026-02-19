import { getScale } from "../theory/scales";
import { EMOTION_CONFIG, type Emotion } from "../emotion/emotion.config";

export async function generateFromEmotion(
    root: string,
    emotion: Emotion
) {
    const config = EMOTION_CONFIG[emotion];

    const scale = getScale(root, config.scale);
    // Dynamic import of heavy generator functions
    const [{ generateMelody }, { generateProgression }] = await Promise.all([
        import("./melody.generator"),
        import("./chord.generator"),
    ]);
    const melody = generateMelody(scale, 16);
    const chords = generateProgression(scale, config.progrssion);

    return {
        scale,
        melody,
        chords,
        tempo: config.tempo,
    }
}