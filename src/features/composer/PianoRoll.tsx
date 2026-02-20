import { PIANO_RANGE } from "@/engine/theory/pianoRange";
import { useComposerStore } from "./composer.store";
import * as Tone from "tone";
import { useEffect, useRef, useState } from "react";

export default function PianoRoll() {
    const { melody, toggleNote } = useComposerStore();
    const reverseRange = [...PIANO_RANGE].reverse();
    const steps = 16;

    const synthRef = useRef<Tone.PolySynth | null>(null);

    const [visibleStart, setVisibleStart] = useState(0);
    const [visibleCount, setVisibleCount] = useState(() => (typeof window !== 'undefined' && window.innerWidth < 640 ? 8 : 16));
    const touchState = useRef<{ startX?: number; startTouches?: any | null; startCount?: number } | null>(null);

    useEffect(() => {
        synthRef.current = new Tone.PolySynth(Tone.Synth).toDestination();
    }, []);

    const handleClick = async (note: string, step: number) => {
        await Tone.start(); // required for browser
        toggleNote(note, step);
        synthRef.current?.triggerAttackRelease(note, "8n");
    };

    // Touch handlers for mobile: drag to scroll, pinch to zoom visible range
    const onTouchStart = (e: React.TouchEvent) => {
        touchState.current = { startX: e.touches[0]?.clientX, startTouches: e.touches, startCount: visibleCount };
    };

    const onTouchMove = (e: React.TouchEvent) => {
        if (!touchState.current) return;
        const ts = touchState.current;
        if (e.touches.length === 1 && ts.startX != null) {
            const dx = e.touches[0].clientX - ts.startX!;
            // threshold per 40px to shift one note row
            if (Math.abs(dx) > 40) {
                const dir = dx > 0 ? -1 : 1;
                setVisibleStart((s) => Math.max(0, Math.min(reverseRange.length - visibleCount, s + dir)));
                touchState.current!.startX = e.touches[0].clientX;
            }
        } else if (e.touches.length === 2 && ts.startTouches && ts.startTouches.length === 2) {
            const a = e.touches[0];
            const b = e.touches[1];
            const sa = ts.startTouches[0];
            const sb = ts.startTouches[1];
            const startDist = Math.hypot(sa.clientX - sb.clientX, sa.clientY - sb.clientY);
            const curDist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
            if (Math.abs(curDist - startDist) > 10) {
                // pinch: if curDist > startDist -> zoom in (fewer notes), else zoom out
                const newCount = Math.max(4, Math.min(reverseRange.length, Math.round(ts.startCount! - (curDist - startDist) / 40)));
                setVisibleCount(newCount);
                setVisibleStart((s) => Math.max(0, Math.min(reverseRange.length - newCount, s)));
            }
        }
    };

    const onTouchEnd = () => {
        touchState.current = null;
    };

    const visibleRange = reverseRange.slice(visibleStart, visibleStart + visibleCount);

    return (
        <div className="overflow-x-auto border rounded bg-white shadow" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
            <div
                className="grid"
                style={{
                    gridTemplateColumns: `minmax(64px,12vw) repeat(${steps}, minmax(28px,6vw))`,
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

                {visibleRange.map((note) => (
                    <div key={note} className="contents">
                        {/* Note Label */}
                        <div className="border text-xs sm:text-sm flex items-center justify-center bg-gray-100 sticky left-0 z-10">
                            {note}
                        </div>

                        {/* Timeline Cells */}
                        {Array.from({ length: steps }).map((_, stepIndex) => {
                            const isActive = !!(melody[stepIndex] && note.startsWith(melody[stepIndex] as string));
                            const isMeasure = stepIndex % 4 === 0;

                            const cellClasses = `border h-8 sm:h-10 cursor-pointer transition flex items-center justify-center select-none focus:outline-none ${isActive ? "bg-blue-500 text-white" : "bg-white hover:bg-gray-100"
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