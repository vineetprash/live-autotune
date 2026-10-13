const BLACK = new Set([1, 3, 6, 8, 10]);
/** One semitone per row. inKey = sung note (outlined), outKey = tuned note (filled). */
export function drawPiano(g, x, y, w, h, lo, hi, inKey, outKey) {
  const rh = h / (hi - lo + 1);
  for (let m = lo; m <= hi; m++) {
    const top = y + h - (m - lo + 1) * rh, blk = BLACK.has(m % 12);
    g.fillStyle = m === outKey ? '#f4a78f' : '#f3f3f6'; g.fillRect(x, top, w, rh - 1);
    if (blk && m !== outKey) { g.fillStyle = '#1b1b26'; g.fillRect(x, top, w * 0.62, rh - 1); }
    if (m === inKey && m !== outKey) { g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(x + 1, top + 1, w - 2, rh - 3); }
    if (m % 12 === 0) { g.fillStyle = '#333'; g.font = '11px system-ui'; g.fillText('C' + (Math.floor(m / 12) - 1), x + w - 24, top + rh - 4); }
  }
}
