# Music Composer (React + TypeScript + Vite)

Music Composer is a React + TypeScript project using Vite and Tone.js to generate and play short compositions driven by emotion and scale choices.

This repository was audited and improved to fix issues in the composer feature and to add recommended repository files for publishing as an open-source project.

## Quick start

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## What I fixed and improved

- Separated the `useKeyboardSynth` hook into `src/features/composer/useKeyboardSynth.ts`.
- Removed duplicate default exports and corrected imports in `src/features/composer/PianoRoll.tsx` and `src/features/composer/ComposerPage.tsx`.
- Added repository meta files (MIT license, .gitignore, CONTRIBUTING, CODE_OF_CONDUCT, CI workflow) to make the repo publish-ready.

## Recommended repo files for a production open-source project

- `README.md` — project overview and setup (this file)
- `LICENSE` — license file (MIT provided)
- `.gitignore` — ignore node_modules and build outputs
- `CONTRIBUTING.md` — contribution guidelines
- `CODE_OF_CONDUCT.md` — contributor expectations
- `.github/workflows/ci.yml` — CI to run build and checks on PRs
- `SECURITY.md` — security reporting guidance (optional)

## Next steps I can do for you

- Add unit tests for the generator functions (`src/engine/generators/*`) and wire them to CI.
- Add linting and typecheck steps to CI.
- Improve UI/UX of the PianoRoll (zoom, loop, pattern presets).

If you'd like any of those, tell me which to prioritize and I'll implement them.

## Project overview

Music Composer lets users generate, edit and play short musical ideas based on a chosen musical key and an emotion parameter (e.g. "happy", "sad", "epic"). It includes a simple piano-roll editor, keyboard input support, and playback using the WebAudio API via Tone.js. The project is intended as a competition/demo app that can be extended into a production-ready open-source project.

Key capabilities

- Generate melody + chord progressions from an emotion seed.
- Edit notes in a grid-style piano-roll UI and trigger notes with the computer keyboard.
- Play compositions (synth) and export compositions as JSON.

## How it works (high level)

- Generators: emotion-driven algorithms produce a `melody` array and `chords` structure. See `src/engine/generators` for implementations: [emotion.generator.ts](src/engine/generators/emotion.generator.ts), [melody.generator.ts](src/engine/generators/melody.generator.ts), [chord.generator.ts](src/engine/generators/chord.generator.ts), [rhythm.generator.ts](src/engine/generators/rhythm.generator.ts).
- State: global composer state is held in a Zustand store located at [src/features/composer/composer.store.ts](src/features/composer/composer.store.ts). It stores `melody`, `chords`, `tempo`, `key`, and helper actions such as `toggleNote`.
- UI: the composer screen combines controls and the piano-roll editor. Main files:
  - Page: [src/features/composer/ComposerPage.tsx](src/features/composer/ComposerPage.tsx)
  - Controls: [src/features/composer/ComposerControls.tsx](src/features/composer/ComposerControls.tsx)
  - Piano roll: [src/features/composer/PianoRoll.tsx](src/features/composer/PianoRoll.tsx)
  - Keyboard hooks: [src/features/composer/useKeyboard.ts](src/features/composer/useKeyboard.ts) and [src/features/composer/useKeyboardSynth.ts](src/features/composer/useKeyboardSynth.ts)
- Audio: playback and audio helpers are in `src/lib/audio.ts` which wraps Tone.js scheduling and playback logic.

## Architecture / Folder map

- `src/engine` — music theory, generators, emotion config and utilities.
- `src/features/composer` — composer UI, store, hooks, and page components.
- `src/app` — application router and top-level providers (AudioProvider etc.).
- `src/pages` — route pages (Composer, Home, NotFound).
- `src/lib` — small libraries/helpers (audio wrapper, utils).

## Key files

- [src/features/composer/ComposerPage.tsx](src/features/composer/ComposerPage.tsx) — main composer UI page.
- [src/features/composer/PianoRoll.tsx](src/features/composer/PianoRoll.tsx) — piano-roll editor UI.
- [src/features/composer/composer.store.ts](src/features/composer/composer.store.ts) — global state (Zustand).
- [src/engine/generators/emotion.generator.ts](src/engine/generators/emotion.generator.ts) — emotion → composition generator.
- [src/lib/audio.ts](src/lib/audio.ts) — playback helpers using Tone.js.

## Dependencies and prerequisites

Prerequisites

- Node.js (LTS) — recommended: Node 18 or later
- npm (or Yarn/PNPM) — tested with npm
- A modern browser that supports the WebAudio API (Chrome, Edge, Firefox, Safari modern versions)

Main dependencies (from `package.json`)

- `react` ^19
- `react-dom` ^19
- `vite` ^7
- `typescript` ~5.9
- `tone` ^15 — WebAudio synthesizer/scheduler
- `zustand` ^5 — state management
- `tailwindcss` + `@tailwindcss/vite` — styling utilities (project uses Tailwind classes)

Dev dependencies include ESLint, TypeScript types, Vite plugin for React and path aliases. See `package.json` for exact versions.

## Setup and common commands

Install dependencies

```bash
npm install
```

Start development server (HMR)

```bash
npm run dev
```

Build for production

```bash
npm run build
```

Preview built bundle

```bash
npm run preview
```

Lint (if configured)

```bash
npm run lint
```

## 📸 Screenshots

> Place screenshots in `screenshots/` folder:
> music-composer/
> └── screenshots/
> ├── home.png
> ├── composer.png
> └── notfound.png

---

## Development tips and notes

- Browser auto-play: Tone.js requires a user gesture to start audio. The UI calls `Tone.start()` on the first user interaction (click or key press) to unlock audio.
- State persistence: the project currently stores composition in memory. For persistence you can extend `composer.store.ts` to sync with `localStorage` or a backend.
- Tests: no unit tests exist yet — adding tests for the generators (`src/engine/generators/*`) is a high-value next step.

## Production & publishing recommendations

- Ensure `build` step (`npm run build`) runs cleanly in CI. The included workflow runs a simple build.
- Add linting and `npm test` steps to CI to prevent regressions.
- Add a `CHANGELOG.md` and release process for competition milestones.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

This repository includes an `MIT` license (see `LICENSE`).

---
