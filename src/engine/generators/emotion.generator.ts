import { getScale } from "../theory/scales";
import { generateMelody } from "./melody.generator";
import { generateProgression } from "./chord.generator";
import { EMOTION_CONFIG, type Emotion } from "../emotion/emotion.config";

export function generateFromEmotion(
    root: string,
    emotion: Emotion
) {
    const config = EMOTION_CONFIG[emotion];

    const scale = getScale(root, config.scale);
    const melody = generateMelody(scale, 16);
    const chords = generateProgression(scale, config.progrssion);

    return {
        scale,
        melody,
        chords,
        tempo: config.tempo,
    }
}