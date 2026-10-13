// YIN pitch detector (de Cheveigne & Kawahara 2002). Pure math.
export class Yin {
  constructor(sr, size = 2048, minHz = 80, maxHz = 1000, thresh = 0.12) {
    this.sr = sr; this.thresh = thresh;
    this.minT = Math.max(2, Math.floor(sr / maxHz));
    this.maxT = Math.min(size >> 1, Math.ceil(sr / minHz));
    this.W = size - this.maxT - 2;
    this.d = new Float32Array(this.maxT + 2);
  }
  /** x: time-ordered samples (length >= size). Returns Hz or 0 if unvoiced. */
  detect(x) {
    const { W, minT, maxT, d } = this;
    for (let t = 1; t <= maxT + 1; t++) {
      let s = 0;
      for (let i = 0; i < W; i++) { const e = x[i] - x[i + t]; s += e * e; }
      d[t] = s;
    }
    let run = 0; d[0] = 1;
    for (let t = 1; t <= maxT + 1; t++) { run += d[t]; d[t] = run > 0 ? d[t] * t / run : 1; }
    for (let t = minT; t <= maxT; t++) {
      if (d[t] < this.thresh) {
        while (t < maxT && d[t + 1] < d[t]) t++;
        const a = d[t - 1], b = d[t], c = d[t + 1], den = a - 2 * b + c;
        return this.sr / (den ? t + 0.5 * (a - c) / den : t);
      }
    }
    return 0;
  }
}
