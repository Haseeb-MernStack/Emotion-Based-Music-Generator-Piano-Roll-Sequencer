import { useEffect } from "react";
import * as Tone from "tone";
import { KEY_TO_NOTE } from "@/engine/theory/keyMapping";

export default function useKeyboardSynth() {
    useEffect(() => {
        const synth = new Tone.Synth().toDestination();

        const handleKeyDown = (e: KeyboardEvent) => {
            const note = KEY_TO_NOTE[e.key.toLowerCase()];
            if (note) {
                synth.triggerAttackRelease(note, "8n");
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);
}