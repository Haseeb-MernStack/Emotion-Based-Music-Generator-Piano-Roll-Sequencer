import { useMemo, useState } from "react";
import { useComposerStore } from "../features/composer/composer.store";

type SnapshotView = {
  key: string;
  emotion: string;
  melody: (string | null)[];
  chords: string[][];
  tempo: number;
  scale?: string;
};

export default function HistoryPanel() {
  const { past, undo, redo } = useComposerStore();
  const [open, setOpen] = useState(false);

  const items = useMemo(() => {
    return (past || []).slice().reverse().slice(0, 20) as SnapshotView[];
  }, [past]);

  const restore = (snap: SnapshotView) => {
    useComposerStore.setState({
      key: snap.key,
      emotion: snap.emotion as any,
      melody: snap.melody,
      chords: snap.chords,
      tempo: snap.tempo,
      scale: (snap.scale as any) || undefined,
    } as any);
  };

  return (
    <aside className="w-full sm:w-64 bg-slate-800 text-slate-100 rounded p-3 shadow">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold">History</h3>
        <button className="sm:hidden px-2 py-1 bg-slate-700 text-slate-100 rounded text-xs" onClick={() => setOpen((v) => !v)}>{open ? 'Hide' : 'Show'}</button>
      </div>

      {(!open || typeof window === 'undefined' || window.innerWidth >= 640) && (
        <>
          <div className="flex gap-2 mb-3">
            <button onClick={undo} className="px-2 py-1 bg-slate-700 text-slate-100 rounded">Undo</button>
            <button onClick={redo} className="px-2 py-1 bg-slate-700 text-slate-100 rounded">Redo</button>
          </div>
          <div className="h-64 overflow-auto space-y-2">
            {items.length === 0 && <div className="text-xs text-slate-400">No history yet</div>}
            {items.map((s, i) => (
              <div key={i} className="p-2 border border-slate-700 rounded flex items-center justify-between bg-slate-800">
                <div className="text-xs">
                  <div className="font-medium">{s.key} • {s.emotion}</div>
                  <div className="text-slate-400">{s.tempo} BPM • {s.scale}</div>
                </div>
                <div className="ml-2 shrink-0">
                  <button onClick={() => restore(s)} className="px-2 py-1 bg-indigo-500 text-white rounded text-xs">Restore</button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs text-slate-400">Snapshots persist across reloads.</div>
        </>
      )}
    </aside>
  );
}
