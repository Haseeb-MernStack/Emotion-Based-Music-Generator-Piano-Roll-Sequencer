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

    // Composer state and actions are used inside child components.

    return (
        <ToastProvider>
            <div className="p-8">
                <Header />

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-3 space-y-4">
                        <ComposerControls />
                        <div className="mt-4">
                            <PianoRoll />
                        </div>
                    </div>
                    <div className="lg:col-span-1">
                        <HistoryPanel />
                    </div>
                </div>
            </div>
        </ToastProvider>
    );
}