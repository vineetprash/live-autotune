import { NOTES, SCALES } from '../music/scales.js';
// Add a setting = add an entry here; the panel renders itself from this schema.
export const SCHEMA = [
  { key: 'root', label: 'Key', type: 'select', value: 0, options: NOTES.map((n, i) => [i, n]), parse: Number },
  { key: 'scale', label: 'Scale', type: 'select', value: 'major', options: Object.keys(SCALES).map((k) => [k, k]) },
  { key: 'speedMs', label: 'Retune speed (ms)', type: 'range', min: 0, max: 300, step: 5, value: 20, hint: '0 = hard robotic snap, 100+ = natural glide' },
  { key: 'strength', label: 'Strength', type: 'range', min: 0, max: 1, step: 0.05, value: 1, hint: 'How much of the correction is applied' },
  { key: 'windowMs', label: 'Window (ms)', type: 'range', min: 10, max: 50, step: 1, value: 25, hint: 'Lower = less latency, more artifacts' },
  { key: 'gate', label: 'Noise gate', type: 'range', min: 0.002, max: 0.1, step: 0.002, value: 0.01, hint: 'Raise if background noise triggers pitch' },
];
export function createSettings(root, onChange) {
  let saved = {}; try { saved = JSON.parse(localStorage.getItem('autotune') || '{}'); } catch {}
  const state = {};
  const emit = () => { try { localStorage.setItem('autotune', JSON.stringify(state)); } catch {} onChange({ ...state }); };
  for (const s of SCHEMA) {
    state[s.key] = saved[s.key] ?? s.value;
    const label = document.createElement('label'); label.textContent = s.label;
    const input = s.type === 'select' ? document.createElement('select') : Object.assign(document.createElement('input'), { type: 'range', min: s.min, max: s.max, step: s.step });
    if (s.type === 'select') s.options.forEach(([v, t]) => input.add(new Option(t, v)));
    input.value = state[s.key];
    const out = document.createElement('output'); label.append(out);
    const show = () => { if (s.type === 'range') out.textContent = state[s.key]; };
    input.oninput = () => { state[s.key] = s.type === 'range' ? Number(input.value) : (s.parse ?? String)(input.value); show(); emit(); };
    show(); root.append(label, input);
    if (s.hint) root.append(Object.assign(document.createElement('small'), { textContent: s.hint }));
  }
  emit();
}
