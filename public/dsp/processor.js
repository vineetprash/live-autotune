import { Yin } from './yin.js';
import { PitchShifter } from './shifter.js';

const B = 2048, HOP = 256;
const snap = (m, mask, held) => {
  if (held != null && mask[held % 12] && Math.abs(m - held) < 0.65) return held; // hysteresis vs vibrato
  const r = Math.round(m); let best = m, bd = 1e9;
  for (let n = r - 6; n <= r + 6; n++) if (mask[((n % 12) + 12) % 12]) { const d = Math.abs(n - m); if (d < bd) { bd = d; best = n; } }
  return best;
};

class AutoTune extends AudioWorkletProcessor {
  constructor() {
    super();
    this.yin = new Yin(sampleRate, B);
    this.sh = new PitchShifter(sampleRate, 25);
    this.ring = new Float32Array(B); this.lin = new Float32Array(B);
    this.pos = 0; this.cnt = 0;
    this.cfg = { mask: Array(12).fill(true), speedMs: 15, strength: 1, gate: 0.01 };
    this.target = 0; this.shift = 0; this.held = null; this.midi = NaN;
    this.port.onmessage = ({ data }) => {
      Object.assign(this.cfg, data);
      if (data.windowMs && data.windowMs !== this.win) { this.win = data.windowMs; this.sh.setWindow(data.windowMs); }
    };
  }
  analyse() {
    const { ring, lin, pos, cfg } = this;
    let e = 0;
    for (let i = 0; i < B; i++) { const s = ring[(pos + i) % B]; lin[i] = s; e += s * s; }
    const rms = Math.sqrt(e / B);
    const f0 = rms > cfg.gate ? this.yin.detect(lin) : 0;
    if (f0 > 0) {
      const m = 69 + 12 * Math.log2(f0 / 440);
      this.midi = m;
      this.held = snap(m, cfg.mask, this.held);
      this.target = (this.held - m) * cfg.strength;
    } else {
      this.midi = NaN;
      if (rms <= cfg.gate) { this.target = 0; this.held = null; } // silence: relax; noise/consonant: hold
    }
    this.port.postMessage([this.midi, this.midi + this.shift]);
  }
  process(inputs, outputs) {
    const x = inputs[0][0], out = outputs[0];
    if (!x) return true;
    const y = out[0], c = this.cfg;
    const a = c.speedMs <= 0 ? 1 : 1 - Math.exp(-1000 / (c.speedMs * sampleRate));
    for (let i = 0; i < x.length; i++) {
      this.ring[this.pos] = x[i]; this.pos = (this.pos + 1) % B;
      this.shift += (this.target - this.shift) * a;
      y[i] = this.sh.process(x[i], Math.pow(2, this.shift / 12));
      if (++this.cnt >= HOP) { this.cnt = 0; this.analyse(); }
    }
    for (let ch = 1; ch < out.length; ch++) out[ch].set(y);
    return true;
  }
}
registerProcessor('autotune', AutoTune);
