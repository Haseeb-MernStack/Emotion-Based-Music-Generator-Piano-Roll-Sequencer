function noteNameToMidi(note: string) {
  // Accept formats like C, C#, D, Eb and append octave if missing
  const name = note.replace(/\s+/g, "");
  const m = name.match(/^([A-Ga-g])([#b]?)(\d?)$/);
  if (!m) return 60; // default C4
  const [, letter, accidental, octaveRaw] = m;
  const octave = octaveRaw ? Number(octaveRaw) : 4;
  const MAP: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const base = MAP[letter.toUpperCase()] ?? 0;
  let semitone = base;
  if (accidental === "#") semitone++;
  if (accidental === "b") semitone--;
  return 12 * (octave + 1) + semitone;
}

function writeUInt32BE(buf: number[], v: number) {
  buf.push((v >>> 24) & 0xff, (v >>> 16) & 0xff, (v >>> 8) & 0xff, v & 0xff);
}

function writeUInt16BE(buf: number[], v: number) {
  buf.push((v >>> 8) & 0xff, v & 0xff);
}

function varLen(value: number) {
  const buffer: number[] = [];
  let val = value & 0xffffffff;
  buffer.unshift(val & 0x7f);
  val >>= 7;
  while (val > 0) {
    buffer.unshift((val & 0x7f) | 0x80);
    val >>= 7;
  }
  return buffer;
}

export function exportToMidi(melody: (string | null)[], chords: string[][], tempo = 120) {
  const ticksPerQuarter = 480;
  const events: number[] = [];

  // tempo meta event (microseconds per quarter)
  const mpq = Math.round((60 / tempo) * 1000000);
  // Track: set tempo
  events.push(...varLen(0));
  events.push(0xff, 0x51, 0x03, (mpq >>> 16) & 0xff, (mpq >>> 8) & 0xff, mpq & 0xff);

  // For simplicity, we schedule melody as eighth notes and chords as whole notes
  const melodyDurationTicks = ticksPerQuarter / 2; // eighth note
  const chordDurationTicks = ticksPerQuarter; // quarter note

  let currentTick = 0;
  for (let i = 0; i < Math.max(melody.length, chords.length); i++) {
    // melody note
    const m = melody[i];
    if (m) {
      const noteNum = noteNameToMidi(m + "4");
      events.push(...varLen(currentTick === 0 ? 0 : 0));
      events.push(0x90, noteNum, 0x64); // note on
      events.push(...varLen(melodyDurationTicks));
      events.push(0x80, noteNum, 0x40); // note off
    }

    // chord at same index if present
    const chord = chords[i];
    if (chord && chord.length) {
      // note on for all chord notes
      events.push(...varLen(0));
      for (const note of chord) {
        const nnum = noteNameToMidi(note + "3");
        events.push(0x90, nnum, 0x60);
      }
      events.push(...varLen(chordDurationTicks));
      for (const note of chord) {
        const nnum = noteNameToMidi(note + "3");
        events.push(0x80, nnum, 0x40);
      }
    }

    currentTick += melodyDurationTicks;
  }

  // End of track
  events.push(...varLen(0));
  events.push(0xff, 0x2f, 0x00);

  const trackData = new Uint8Array(events);

  const header: number[] = [];
  // Header chunk
  header.push(...[0x4d, 0x54, 0x68, 0x64]);
  writeUInt32BE(header, 6);
  writeUInt16BE(header, 0); // format 0
  writeUInt16BE(header, 1); // one track
  writeUInt16BE(header, ticksPerQuarter);

  // Track chunk
  const trackHeader: number[] = [];
  trackHeader.push(...[0x4d, 0x54, 0x72, 0x6b]);
  writeUInt32BE(trackHeader, trackData.length);

  const out = new Uint8Array(header.length + trackHeader.length + trackData.length);
  let offset = 0;
  out.set(new Uint8Array(header), offset); offset += header.length;
  out.set(new Uint8Array(trackHeader), offset); offset += trackHeader.length;
  out.set(trackData, offset);

  return new Blob([out], { type: "audio/midi" });
}

export default exportToMidi;
