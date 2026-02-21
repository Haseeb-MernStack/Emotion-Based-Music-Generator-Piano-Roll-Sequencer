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

    // UI/interaction state
    const isMouseDown = useRef(false);
    const paintMode = useRef<'draw' | 'erase' | null>(null);
    const [hover, setHover] = useState<{ note?: string; step?: number; x?: number; y?: number } | null>(null);

    useEffect(() => {
        synthRef.current = new Tone.PolySynth(Tone.Synth).toDestination();
    }, []);

    useEffect(() => {
        const onUp = () => {
            isMouseDown.current = false;
            paintMode.current = null;
        };
        window.addEventListener('mouseup', onUp);
        return () => window.removeEventListener('mouseup', onUp);
    }, []);

    const handleClick = async (note: string, step: number) => {
        await Tone.start(); // required for browser
        // toggle the note at the step
        toggleNote(note, step);
        synthRef.current?.triggerAttackRelease(note, "8n");
    };

    const handleCellMouseDown = async (note: string, step: number, ev: React.MouseEvent) => {
        ev.preventDefault();
        isMouseDown.current = true;
        // determine mode from current state
        const current = melody[step];
        paintMode.current = current === note ? 'erase' : 'draw';
        if (paintMode.current === 'draw') {
            // if not already the note, set it
            if (melody[step] !== note) toggleNote(note, step);
        } else {
            // erase
            if (melody[step] === note) toggleNote(note, step);
        }
        try { await Tone.start(); synthRef.current?.triggerAttackRelease(note, "8n"); } catch { }
    };

    const handleCellEnterWhileDown = (note: string, step: number) => {
        if (!isMouseDown.current || !paintMode.current) return;
        if (paintMode.current === 'draw') {
            if (melody[step] !== note) toggleNote(note, step);
        } else {
            if (melody[step] === note) toggleNote(note, step);
        }
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

    const zoomIn = () => setVisibleCount((c) => Math.max(4, c - 2));
    const zoomOut = () => setVisibleCount((c) => Math.min(reverseRange.length, c + 2));
    const panLeft = () => setVisibleStart((s) => Math.max(0, s - 1));
    const panRight = () => setVisibleStart((s) => Math.max(0, Math.min(reverseRange.length - visibleCount, s + 1)));

    const containerRef = useRef<HTMLDivElement | null>(null);

    return (
        <div ref={containerRef} className="relative border rounded bg-white/5 shadow">
            <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                    <div className="text-sm font-semibold">Piano Roll</div>
                    <div className="text-xs text-slate-400">Click to toggle notes. Drag to paint.</div>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={panLeft} className="px-2 py-1 bg-slate-700 text-white rounded">◀</button>
                    <button onClick={panRight} className="px-2 py-1 bg-slate-700 text-white rounded">▶</button>
                    <button onClick={zoomIn} className="px-2 py-1 bg-slate-700 text-white rounded">＋</button>
                    <button onClick={zoomOut} className="px-2 py-1 bg-slate-700 text-white rounded">－</button>
                </div>
            </div>

            <div className="overflow-x-auto" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
                <div
                    className="grid"
                    style={{
                        gridTemplateColumns: `minmax(64px,12vw) repeat(${steps}, minmax(28px,6vw))`,
                    }}
                >
                    {/* Header row with step numbers */}
                    <div className="contents">
                        <div className="sticky left-0 z-20 border bg-slate-800/40 text-xs flex items-center justify-center py-2">Step</div>
                        {Array.from({ length: steps }).map((_, stepIndex) => (
                            <div
                                key={`header-${stepIndex}`}
                                className={`border text-xs flex items-center justify-center py-2 ${stepIndex % 4 === 0 ? "border-l-2 border-slate-600 bg-slate-800/30" : "bg-slate-800/10"}`}
                            >
                                {stepIndex + 1}
                            </div>
                        ))}
                    </div>

                    {visibleRange.map((note) => (
                        <div key={note} className="contents">
                            {/* Note Label */}
                            <div className="sticky left-0 z-10 border bg-slate-800/30 text-xs sm:text-sm flex items-center justify-center py-2">{note}</div>

                            {/* Timeline Cells */}
                            {Array.from({ length: steps }).map((_, stepIndex) => {
                                const isActive = !!(melody[stepIndex] && note.startsWith(melody[stepIndex] as string));
                                const isMeasure = stepIndex % 4 === 0;
                                const isBlackKey = note.includes('#') || note.includes('b');

                                const base = isBlackKey ? 'bg-slate-900/60 text-slate-200' : 'bg-white/5 text-slate-100';
                                const activeCls = `bg-gradient-to-r from-indigo-500 to-emerald-400 text-white`;

                                const cellClasses = `border h-10 cursor-pointer transition flex items-center justify-center select-none focus:outline-none ${isActive ? activeCls : base} ${isMeasure ? "border-l-2 border-slate-600" : ""}`;

                                return (
                                    <div
                                        key={`${note}-${stepIndex}`}
                                        role="button"
                                        tabIndex={0}
                                        aria-pressed={isActive}
                                        className={cellClasses}
                                        onClick={() => handleClick(note, stepIndex)}
                                        onMouseDown={(e) => handleCellMouseDown(note, stepIndex, e)}
                                        onMouseEnter={() => handleCellEnterWhileDown(note, stepIndex)}
                                        onMouseMove={(e) => {
                                            try {
                                                const rect = containerRef.current?.getBoundingClientRect();
                                                if (rect) {
                                                    setHover({ note, step: stepIndex, x: e.clientX - rect.left, y: e.clientY - rect.top });
                                                } else {
                                                    setHover({ note, step: stepIndex, x: e.clientX, y: e.clientY });
                                                }
                                            } catch {
                                                setHover({ note, step: stepIndex, x: e.clientX, y: e.clientY });
                                            }
                                        }}
                                        onMouseLeave={() => setHover(null)}
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

            {hover && typeof window !== 'undefined' && window.innerWidth >= 640 && (
                <div style={{ position: 'absolute', left: hover.x! + 12, top: hover.y! + 12, zIndex: 60 }} className="pointer-events-none">
                    <div className="bg-black/80 text-xs text-white px-2 py-1 rounded shadow">{hover.note} • Step {hover.step! + 1}</div>
                </div>
            )}
        </div>
    );
}