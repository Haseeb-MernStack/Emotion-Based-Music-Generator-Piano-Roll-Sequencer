import { describe, it, expect } from 'vitest';
import { generateFromEmotion } from './emotion.generator';
import type { Emotion } from '../emotion/emotion.config';

describe('emotion.generator', () => {
  it('generates melody and chords for a given key/emotion', async () => {
    const res = await generateFromEmotion('C', 'happy' as Emotion);
    expect(res).toHaveProperty('scale');
    expect(res).toHaveProperty('melody');
    expect(res).toHaveProperty('chords');
    expect(Array.isArray(res.melody)).toBe(true);
    expect(Array.isArray(res.chords)).toBe(true);
  });
});
