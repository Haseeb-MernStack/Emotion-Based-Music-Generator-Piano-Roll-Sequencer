export function noteToFreq(noteWithOctave: string) {
  const names: any = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const m = noteWithOctave.match(/^([A-Ga-g])([#b]?)(\d)$/);
  if (!m) return 440;
  const [, l, accidental, octS] = m;
  let semitone = names[l.toUpperCase()];
  if (accidental === "#") semitone++;
  if (accidental === "b") semitone--;
  const octave = Number(octS);
  const midi = 12 * (octave + 1) + semitone;
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export function synthNote(buffer: Float32Array, start: number, len: number, freq: number, sampleRate: number, gain: number) {
  for (let i = 0; i < len; i++) {
    const idx = start + i;
    if (idx >= buffer.length) break;
    const t = i / sampleRate;
    const env = (1 - Math.exp(-5 * t)) * (1 - t / (len / sampleRate));
    buffer[idx] += Math.sin(2 * Math.PI * freq * t) * gain * env;
  }
}

export function renderComposition(melody: (string | null)[], chords: string[][], tempo: number, sampleRate = 44100) {
  const quarter = 60 / tempo;
  const melodyDur = quarter / 2; // eighth
  const chordDur = quarter; // quarter
  const totalSteps = Math.max(melody.length, chords.length);
  const totalTime = totalSteps * melodyDur + 1;
  const length = Math.ceil(totalTime * sampleRate);
  const out = new Float32Array(length);

  for (let i = 0; i < totalSteps; i++) {
    const t0 = Math.floor(i * melodyDur * sampleRate);
    const m = melody[i];
    if (m) {
      const freq = noteToFreq((m + "4").replace(/\s+/g, ""));
      synthNote(out, t0, Math.floor(melodyDur * sampleRate), freq, sampleRate, 0.25);
    }
    const chord = chords[i];
    if (chord && chord.length) {
      const ct0 = Math.floor(i * melodyDur * sampleRate);
      for (const n of chord) {
        const f = noteToFreq((n + "3").replace(/\s+/g, ""));
        synthNote(out, ct0, Math.floor(chordDur * sampleRate), f, sampleRate, 0.18);
      }
    }
  }

  let max = 0;
  for (let i = 0; i < out.length; i++) max = Math.max(max, Math.abs(out[i]));
  if (max > 1) for (let i = 0; i < out.length; i++) out[i] /= max;
  return out.buffer;
}

export function encodeWAV(arrayBuffer: ArrayBuffer, sampleRate = 44100) {
  const samples = new Float32Array(arrayBuffer);
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  function writeString(offset: number, s: string) {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
  }
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, samples.length * 2, true);
  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return buffer;
}

export default { renderComposition, encodeWAV };
