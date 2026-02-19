#!/usr/bin/env node
import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';

function usage() {
  console.log(`Usage: node scripts/generate-demo.js <input> <output> [--start seconds] [--duration seconds] [--fps n] [--scale WxH]

Example:
  node scripts/generate-demo.js assets/raw-demo.mp4 assets/demo.gif --fps 12 --scale 600:-1 --duration 6
`);
}

const argv = process.argv.slice(2);
if (argv.length < 2) {
  usage();
  process.exit(1);
}

const input = argv[0];
const output = argv[1];

const opts = { start: 0, duration: null, fps: 12, scale: '600:-1' };
for (let i = 2; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--start') opts.start = Number(argv[++i] || 0);
  else if (a === '--duration') opts.duration = Number(argv[++i] || 0);
  else if (a === '--fps') opts.fps = Number(argv[++i] || 12);
  else if (a === '--scale') opts.scale = argv[++i] || '600:-1';
}

function checkFfmpeg() {
  const res = spawnSync('ffmpeg', ['-version'], { encoding: 'utf8' });
  return res.status === 0 || (res.stdout && res.stdout.includes('ffmpeg'));
}

if (!checkFfmpeg()) {
  console.error('ffmpeg not found in PATH. Please install ffmpeg and ensure it is available in your shell PATH.');
  process.exit(2);
}

const dir = path.dirname(output);
if (dir && !fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const palette = path.join(path.dirname(output), `${path.basename(output, path.extname(output))}.palette.png`);

// Build input args
const common = [];
if (opts.start) {
  common.push('-ss', String(opts.start));
}
if (opts.duration) {
  common.push('-t', String(opts.duration));
}
common.push('-i', input);

// Step 1: generate palette
const palArgs = [...common, '-vf', `fps=${opts.fps},scale=${opts.scale}:flags=lanczos,palettegen`, '-y', palette];
console.log('Generating palette...', palArgs.join(' '));
let r = spawnSync('ffmpeg', palArgs, { stdio: 'inherit' });
if (r.status !== 0) {
  console.error('Failed to generate palette');
  process.exit(r.status || 3);
}

// Step 2: generate gif using palette
const gifArgs = [...common, '-i', palette, '-lavfi', `fps=${opts.fps},scale=${opts.scale}:flags=lanczos[x];[x][1:v]paletteuse`, '-y', output];
console.log('Generating gif...', gifArgs.join(' '));
r = spawnSync('ffmpeg', gifArgs, { stdio: 'inherit' });
if (r.status !== 0) {
  console.error('Failed to generate GIF');
  process.exit(r.status || 4);
}

try { fs.unlinkSync(palette); } catch (e) { /* ignore */ }

console.log('GIF generated at', output);
