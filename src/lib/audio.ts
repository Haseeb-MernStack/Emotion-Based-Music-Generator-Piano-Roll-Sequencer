import * as Tone from "tone";

let synth: Tone.PolySynth | null = null;

async function initAudio() {
    if (!synth) {
        await Tone.start();
        synth = new Tone.PolySynth(Tone.Synth).toDestination();
    }
}

export async function playComposition(
    melody: (string | null)[],
    chords: string[][],
    tempo: number
) {
    await initAudio();

    Tone.Transport.bpm.value = tempo;

    melody.forEach((note, i) => {
        if (!note) return; // skip empty steps
        synth!.triggerAttackRelease(
            `${note}4`,
            "8n",
            Tone.now() + i * 0.4
        );
    });

    chords.forEach((chord, i) => {
        synth!.triggerAttackRelease(
            chord.map((n) => `${n}3`),
            "1n",
            Tone.now() + i * 1
        );
    });
}