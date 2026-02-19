import { PIANO_RANGE } from "@/engine/theory/pianoRange";
import { useComposerStore } from "./composer.store";
import * as Tone from "tone";
import { useEffect, useRef, useState } from "react";

export default function PianoRoll() {
    const [activeNote, setActiveNote] = useState<string | null>(null);
    const { melody, toggleNote } = useComposerStore();
    const reverseRange = [...PIANO_RANGE].reverse();
    const steps = 16;

    const synthRef = useRef<Tone.Synth | null>(null);

    useEffect(() => {
        synthRef.current = new Tone.Synth().toDestination();
    }, []);

    const handleClick = async (note: string, step: number) => {
        await Tone.start(); // required for browser
        toggleNote(note, step);
        synthRef.current?.triggerAttackRelease(note, "8n");
    };

    return (
        <div className="overflow-x-auto border rounded bg-white shadow">
            <div
                className="grid"
                style={{
                    gridTemplateColumns: `100px repeat(${steps},40px)`,
                }}
            >
                {reverseRange.map((note) => (
                    <div key={note} className="contents">
                        {/* Note Label */}
                        <div className="border text-xs flex items-center justify-center bg-gray-100">
                            {note}
                        </div>

                        {/* Timeline Cells */}
                        {Array.from({ length: steps }).map((_, stepIndex) => {
                            const isActive = melody[stepIndex] && note.startsWith(melody[stepIndex]);

                            return (
                                <div
                                    key={`${note}-${stepIndex}`}
                                    className={`border h-8 cursor-pointer transition ${isActive ? "bg-blue-500" : "bg-white hover:bg-gray-200"}`}
                                    onClick={() => handleClick(note, stepIndex)}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}