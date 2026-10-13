import { drawPiano } from './piano.js';
export const LO = 36, HI = 72;           // C2..C5
const SPAN = 4000, NOW = 0.78, KEYW = 84; // ms of history, playhead position, piano width
export class Roll {
  constructor(canvas) {
    this.c = canvas; this.g = canvas.getContext('2d'); this.hist = []; this.mask = Array(12).fill(true);
    new ResizeObserver(() => this.resize()).observe(canvas); this.resize();
    const loop = () => { this.draw(); requestAnimationFrame(loop); }; loop();
  }
  resize() {
    const d = devicePixelRatio || 1, r = this.c.getBoundingClientRect();
    this.c.width = r.width * d; this.c.height = r.height * d; this.w = r.width; this.h = r.height;
    this.g.setTransform(d, 0, 0, d, 0, 0);
  }
  push(a, b) {
    const t = performance.now(); this.hist.push({ t, a, b });
    while (this.hist.length && t - this.hist[0].t > SPAN + 300) this.hist.shift();
  }
  trace(k, now, x0, pw, y) {
    const g = this.g; g.beginPath(); let pen = false;
    for (const p of this.hist) {
      const v = p[k]; if (!(v >= LO - 1 && v <= HI + 1)) { pen = false; continue; }
      const x = x0 + pw * NOW * (1 - (now - p.t) / SPAN);
      pen ? g.lineTo(x, y(v)) : g.moveTo(x, y(v)); pen = true;
    }
    g.stroke();
  }
  draw() {
    const { g, w, h } = this, rh = h / (HI - LO + 1), x0 = KEYW, pw = w - x0, now = performance.now();
    const y = (m) => h - (m - LO + 0.5) * rh;
    g.clearRect(0, 0, w, h);
    for (let m = LO; m <= HI; m++) {
      const pc = m % 12;
      g.fillStyle = `hsla(${(pc * 30 + 340) % 360},55%,48%,${this.mask[pc] ? 0.4 : 0.06})`;
      g.fillRect(x0, h - (m - LO + 1) * rh, pw, rh - 1);
    }
    const l = this.hist.at(-1), live = l && now - l.t < 150 && l;
    drawPiano(g, 0, 0, KEYW, h, LO, HI, live ? Math.round(live.a) : null, live ? Math.round(live.b) : null);
    const nx = x0 + pw * NOW; g.strokeStyle = '#ffffff30'; g.lineWidth = 1;
    g.beginPath(); g.moveTo(nx, 0); g.lineTo(nx, h); g.stroke();
    g.save(); g.beginPath(); g.rect(x0, 0, pw, h); g.clip(); g.lineJoin = 'round';
    g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 2; this.trace('a', now, x0, pw, y);   // original
    g.strokeStyle = 'rgba(255,196,110,.8)'; g.lineWidth = 3; g.shadowColor = '#ffb347'; g.shadowBlur = 10;
    this.trace('b', now, x0, pw, y);                                                              // tuned ghost
    g.restore();
  }
}
