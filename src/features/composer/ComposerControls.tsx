import { useEffect, useRef, useState } from "react";
import { useComposerStore } from "./composer.store";
import { playComposition } from "../../lib/audio";
import { PRESETS } from "../../engine/presets";
import { useToast } from "../../components/toast.context";
import MobileBottomSheet from "../../components/MobileBottomSheet";

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
            const mod = await import("../../engine/generators/emotion.generator");
            const result = await mod.generateFromEmotion(key as unknown as string, emotion as unknown as string);
            result.melody = result.melody.map((m: unknown) => (m ?? null) as string | null);
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
                    const mod = await import("../../engine/generators/emotion.generator");
                    const comp = await mod.generateFromEmotion(p.key as unknown as string, p.emotion as unknown as string);
                    comp.melody = comp.melody.map((m: unknown) => (m ?? null) as string | null);

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

    return (
        <>
            <div className="p-4 bg-white rounded shadow-md flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-3 sm:space-y-0">
                <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium">Emotion</label>
                    <select value={emotion} onChange={(e) => setEmotion(e.target.value as any)} className="px-3 py-2 border rounded">
                        <option value="happy">Happy</option>
                        <option value="sad">Sad</option>
                        <option value="epic">Epic</option>
                        <option value="chill">Chill</option>
                        <option value="dark">Dark</option>
                    </select>
                </div>

                <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium">Presets</label>
                    <select
                        value={""}
                        onChange={(e) => {
                            const name = e.target.value;
                            const p = PRESETS.find((x) => x.name === name);
                            if (p) applyPreset(p);
                        }}
                        className="px-3 py-2 border rounded"
                    >
                        <option value="">Select preset...</option>
                        {PRESETS.map((p) => (
                            <option key={p.name} value={p.name}>
                                {p.name} — {p.emotion} — {p.tempo}BPM
                            </option>
                        ))}
                    </select>
                    <button onClick={handleBatchExport} disabled={batchRunning} className="px-3 py-2 bg-emerald-600 text-white rounded">
                        {batchRunning ? `Exporting... ${batchProgress}%` : "Batch Export Presets"}
                    </button>
                </div>

                <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium">Tempo</label>
                    <input
                        className="w-36"
                        type="range"
                        min={60}
                        max={200}
                        value={tempo}
                        onChange={(e) => {
                            const val = Number(e.target.value);
                            useComposerStore.setState({ tempo: val });
                        }}
                    />
                    <span className="w-12 text-right">{tempo} BPM</span>
                </div>

                <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium">Quantize</label>
                    <select value={quantize} onChange={(e) => setQuantize(e.target.value as any)} className="px-3 py-2 border rounded">
                        <option value="1/4">1/4</option>
                        <option value="1/8">1/8</option>
                        <option value="1/16">1/16</option>
                    </select>

                    <label className="text-sm font-medium">Swing</label>
                    <input className="w-32" type="range" min={0} max={50} value={swing} onChange={(e) => setSwing(Number(e.target.value))} />
                    <span className="w-12 text-right">{swing}%</span>
                </div>

                <div className="flex flex-wrap items-center gap-2 ml-auto">
                    <button onClick={handleGenerate} className="px-3 sm:px-4 py-2 bg-linear-to-r from-purple-600 to-indigo-600 text-white rounded shadow text-sm">
                        Generate
                    </button>
                    <button onClick={handlePlay} className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded text-sm">
                        Play
                    </button>
                    <button onClick={undo} className="px-2 py-1 bg-gray-300 rounded text-sm">
                        Undo
                    </button>
                    <button onClick={redo} className="px-2 py-1 bg-gray-300 rounded text-sm">
                        Redo
                    </button>
                    <button onClick={handleClear} className="px-3 sm:px-4 py-2 bg-gray-200 rounded text-sm">
                        Clear
                    </button>
                    <button onClick={handleSave} className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded text-sm">
                        Save
                    </button>
                    <button onClick={handleExportMidi} className="px-3 sm:px-4 py-2 bg-yellow-600 text-white rounded text-sm">
                        Export MIDI
                    </button>
                    <button onClick={handleExportWav} className="px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded text-sm">
                        Export WAV
                    </button>
                    <button onClick={() => setSheetOpen(true)} className="sm:hidden px-3 py-2 bg-gray-100 rounded text-sm">
                        Advanced
                    </button>
                </div>
            </div>

            <MobileBottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <label className="text-sm font-medium">Quantize</label>
                            <div>
                                <select value={quantize} onChange={(e) => setQuantize(e.target.value as any)} className="px-3 py-2 border rounded w-full">
                                    <option value="1/4">1/4</option>
                                    <option value="1/8">1/8</option>
                                    <option value="1/16">1/16</option>
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
                        <button onClick={handleExportMidi} className="flex-1 px-3 py-2 bg-yellow-500 text-white rounded">Export MIDI</button>
                        <button onClick={handleExportWav} className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded">Export WAV</button>
                    </div>
                </div>
            </MobileBottomSheet>
        </>
    );
}
