# Music Composer (React + TypeScript + Vite)

Music Composer is a compact, demo-grade music sketching app that generates short musical ideas and lets you edit, play and export them using a piano-roll UI. It focuses on performance, small initial bundles (lazy-loading), and workerized heavy work so the UI stays snappy on mobile and desktop.

This README explains everything a new visitor or contributor needs to know: features, pages/routes, setup, development workflow, exports, CI/tests, and how to fork & contribute.

## Demo & Screenshots

Place these files in the repository `assets/` folder (project root) so GitHub can render them in the README:

- `assets/demo.gif` — short animated demo (recommended: 600×340 GIF)
- `assets/home.png` — Home page screenshot (recommended: 1280×720 PNG)
- `assets/composer.png` — Composer page screenshot (recommended: 1280×720 PNG)
- `assets/notfound.png` — 404 / NotFound screenshot (recommended: 800×400 PNG)

Example embed (relative paths used for GitHub rendering):

![App Demo](assets/demo.gif)

If images don't appear, ensure they are committed and pushed, use relative paths, and check filename case.

## Features

- Emotion-driven generators: dynamic, emotion-based melody and chord generation (uses `src/engine/generators/*`).
- Piano-roll editor: 16-step grid with note toggling, responsive layout and touch gestures (drag-to-scroll and pinch-to-zoom) implemented in `src/features/composer/PianoRoll.tsx`.
- Playback: lazy-loaded Tone.js playback via `src/lib/audio.ts` and `playComposition()` with tempo, quantize and swing controls.
- Exporters: MIDI exporter (`src/engine/exporters/midi.exporter.ts`) and WAV exporter with worker-based renderer and main-thread fallback (`src/engine/exporters/wav.exporter.ts`, `src/workers/render.worker.ts`, `src/engine/exporters/wav.render.fallback.ts`).
- Batch exports and presets: preset list in `src/engine/presets.ts` and batch export workflow in `src/features/composer/ComposerControls.tsx`.
- Web Workers: generator worker (`src/workers/generator.worker.ts`) for async generation and a renderer worker for offline WAV rendering.
- Undo/redo history: snapshot-based history persisted to `localStorage` with trimming to limit size (`src/features/composer/composer.store.ts`).
- UI helpers: mobile bottom sheet (`src/components/MobileBottomSheet.tsx`), history panel (`src/components/HistoryPanel.tsx`), and toast notifications (`src/components/Toast.tsx`).
- Tests: example unit tests using Vitest (see `src/engine/generators/emotion.generator.test.ts`).
- Performance-minded: dynamic imports and workerization are used to keep the initial bundle small and keep heavy work off the main thread.

## Tech stack & libraries

- Framework: React (TypeScript) with Vite
- Audio: Tone.js (lazy-loaded) and WebAudio API
- State: Zustand for composer store
- Build & dev: Vite
- Testing: Vitest (unit tests)
- Export/Workers: Custom Web Workers (`src/workers`), WAV renderer and simple MIDI exporter
- Styling: Tailwind CSS (utility-first) and small global CSS helpers

## Pages & Routes

- `/` — Home page ([src/pages/HomePage.tsx](src/pages/HomePage.tsx))
- `/composer` — Composer editor (piano-roll, controls) ([src/pages/ComposerPage.tsx](src/pages/ComposerPage.tsx))
- Any other path — NotFound page ([src/pages/NotFoundPage.tsx](src/pages/NotFoundPage.tsx))

Routes are configured in [src/app/router.tsx](src/app/router.tsx) and mounted in the main app shell.

## Project structure (short)

- `src/engine/generators/` — Melody/chord/rhythm/emotion generators
- `src/engine/exporters/` — MIDI and WAV exporters
- `src/workers/` — Generator and renderer web workers
- `src/features/composer/` — Composer UI, `PianoRoll.tsx`, `ComposerControls.tsx`, and `composer.store.ts`
- `src/lib/audio.ts` — audio playback helpers (lazy-load Tone.js)
- `src/components/` — shared UI (Header, Toasts, HistoryPanel, MobileBottomSheet)

## Quick start (development)

Prerequisites: Node.js (16+ recommended) and npm or pnpm.

Install:

```bash
npm install
```

Run dev server (HMR):

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

Run unit tests:

```bash
npm test
```

Lint (if configured):

```bash
npm run lint
```

## How to use the app (end-user)

1. Open `/composer`.
2. Choose an emotion or preset and hit Generate.
3. Edit notes directly on the piano-roll (tap/click to toggle). Mobile supports drag-to-scroll and pinch-to-zoom for the note rows.
4. Adjust quantize, swing and tempo from the advanced controls (bottom sheet on mobile).
5. Play the composition (Tone.js loads on first play).
6. Export as MIDI or WAV using the Export buttons — WAV rendering happens in a worker for offline export.

## Exporters

- MIDI: simple single-track MIDI exporter at `src/engine/exporters/midi.exporter.ts`.
- WAV: offline renderer with a Web Worker (`src/workers/render.worker.ts`) and a main-thread fallback (`src/engine/exporters/wav.render.fallback.ts`).
- MP3: not included by default due to encoder dependencies; to add MP3, consider `lamejs` or server-side encoding.

Batch export presets are provided (see `src/engine/presets.ts`) and can be exported in sequence with progress UI and ZIP packaging (if enabled).

## Web Workers & Performance

- Generation and offline rendering are moved to Web Workers to avoid blocking the UI. Generators are also dynamically imported to keep the initial bundle small.
- Tone.js is lazy-loaded at playback time to reduce initial download.

## CI & Tests

- A GitHub Actions workflow is configured to run build, lint and tests on push/PR (.github/workflows/ci.yml).
- Unit tests use `vitest` and can be executed with `npm test`.

## Forking & contributing (step-by-step)

1. Fork the repo on GitHub using the Fork button.
2. Clone your fork:

```bash
git clone https://github.com/Haseeb-MernStack/Emotion-Based-Music-Generator-Piano-Roll-Sequencer.git
cd music-composer
npm install
```

3. Create a feature branch:

```bash
git checkout -b feat/your-feature
```

4. Implement your change and add tests where applicable.
5. Run the dev server and tests locally.
6. Commit and push your branch:

```bash
git add .
git commit -m "feat: short description"
git push --set-upstream origin feat/your-feature
```

7. Open a Pull Request in the original repository and describe your changes. Link an issue if one exists.

Contribution guidelines: see `CONTRIBUTING.md` for code style and PR expectations.

## Preparing a submission or demo

- Add screenshots and `assets/demo.gif` to the top-level `assets/` folder.
- Ensure `npm run build` completes without warnings. Use dynamic imports for heavy code paths when adding features.
- If packaging many exports, use a ZIP step (e.g., `jszip`) in a batch-export flow.

### Auto-generate demo GIF from a screen recording

You can create a web-friendly demo GIF from a short screen recording (MP4/WebM) using `ffmpeg`. This repository includes a small helper script `scripts/generate-demo.js` that wraps a palette-based `ffmpeg` flow for better GIF quality.

1. Install `ffmpeg` on your machine and ensure it is available in your `PATH`.
2. Place a short screen recording at `assets/raw-demo.mp4` (or use your own path).
3. Run the helper script via npm:

```bash
npm run generate:demo
```

Or run the script directly with options:

```bash
node scripts/generate-demo.js assets/raw-demo.mp4 assets/demo.gif --fps 12 --scale 600:-1 --duration 6
```

- `--fps` sets the output frame-rate (12 is a good default for demo GIFs).
- `--scale` accepts `WxH` where `-1` preserves aspect ratio for one dimension.
- `--duration` limits the extracted segment in seconds.

The script uses a two-step palette generation for higher quality GIF output and will overwrite `assets/demo.gif`.

## Troubleshooting & common fixes

- No audio: interact with the page (user gesture) to unlock Tone.js. If still no sound, check the browser's autoplay policy and console for errors.
- Large bundle: verify dynamic imports and workerization for heavy modules like generators and Tone.js.
- Worker issues: ensure worker files are referenced with `new Worker(new URL('./worker.ts', import.meta.url))` (Vite recommended pattern).

## Security & privacy

- This app runs entirely in the browser; no user data is sent to a server by default. If you add analytics or remote sync, document data flows and obtain consent.

## License

This project is licensed under the MIT License — see `LICENSE`.

## Need help or want me to finish something?

- I can add MP3 export, ZIP batch packaging, more unit tests, or a step-by-step demo video/GIF. Open an issue or request a PR and I can implement it.

## Auto-generation of assets in CI

This repository includes a GitHub Action that will:

- Convert any SVG placeholders placed in `assets/` into PNG (and GIF for `demo.svg`) using ImageMagick.
- Generate `assets/demo.gif` from `assets/raw-demo.mp4` using `ffmpeg` and the `scripts/generate-demo.js` helper if a raw recording exists.

The workflow runs on `push` and can be triggered manually via the Actions tab. It commits generated assets back to the repository so forks can benefit from generated previews when allowed by branch permissions.

---

## Deployment (Vercel)

- Live demo: https://your-vercel-deployment.vercel.app (replace with your actual Vercel URL)
- Quick setup on Vercel:
  - Create a new Vercel project and import this repository from GitHub.
  - Build command: `npm run build`
  - Output directory: `dist`
  - Framework preset: select `Vite` (or leave auto-detected).
  - Environment: set `NODE_VERSION` or use `engines.node` in `package.json` if you need a specific Node version.
  - Enable Preview Deployments (Vercel default) for PR preview URLs.

- Production checklist / recommendations:
  - CI gates: keep `build`, `lint`, and `test` required on PRs before merging.
  - Source maps + error reporting: upload source maps to your error-tracking provider (Sentry, Bugsnag) and configure release tracking.
  - Performance budgets: add bundle-size checks (e.g., `rollup-plugin-visualizer` / `source-map-explorer`) to CI.
  - Cache policy: serve static assets with far-future immutable caching and hashed filenames; configure `vercel.json` headers if needed.
  - Security headers: add CSP, HSTS, X-Frame-Options, and other security headers via `vercel.json` or Vercel dashboard.
  - Environment & secrets: store any API keys, analytics IDs, or third-party secrets in Vercel Environment Variables (never commit them).
  - Monitoring & observability: enable uptime checks, performance monitoring and error reporting for production traffic.
  - Asset optimization: use Vercel Image Optimization or pre-optimize large images and animated GIFs (keep `assets/demo.gif` web-friendly size).
  - Offline support: `public/offline.html` and `sw.js` are included — ensure your service-worker registration and caching strategy are tested in production.
  - Dependabot/security: enable Dependabot/renovate and run dependency scans regularly.
  - Releases & changelog: adopt semantic-release or changelog workflow for predictable releases.
  - Accessibility & testing: run Lighthouse audits and add automated accessibility tests where possible.
