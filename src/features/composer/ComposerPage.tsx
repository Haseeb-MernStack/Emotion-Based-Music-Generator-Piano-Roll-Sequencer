import { useComposerStore } from "./composer.store";
import { generateFromEmotion } from "../../engine/generators/emotion.generator";
import { playComposition } from "../../lib/audio";
import PianoRoll from "./PianoRoll";
import useKeyboardSynth from "./useKeyboardSynth";
import useKeyboard from "./useKeyboard";
import ComposerControls from "./ComposerControls";

export default function ComposerPage() {

    useKeyboardSynth();
    useKeyboard();

    const {
        key,
        emotion,
        melody,
        chords,
        tempo,
        setEmotion,
        setComposition,
    } = useComposerStore();

    const handleGenerate = () => {
        const result = generateFromEmotion(key, emotion);
        setComposition(result);
    };

    const handlePlay = () => {
        playComposition(melody, chords, tempo);
    };

    return (
        <div className="p-8 space-y-4">
            <h1 className="text-3xl font-bold">
                Music Composer
            </h1>

            <ComposerControls />

            <div className="mt-4">
                <PianoRoll />
            </div>
        </div>
    );
}