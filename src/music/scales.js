export const NOTES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
// Add a scale = add a line.
export const SCALES = {
  chromatic: [0,1,2,3,4,5,6,7,8,9,10,11],
  major: [0,2,4,5,7,9,11],
  minor: [0,2,3,5,7,8,10],
  'harmonic minor': [0,2,3,5,7,8,11],
  'pentatonic major': [0,2,4,7,9],
  'pentatonic minor': [0,3,5,7,10],
  blues: [0,3,5,6,7,10],
};
export const mask = (root, name) => {
  const m = Array(12).fill(false);
  for (const i of SCALES[name]) m[(i + root) % 12] = true;
  return m;
};
export const noteName = (midi) => { const r = Math.round(midi); return NOTES[((r % 12) + 12) % 12] + (Math.floor(r / 12) - 1); };
