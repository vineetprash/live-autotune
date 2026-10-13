import './style.css';
import { Engine } from './audio/engine.js';
import { createSettings } from './ui/settings.js';
import { Roll } from './ui/roll.js';
import { mask, noteName } from './music/scales.js';

const $ = (id) => document.getElementById(id);
const roll = new Roll($('roll'));
const readout = $('readout'), power = $('power');
const toDsp = (s) => ({ mask: mask(s.root, s.scale), speedMs: s.speedMs, strength: s.strength, windowMs: s.windowMs, gate: s.gate });

const engine = new Engine(([a, b]) => {
  roll.push(a, b);
  const t = Number.isFinite(a) ? `${noteName(a)} -> ${noteName(b)}` : '...';
  if (readout.dataset.t !== t) { readout.dataset.t = t; readout.textContent = t + (engine.ctx ? `   ~${engine.latencyMs().toFixed(0)} ms I/O` : ''); }
});
createSettings($('controls'), (s) => { const c = toDsp(s); roll.mask = c.mask; engine.configure(c); });

let running = false;
power.onclick = async () => {
  try {
    if (!running) { await engine.start(); power.textContent = 'Stop'; power.classList.add('on'); }
    else { await engine.stop(); power.textContent = 'Start'; power.classList.remove('on'); readout.textContent = 'Press Start and sing'; }
    running = !running;
  } catch (e) { readout.textContent = 'Microphone unavailable: allow access and use HTTPS or localhost.'; }
};
$('gear').onclick = () => { $('settings').hidden = !$('settings').hidden; };
