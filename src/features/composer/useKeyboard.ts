import { useEffect } from "react";
import * as Tone from "tone";
import { useComposerStore } from "./composer.store";

const KEY_MAP: Record<string, string> = {
  a: "C4",
  w: "C#4",
  s: "D4",
  e: "D#4",
  d: "E4",
  f: "F4",
  t: "F#4",
  g: "G4",
  y: "G#4",
  h: "A4",
  u: "A#4",
  j: "B4",
  k: "C5",
};

export default function useKeyboard() {
  const { toggleNote } = useComposerStore();

  useEffect(() => {
    const synth = new Tone.Synth().toDestination();

    const handleKeyDown = async (e: KeyboardEvent) => {
      const note = KEY_MAP[e.key.toLowerCase()];
      if (!note) return;

      await Tone.start();
      synth.triggerAttackRelease(note, "8n");

      // Optional: add to first empty step
      toggleNote(note, 0);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [toggleNote]);
}
