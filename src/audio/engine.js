export class Engine {
  constructor(onFrame) { this.onFrame = onFrame; this.cfg = null; }
  async start() {
    this.ctx = new AudioContext({ latencyHint: 0 });
    await this.ctx.audioWorklet.addModule(`${import.meta.env.BASE_URL}dsp/processor.js`);
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false, channelCount: 1, latency: 0 },
    });
    this.node = new AudioWorkletNode(this.ctx, 'autotune', { outputChannelCount: [1] });
    this.node.port.onmessage = (e) => this.onFrame(e.data);
    this.ctx.createMediaStreamSource(this.stream).connect(this.node).connect(this.ctx.destination);
    if (this.cfg) this.configure(this.cfg);
  }
  configure(cfg) { this.cfg = cfg; this.node?.port.postMessage(cfg); }
  latencyMs() { return ((this.ctx.baseLatency || 0) + (this.ctx.outputLatency || 0)) * 1000; }
  async stop() {
    this.stream?.getTracks().forEach((t) => t.stop());
    await this.ctx?.close(); this.node = this.ctx = null;
  }
}
