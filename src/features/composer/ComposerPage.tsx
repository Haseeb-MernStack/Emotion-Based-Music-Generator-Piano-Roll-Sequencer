import PianoRoll from "./PianoRoll";
import useKeyboardSynth from "./useKeyboardSynth";
import useKeyboard from "./useKeyboard";
import ComposerControls from "./ComposerControls";
import Header from "../../components/Header";
import HistoryPanel from "../../components/HistoryPanel";
import { ToastProvider } from "../../components/Toast";

export default function ComposerPage() {

    useKeyboardSynth();
    useKeyboard();

    return (
        <ToastProvider>
            <div className="min-h-screen bg-gradient-to-b from-gray-900 via-slate-900 to-black text-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8">
                    <Header />

                    <div className="mt-6 bg-gradient-to-r from-slate-800/60 to-slate-900/60 border border-slate-700/40 rounded-2xl shadow-2xl p-6">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight">Composer</h1>
                                <p className="mt-1 text-slate-400">Create premium-sounding melodies, chords and exports — fast.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="hidden sm:flex items-center gap-3">
                                    <div className="px-3 py-1 rounded-full backdrop-blur-xl text-sm text-slate-300">Premium Theme</div>
                                    <div className="px-3 py-1 rounded-full bg-emerald-600 text-sm font-medium">Battle Winner</div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-start gap-3 p-3 backdrop-blur-xl rounded-lg">
                                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white">1</div>
                                <div>
                                    <div className="text-sm font-semibold">Pick an Emotion</div>
                                    <div className="text-xs text-slate-400">Choose mood like Happy, Sad or Epic to guide the generator.</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 backdrop-blur-xl rounded-lg">
                                <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white">2</div>
                                <div>
                                    <div className="text-sm font-semibold">Generate Melody</div>
                                    <div className="text-xs text-slate-400">Press Generate to create a melody and chords instantly.</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 backdrop-blur-xl rounded-lg">
                                <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-white">3</div>
                                <div>
                                    <div className="text-sm font-semibold">Preview & Export</div>
                                    <div className="text-xs text-slate-400">Play, tweak tempo/swing, then export as MIDI or WAV.</div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
                            <div className="lg:col-span-3 space-y-4">
                                <div className="bg-gradient-to-b from-white/5 to-white/5 border border-white/10 rounded-xl p-4">
                                    <ComposerControls />
                                </div>

                                <div className="mt-4 bg-black/40 border border-white/10 rounded-xl p-4">
                                    <PianoRoll />
                                </div>
                            </div>

                            <div className="lg:col-span-1 relative">
                                <div className="sticky top-6 space-y-4">
                                    <div className="backdrop-blur-xl border border-slate-700/40 rounded-xl p-4">
                                        <HistoryPanel />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ToastProvider>
    );
}