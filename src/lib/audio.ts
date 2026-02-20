let synth: any = null;
let Tone: any = null;

async function initAudio() {
    if (!synth) {
        Tone = Tone || (await import("tone"));
        await Tone.start();
        synth = new Tone.PolySynth(Tone.Synth).toDestination();
    }
}

export async function playComposition(
    melody: (string | null)[],
    chords: string[][],
    tempo: number,
    swing = 0, // percent 0-50
    quantize: "1/4" | "1/8" | "1/16" = "1/8"
) {
    await initAudio();

    Tone.Transport.bpm.value = tempo;

    // base step: use quantize to determine step length
    const quarter = 60 / tempo;
    let baseStep = quarter / 2; // default eighth
    if (quantize === "1/4") baseStep = quarter;
    if (quantize === "1/16") baseStep = quarter / 4;

    melody.forEach((note, i) => {
        if (!note) return; // skip empty steps
        // compute time offset with simple swing: shift odd steps later
        const swingOffset = (i % 2 === 1) ? baseStep * (swing / 100) : 0;
        const time = Tone.now() + i * baseStep + swingOffset;
        synth.triggerAttackRelease(`${note}4`, "8n", time);
    });

    chords.forEach((chord, i) => {
        const time = Tone.now() + i * baseStep * 2; // chords on quarter grid
        synth.triggerAttackRelease(chord.map((n: string) => `${n}3`), "1n", time);
    });
}