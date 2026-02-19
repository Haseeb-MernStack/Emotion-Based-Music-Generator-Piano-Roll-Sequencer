import { PIANO_RANGE } from "@/engine/theory/pianoRange";
import { useComposerStore } from "./composer.store";
import * as Tone from "tone";
import { useEffect, useRef } from "react";

export default function PianoRoll() {
    const { melody, toggleNote } = useComposerStore();
    const reverseRange = [...PIANO_RANGE].reverse();
    const steps = 16;

    const synthRef = useRef<Tone.PolySynth | null>(null);

    useEffect(() => {
        synthRef.current = new Tone.PolySynth(Tone.Synth).toDestination();
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
                {/* Header row with step numbers */}
                <div className="contents">
                    <div className="border text-xs flex items-center justify-center bg-gray-100 sticky left-0 z-20">
                        Step
                    </div>
                    {Array.from({ length: steps }).map((_, stepIndex) => (
                        <div
                            key={`header-${stepIndex}`}
                            className={`border text-xs flex items-center justify-center bg-gray-50 ${stepIndex % 4 === 0 ? "border-l-2 border-gray-300" : ""
                                }`}
                        >
                            {stepIndex + 1}
                        </div>
                    ))}
                </div>

                {reverseRange.map((note) => (
                    <div key={note} className="contents">
                        {/* Note Label */}
                        <div className="border text-xs flex items-center justify-center bg-gray-100 sticky left-0 z-10">
                            {note}
                        </div>

                        {/* Timeline Cells */}
                        {Array.from({ length: steps }).map((_, stepIndex) => {
                            const isActive = !!(melody[stepIndex] && note.startsWith(melody[stepIndex] as string));
                            const isMeasure = stepIndex % 4 === 0;

                            const cellClasses = `border h-8 cursor-pointer transition flex items-center justify-center select-none focus:outline-none ${isActive ? "bg-blue-500 text-white" : "bg-white hover:bg-gray-100"
                                } ${isMeasure ? "border-l-2 border-gray-300" : ""}`;

                            return (
                                <div
                                    key={`${note}-${stepIndex}`}
                                    role="button"
                                    tabIndex={0}
                                    aria-pressed={isActive}
                                    className={cellClasses}
                                    onClick={() => handleClick(note, stepIndex)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                            e.preventDefault();
                                            handleClick(note, stepIndex);
                                        }
                                    }}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}