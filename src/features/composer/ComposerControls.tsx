import React from "react";
import { useComposerStore } from "./composer.store";
import { generateFromEmotion } from "../../engine/generators/emotion.generator";
import { playComposition } from "../../lib/audio";

export default function ComposerControls() {
  const { key, emotion, tempo, setEmotion, setComposition, melody, chords } = useComposerStore();

  const handleGenerate = () => {
    const result = generateFromEmotion(key, emotion);
    setComposition(result as any);
  };

  const handlePlay = () => {
    playComposition(melody, chords, tempo);
  };

  const handleClear = () => {
    setComposition({ melody: Array(16).fill(null), chords: [], tempo } as any);
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
  };

  return (
    <div className="p-4 bg-white rounded shadow-md flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-3 sm:space-y-0">
      <div className="flex items-center space-x-2">
        <label className="text-sm font-medium">Emotion</label>
        <select
          value={emotion}
          onChange={(e) => setEmotion(e.target.value as any)}
          className="px-3 py-2 border rounded"
        >
          <option value="happy">Happy</option>
          <option value="sad">Sad</option>
          <option value="epic">Epic</option>
          <option value="chill">Chill</option>
          <option value="dark">Dark</option>
        </select>
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

      <div className="flex items-center space-x-2 ml-auto">
        <button onClick={handleGenerate} className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded shadow">
          Generate
        </button>
        <button onClick={handlePlay} className="px-4 py-2 bg-green-600 text-white rounded">
          Play
        </button>
        <button onClick={handleClear} className="px-4 py-2 bg-gray-200 rounded">
          Clear
        </button>
        <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded">
          Save
        </button>
      </div>
    </div>
  );
}
