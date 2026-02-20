// Simple PCM renderer worker: synthesizes sine waves for melody and chords and returns WAV ArrayBuffer
self.addEventListener("message", (ev: MessageEvent) => {
  const { type, payload } = ev.data || {} as Record<string, unknown>;
  if (type === "render") {
    try {
      const pl = payload as Record<string, unknown>;
      const melody = pl.melody as (string | null)[];
      const chords = pl.chords as string[][];
      const tempo = pl.tempo as number;
      const sampleRate = (pl.sampleRate as number) || 44100;
      const audioBuffer = renderComposition(melody, chords, tempo, sampleRate);
      const wav = encodeWAV(audioBuffer, sampleRate);
      (postMessage as any)({ type: "result", buffer: wav }, [wav as ArrayBuffer]);
    } catch (err) {
      (postMessage as unknown as typeof postMessage)({ type: "error", error: String(err) });
    }
  }
});

function noteToFreq(noteWithOctave: string) {
  const names = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 } as any;
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

function renderComposition(melody: (string | null)[], chords: string[][], tempo: number, sampleRate: number): ArrayBuffer {
  const quarter = 60 / tempo;
  const melodyDur = quarter / 2; // eighth
  const chordDur = quarter; // quarter
  const totalSteps = Math.max(melody.length, chords.length);
  const totalTime = totalSteps * melodyDur + 1; // pad 1s
  const length = Math.ceil(totalTime * sampleRate);
  const out = new Float32Array(length);

  for (let i = 0; i < totalSteps; i++) {
    const t0 = Math.floor(i * melodyDur * sampleRate);
    // melody
    const m = melody[i];
    if (m) {
      const freq = noteToFreq((m + "4").replace(/\s+/g, ""));
      synthNote(out, t0, Math.floor(melodyDur * sampleRate), freq, sampleRate, 0.25);
    }
    // chord
    const chord = chords[i];
    if (chord && chord.length) {
      const ct0 = Math.floor(i * melodyDur * sampleRate);
      for (const n of chord) {
        const f = noteToFreq((n + "3").replace(/\s+/g, ""));
        synthNote(out, ct0, Math.floor(chordDur * sampleRate), f, sampleRate, 0.18);
      }
    }
  }

  // simple normalization
  let max = 0;
  for (let i = 0; i < out.length; i++) max = Math.max(max, Math.abs(out[i]));
  if (max > 1) for (let i = 0; i < out.length; i++) out[i] /= max;
  return out.buffer;
}

function synthNote(buffer: Float32Array, start: number, len: number, freq: number, sampleRate: number, gain: number) {
  for (let i = 0; i < len; i++) {
    const idx = start + i;
    if (idx >= buffer.length) break;
    const t = i / sampleRate;
    // simple sine + mild envelope
    const env = (1 - Math.exp(-5 * t)) * (1 - t / (len / sampleRate));
    buffer[idx] += Math.sin(2 * Math.PI * freq * t) * gain * env;
  }
}

function encodeWAV(arrayBuffer: ArrayBuffer, sampleRate: number): ArrayBuffer {
  const samples = new Float32Array(arrayBuffer);
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  /* RIFF identifier */ writeString(view, 0, 'RIFF');
  /* file length */ view.setUint32(4, 36 + samples.length * 2, true);
  /* RIFF type */ writeString(view, 8, 'WAVE');
  /* format chunk identifier */ writeString(view, 12, 'fmt ');
  /* format chunk length */ view.setUint32(16, 16, true);
  /* sample format (raw) */ view.setUint16(20, 1, true);
  /* channel count */ view.setUint16(22, 1, true);
  /* sample rate */ view.setUint32(24, sampleRate, true);
  /* byte rate (sample rate * block align) */ view.setUint32(28, sampleRate * 2, true);
  /* block align (channel count * bytes per sample) */ view.setUint16(32, 2, true);
  /* bits per sample */ view.setUint16(34, 16, true);
  /* data chunk identifier */ writeString(view, 36, 'data');
  /* data chunk length */ view.setUint32(40, samples.length * 2, true);

  // write samples
  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return buffer;
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

export {};
