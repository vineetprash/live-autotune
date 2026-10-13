# Live Autotune
Real-time pitch correction in the browser. Pure DSP (YIN pitch detection + delay-line pitch shifter) inside an AudioWorklet. No backend, no AI, no runtime deps.

**Deploy:** push to `main` -> repo Settings > Pages > Source: *GitHub Actions*. Done.
**Dev:** `npm install && npm run dev`. Use headphones (mic -> speakers feeds back).

## Layout
- `public/dsp/` audio-thread code (yin.js, shifter.js, processor.js). Plain ES modules, loaded as-is.
- `src/music/scales.js` add a scale = add one line to `SCALES`.
- `src/ui/settings.js` add a setting = add one entry to `SCHEMA` (+ read it in `processor.js`/`main.js` mapping).
- `src/ui/roll.js`, `piano.js` rendering. `src/audio/engine.js` mic + worklet wiring.

## Knobs
- **Retune speed (ms):** how fast the voice glides to the target note. 0 = hard-tune/T-Pain, 50-150 = natural.
- **Strength:** 0-100% of the correction applied.
- **Window (ms):** shifter grain. Lower = less latency, more artifacts.
