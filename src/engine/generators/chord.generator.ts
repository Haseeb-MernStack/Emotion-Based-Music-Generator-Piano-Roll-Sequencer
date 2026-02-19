

export function generateChord(scale: string[], degree: number) {
    return [
        scale[degree % scale.length],
        scale[(degree + 2) % scale.length],
        scale[(degree + 4) % scale.length],
    ];
}

export function generateProgression(
    scale: string[],
    progression: number[]
) {
    return progression.map((degree)=> [
        scale[degree % scale.length],
        scale[(degree + 2) % scale.length],
        scale[(degree + 4) % scale.length],
    ]);
}