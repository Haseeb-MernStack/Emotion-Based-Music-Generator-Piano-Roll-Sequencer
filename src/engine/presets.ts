export type Preset = {
  name: string;
  key: string;
  emotion: string;
  tempo: number;
};

export const PRESETS: Preset[] = [
  { name: "Sunrise Pop", key: "C", emotion: "happy", tempo: 110 },
  { name: "Late Night Chill", key: "A", emotion: "chill", tempo: 70 },
  { name: "Epic Trailer", key: "D", emotion: "epic", tempo: 140 },
  { name: "Melancholy", key: "E", emotion: "sad", tempo: 60 },
  { name: "Dark Groove", key: "C", emotion: "dark", tempo: 90 },
];

export default PRESETS;
