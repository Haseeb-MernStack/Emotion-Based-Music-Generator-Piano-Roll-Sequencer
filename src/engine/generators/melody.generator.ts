

export function generateMelody(scale: string[], length = 8) {
    return Array.from({ length }, () =>
        scale[Math.floor(Math.random() * scale.length)]
    );
}