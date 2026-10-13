// Zero-lookahead pitch shifter: two delay taps, Hann cross-faded, delay swept at (1-ratio) samples/sample.
export class PitchShifter {
  constructor(sr, winMs = 25) { this.sr = sr; this.setWindow(winMs); }
  setWindow(ms) {
    this.W = Math.max(64, Math.round(this.sr * ms / 1000));
    const n = 1 << Math.ceil(Math.log2(this.W + 8));
    this.mask = n - 1; this.buf = new Float32Array(n); this.w = 0; this.ph = 0;
  }
  process(x, ratio) {
    const { buf, mask, W } = this;
    buf[this.w] = x;
    this.ph += (1 - ratio) / W; this.ph -= Math.floor(this.ph);
    let out = 0;
    for (let k = 0; k < 2; k++) {
      let p = this.ph + 0.5 * k; p -= Math.floor(p);
      const pos = this.w - (p * W + 1), i = Math.floor(pos), f = pos - i;
      out += (buf[i & mask] * (1 - f) + buf[(i + 1) & mask] * f) * (0.5 - 0.5 * Math.cos(6.283185307 * p));
    }
    this.w = (this.w + 1) & mask;
    return out;
  }
}
