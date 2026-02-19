import { NOTES } from "./notes";


export const SCALES = {
    major: [0, 2, 4, 5, 7, 9, 11],
    minor: [0, 2, 3, 5, 7, 8, 10],
};

export function getScale(root: string, type: keyof typeof SCALES) {
    const rootIndex = NOTES.indexOf(root);
    return SCALES[type].map(
        step => NOTES[(rootIndex + step) % NOTES.length]
    );
}