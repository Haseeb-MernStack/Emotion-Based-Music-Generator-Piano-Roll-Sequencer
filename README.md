# Music Composer (React + TypeScript + Vite)

Music Composer is a small demo app that generates short musical ideas and lets you edit and play them using a piano-roll UI. It's built with React, TypeScript, Vite and Tone.js.

This README was updated to be concise and to include clear guidance for adding assets so images and the demo render correctly on GitHub.

## Demo & Screenshots

Place the following files in the repository `assets/` folder (project root) so GitHub can render them in this README:

- `assets/demo.gif` — short animated demo (recommended: 600×340 GIF)
- `assets/home.png` — Home page screenshot (recommended: 1280×720 PNG)
- `assets/composer.png` — Composer page screenshot (recommended: 1280×720 PNG)
- `assets/notfound.png` — 404 / NotFound screenshot (recommended: 800×400 PNG)

Example embed (relative paths used for GitHub rendering):

![App Demo](assets/demo.gif)

If the images aren't showing on GitHub, the common causes and fixes are below.

## Fixing images not displaying on GitHub

- Make sure files are committed and pushed to the repository: `git add assets/* && git commit -m "Add screenshots" && git push`.
- Use relative paths (no leading slash) in the README: `![Alt text](assets/home.png)`.
- Check filename case: GitHub is case-sensitive for file paths. `assets/Home.png` differs from `assets/home.png`.
- If you store images in `public/` or `src/assets/`, point to them correctly from README or move them to the repo root `assets/` folder for easier linking.
- As a last resort, upload images via the GitHub web UI (drag-drop) which will ensure they are stored in the repo.

## Quick start

Install dependencies:

```bash
npm install
```

Start development server (HMR):

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

## Project overview (short)

- Generators: emotion-driven algorithms in `src/engine/generators` produce `melody` and `chords`.
- State: global composer state is in `src/features/composer/composer.store.ts` (Zustand).
- UI: Composer page and piano-roll editor are under `src/features/composer`.
- Audio: Tone.js helpers in `src/lib/audio.ts`.

## PWA and responsiveness

This repository includes a minimal PWA setup (manifest + service worker) and small global CSS helpers to improve responsiveness. For production-grade PWA behavior consider `vite-plugin-pwa` which will add robust precaching.

## Troubleshooting & tips

- Tone.js requires a user gesture to start audio. Interact with the page (click a note or press a key) to enable sound.
- If you see large bundle warnings during build, consider code-splitting or lazy-loading heavy modules.
- To persist compositions across reloads, extend `composer.store.ts` to save to `localStorage`.

## Recommended next additions (I can implement)

- Add unit tests for the generator functions and wire them into CI.
- Add proper PNG icons and enhance the web manifest for PWA.
- Improve the PianoRoll with zoom, transport (playhead) and pattern presets.

## Contributing

See `CONTRIBUTING.md` for contribution guidelines.

## License

This project is licensed under the MIT License — see `LICENSE`.

---
