import PianoRoll from "./PianoRoll";
import useKeyboardSynth from "./useKeyboardSynth";
import useKeyboard from "./useKeyboard";
import ComposerControls from "./ComposerControls";

export default function ComposerPage() {

    useKeyboardSynth();
    useKeyboard();

    // Composer state and actions are used inside child components.

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