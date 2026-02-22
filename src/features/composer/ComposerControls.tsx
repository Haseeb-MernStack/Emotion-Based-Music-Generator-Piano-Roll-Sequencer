import { useEffect, useRef, useState } from "react";
import { useComposerStore } from "./composer.store";
import { playComposition } from "../../lib/audio";
import { PRESETS } from "../../engine/presets";
import { useToast } from "../../components/toast.context";
import MobileBottomSheet from "../../components/MobileBottomSheet";

const inputClass = "px-3 py-2 bg-white/5 backdrop-blur border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition";

const buttonClass = "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50";

export default function ComposerControls() {
    const {
        key,
        emotion,
        tempo,
        setEmotion,
        setComposition,
        melody,
        chords,
        swing,
        quantize,
        undo,
        redo,
        setQuantize,
        setSwing,
    } = useComposerStore();

    const workerRef = useRef<Worker | null>(null);
    const { addToast } = useToast();
    const [sheetOpen, setSheetOpen] = useState(false);
    const [localLoading, setLocalLoading] = useState(false);

    useEffect(() => {
        try {
            // @ts-ignore
            workerRef.current = new Worker(new URL("../../workers/generator.worker.ts", import.meta.url), { type: "module" });
            workerRef.current.onmessage = (ev: MessageEvent) => {
                const { type, result, error } = ev.data || {} as Record<string, unknown>;
                if (type === "result") {
                    setComposition(result as any);
                    try { addToast({ message: "Generated composition", type: "success" }); } catch (e) { console.warn(e); }
                } else if (type === "error") {
                    console.error("Generator worker error:", error);
                    try { addToast({ message: "Generation failed", type: "error" }); } catch (e) { console.warn(e); }
                }
            };
        } catch (err) {
            console.warn("Worker creation failed, will fall back to dynamic import", err);
        }

        return () => {
            if (workerRef.current) {
                workerRef.current.terminate();
                workerRef.current = null;
            }
        };
    }, [setComposition, addToast]);

    const handleGenerate = async () => {
        if (workerRef.current) {
            workerRef.current.postMessage({ type: "generateFromEmotion", payload: { root: key, emotion } });
            return;
        }

        try {
            const mod: any = await import("../../engine/generators/emotion.generator");
            const result: any = await mod.generateFromEmotion(key, emotion);
            result.melody = (result.melody as any).map((m: any) => m ?? null);
            setComposition(result as any);
            try { addToast({ message: "Generated composition", type: "success" }); } catch (e) { console.warn(e); }
        } catch (err) {
            console.error("Failed to load generator:", err);
            try { addToast({ message: "Generation failed", type: "error" }); } catch (e) { console.warn(e); }
        }
    };

    const handlePlay = () => {
        playComposition(melody, chords, tempo, swing, quantize);
    };

    const handleClear = () => {
        setComposition({ melody: Array(16).fill(null), chords: [], tempo } as any);
        try { addToast({ message: "Cleared composition", type: "info" }); } catch { }
    };

    const handleSave = () => {
        const data = { key, emotion, tempo, melody, chords };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "composition.json";
        a.click();
        URL.revokeObjectURL(url);
        try { addToast({ message: "Composition saved", type: "success" }); } catch { }
    };

    const handleExportMidi = async () => {
        try {
            const mod = await import("../../engine/exporters/midi.exporter");
            const blob = mod.exportToMidi(melody, chords, tempo);
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "composition.mid";
            a.click();
            URL.revokeObjectURL(url);
            try { addToast({ message: "MIDI exported", type: "success" }); } catch (e) { console.warn(e); }
        } catch (err) {
            console.error("MIDI export failed:", err);
            try { addToast({ message: "MIDI export failed", type: "error" }); } catch (e) { console.warn(e); }
        }
    };

    const handleExportWav = async () => {
        try {
            const mod = await import("../../engine/exporters/wav.exporter");
            const blob = await mod.renderToWav(melody, chords, tempo);
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "composition.wav";
            a.click();
            URL.revokeObjectURL(url);
            try { addToast({ message: "WAV exported", type: "success" }); } catch (e) { console.warn(e); }
        } catch (err) {
            console.error("WAV export failed:", err);
            try { addToast({ message: "WAV export failed", type: "error" }); } catch (e) { console.warn(e); }
        }
    };

    // Preset application and batch export
    const [batchRunning, setBatchRunning] = useState(false);
    const [batchProgress, setBatchProgress] = useState(0);

    const applyPreset = (p: (typeof PRESETS)[number]) => {
        useComposerStore.setState({ key: p.key, tempo: p.tempo });
        setEmotion(p.emotion as unknown as any);
    };

    const handleBatchExport = async () => {
        setBatchRunning(true);
        setBatchProgress(0);
        for (let i = 0; i < PRESETS.length; i++) {
            const p = PRESETS[i];
            try {
                const mod: any = await import("../../engine/generators/emotion.generator");
                const comp: any = await mod.generateFromEmotion(p.key, p.emotion);
                comp.melody = (comp.melody as any).map((m: any) => m ?? null);

                // Export MIDI
                const midiMod = await import("../../engine/exporters/midi.exporter");
                const midiBlob = midiMod.exportToMidi(comp.melody, comp.chords, p.tempo);
                const midiUrl = URL.createObjectURL(midiBlob);
                const a1 = document.createElement("a");
                a1.href = midiUrl;
                a1.download = `${p.name.replace(/\s+/g, "_")}.mid`;
                a1.click();
                URL.revokeObjectURL(midiUrl);

                // Export WAV
                const wavMod = await import("../../engine/exporters/wav.exporter");
                const wavBlob = await wavMod.renderToWav(comp.melody, comp.chords, p.tempo);
                const wavUrl = URL.createObjectURL(wavBlob);
                const a2 = document.createElement("a");
                a2.href = wavUrl;
                a2.download = `${p.name.replace(/\s+/g, "_")}.wav`;
                a2.click();
                URL.revokeObjectURL(wavUrl);
            } catch (err) {
                console.error("Batch export failed for preset", p.name, err);
                try { addToast({ message: `Batch export failed: ${p.name}`, type: "error" }); } catch (e) { console.warn(e); }
            }
            setBatchProgress(Math.round(((i + 1) / PRESETS.length) * 100));
            // small delay to keep UI responsive
            await new Promise((r) => setTimeout(r, 150));
        }
        setBatchRunning(false);
        try { addToast({ message: "Batch export complete", type: "success" }); } catch { }
    };

    // Derived UI state
    const hasNotes = !!(melody && (melody as any).some((m: any) => m != null)) || (chords && chords.length > 0);

    return (
        <>
            <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 bg-linear-to-r from-white/5 to-white/10 rounded-2xl backdrop-blur-xl border border-white/10 shadow-2xl flex flex-col xl:flex-row gap-8">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 items-start md:gap-8">

                    <div className="min-w-0 flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6 w-full">
                        <div className="flex items-center gap-3">
                            <label className="text-sm font-medium">Emotion</label>
                            <select
                                value={emotion}
                                onChange={(e) => setEmotion(e.target.value as any)}
                                className='px-3 py-2 text-white border border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition w-full sm:w-40'>
                                <option className="bg-gray-800 text-white" value="happy">Happy</option>
                                <option className="bg-gray-800 text-white" value="sad">Sad</option>
                                <option className="bg-gray-800 text-white" value="epic">Epic</option>
                                <option className="bg-gray-800 text-white" value="chill">Chill</option>
                                <option className="bg-gray-800 text-white" value="dark">Dark</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-3">
                            <label className="text-sm font-medium">Presets</label>
                            <select
                                value={""}
                                onChange={(e) => {
                                    const name = e.target.value;
                                    const p = PRESETS.find((x) => x.name === name);
                                    if (p) applyPreset(p);
                                }}
                                className="px-3 py-2 text-white border border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition w-full sm:w-40"
                            >
                                <option className="bg-gray-800 text-white" value="">Select preset...</option>
                                {PRESETS.map((p) => (
                                    <option key={p.name} value={p.name} className="bg-gray-800 text-white">
                                        {p.name} — {p.emotion} — {p.tempo}BPM
                                    </option>
                                ))}
                            </select>
                            <button onClick={handleBatchExport} disabled={batchRunning}
                                className={`shrink-0 ${buttonClass} bg-indigo-600 hover:bg-indigo-700 text-white`}>
                                {batchRunning ? `Exporting ${batchProgress}%` : "Batch Export"}
                            </button>
                        </div>
                    </div>

                    <div className="min-w-0 flex items-center gap-3 md:mt-20 lg:mt-16 w-full">
                        <label className="text-sm font-medium min-w-[72px]">Tempo</label>
                        <input
                            className="flex-1 w-full max-w-full"
                            type="range"
                            min={60}
                            max={200}
                            value={tempo}
                            onChange={(e) => {
                                const val = Number(e.target.value);
                                useComposerStore.setState({ tempo: val });
                            }}
                        />
                        <span className="ml-2 text-sm min-w-[64px] text-right">{tempo} BPM</span>
                    </div>

                    <div className="min-w-0 flex items-start md:-mt-14.5 lg:-mt-22 sm:items-center gap-3">
                        <label className="text-sm font-medium">Quantize</label>
                        <select
                            value={quantize}
                            onChange={(e) =>
                                setQuantize(e.target.value as any)}
                            className="px-3 py-2 text-white border border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition w-full sm:w-40">
                            <option className="bg-gray-800 text-white" value="1/4">1/4</option>
                            <option className="bg-gray-800 text-white" value="1/8">1/8</option>
                            <option className="bg-gray-800 text-white" value="1/16">1/16</option>
                        </select>

                        <div className="items-center hidden md:flex gap-2 w-full sm:w-auto">
                            <label className="text-sm font-medium">Swing</label>
                            <input className="w-full sm:w-36" type="range" min={0} max={50} value={swing} onChange={(e) => setSwing(Number(e.target.value))} />
                            <span className="w-12 text-right text-sm">{swing}%</span>
                        </div>
                    </div>

                </div>

                <div className="flex flex-wrap items-center gap-3 xl:ml-auto lg:mt-40 w-full xl:w-auto">
                    <button onClick={async () => { setLocalLoading(true); await handleGenerate(); setLocalLoading(false); }}
                        className={`shrink-0 ${buttonClass} bg-indigo-600 hover:bg-indigo-700 text-white`}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2v20M2 12h20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        {localLoading ? 'Generating...' : 'Generate'}
                    </button>

                    <button onClick={handlePlay} disabled={!hasNotes}
                        className={`shrink-0 ${buttonClass} bg-indigo-600 hover:bg-indigo-700 text-white`}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 3v18l15-9-15-9z" fill="currentColor" /></svg>
                        Play
                    </button>
                    <button onClick={undo} className={`shrink-0 ${buttonClass} bg-indigo-600 hover:bg-indigo-700 text-white`}>Undo</button>
                    <button onClick={redo} className={`shrink-0 ${buttonClass} bg-indigo-600 hover:bg-indigo-700 text-white`}>Redo</button>

                    <button onClick={handleClear} disabled={!hasNotes} className={`shrink-0 ${buttonClass} bg-gray-700 hover:bg-gray-600 disabled:opacity-50`}>Clear</button>

                    <button onClick={handleSave} disabled={!hasNotes} className={`shrink-0 ${buttonClass} bg-blue-600 hover:bg-blue-700 disabled:opacity-50`}>Save</button>

                    <button onClick={handleExportMidi} disabled={!hasNotes} className={`shrink-0 ${buttonClass} bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50`}>Export MIDI</button>
                    <button onClick={handleExportWav} disabled={!hasNotes} className={`shrink-0 ${buttonClass} bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50`}>Export WAV</button>

                    <button onClick={() => setSheetOpen(true)} className={`shrink-0 ${buttonClass} bg-indigo-600 hover:bg-indigo-700 text-white`}>Advanced</button>
                </div>
            </div>

            <MobileBottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <label className="text-sm font-medium">Quantize</label>
                            <div>
                                <select
                                    value={quantize}
                                    onChange={(e) => setQuantize(e.target.value as any)}
                                    className={`${inputClass} w-full`}>
                                    <option className="bg-gray-800 text-white" value="1/4">1/4</option>
                                    <option className="bg-gray-800 text-white" value="1/8">1/8</option>
                                    <option className="bg-gray-800 text-white" value="1/16">1/16</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Swing</label>
                            <input className="w-28" type="range" min={0} max={50} value={swing} onChange={(e) => setSwing(Number(e.target.value))} />
                            <div className="text-xs">{swing}%</div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button onClick={handleExportMidi} className={`shrink-0 ${buttonClass} bg-indigo-600 hover:bg-indigo-700 text-white`}>Export MIDI</button>
                        <button onClick={handleExportWav} className={`shrink-0 ${buttonClass} bg-indigo-600 hover:bg-indigo-700 text-white`}>Export WAV</button>
                    </div>
                </div>
            </MobileBottomSheet>
        </>
    );
}
