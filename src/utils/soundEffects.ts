// Zero-dependency procedural Web Audio API sound synthesis & Ambient Soundscapes Manager
import {
  AmbientSoundscapeSpec,
  CampusZoneId,
  getAmbientSoundscapeForZone,
} from '../domain/campusData';

interface ActiveAmbientGraph {
  masterGain: GainNode;
  noiseSource: AudioBufferSourceNode;
  noiseFilter: BiquadFilterNode;
  baseOsc: OscillatorNode;
  harmonicOsc: OscillatorNode;
  lfoOsc: OscillatorNode;
  lfoGain: GainNode;
}

class SoundEffectEngine {
  private ctx: AudioContext | null = null;
  public enabled = true;
  private currentZone: CampusZoneId = 'overview';
  private ambientGraph: ActiveAmbientGraph | null = null;
  private pulseTimerId: number | null = null;
  private unlockBound = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.bindAutoplayUnlock();
    }
  }

  private bindAutoplayUnlock(): void {
    if (this.unlockBound || typeof window === 'undefined') return;
    this.unlockBound = true;
    const unlock = () => {
      if (this.enabled) {
        this.syncAmbientGraph();
      }
    };
    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('keydown', unlock, { passive: true });
  }

  private getContext(): AudioContext | null {
    if (!this.enabled || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public getCurrentSoundscape(): AmbientSoundscapeSpec {
    return getAmbientSoundscapeForZone(this.currentZone);
  }

  public setEnabled(nextEnabled: boolean): void {
    this.enabled = nextEnabled;
    if (!nextEnabled) {
      this.stopAmbientGraph();
    } else {
      this.syncAmbientGraph();
    }
  }

  /**
   * Transitions the background ambient soundscape to match the active campus zone
   * (e.g., 'serene-wind' for overview, 'office-hustle' for dispatch).
   */
  public setZoneSoundscape(zoneId: CampusZoneId): AmbientSoundscapeSpec {
    this.currentZone = zoneId;
    if (this.enabled && this.ctx) {
      this.syncAmbientGraph();
    }
    return this.getCurrentSoundscape();
  }

  private createPinkNoiseBuffer(ctx: AudioContext): AudioBuffer {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    let b3 = 0;
    let b4 = 0;
    let b5 = 0;
    let b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.03;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  private syncAmbientGraph(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const spec = this.getCurrentSoundscape();
    const now = ctx.currentTime;

    try {
      if (!this.ambientGraph) {
        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0.001, now);
        masterGain.gain.exponentialRampToValueAtTime(0.035, now + 0.45);
        masterGain.connect(ctx.destination);

        // Filtered pink noise for wind / fountain / office air texture
        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = this.createPinkNoiseBuffer(ctx);
        noiseSource.loop = true;

        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = spec.filterType;
        noiseFilter.frequency.setValueAtTime(spec.filterCutoffHz, now);
        noiseFilter.Q.setValueAtTime(1.8, now);

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.55, now);

        noiseSource.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(masterGain);

        // Warm harmonic drone oscillators
        const baseOsc = ctx.createOscillator();
        baseOsc.type = 'sine';
        baseOsc.frequency.setValueAtTime(spec.baseFreqHz, now);

        const harmonicOsc = ctx.createOscillator();
        harmonicOsc.type = 'triangle';
        harmonicOsc.frequency.setValueAtTime(spec.harmonicFreqHz, now);

        const droneGain = ctx.createGain();
        droneGain.gain.setValueAtTime(0.24, now);

        baseOsc.connect(droneGain);
        harmonicOsc.connect(droneGain);
        droneGain.connect(masterGain);

        // LFO modulating the noise filter cutoff for organic motion
        const lfoOsc = ctx.createOscillator();
        lfoOsc.type = 'sine';
        lfoOsc.frequency.setValueAtTime(spec.lfoRateHz, now);

        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(spec.filterCutoffHz * 0.28, now);

        lfoOsc.connect(lfoGain);
        lfoGain.connect(noiseFilter.frequency);

        noiseSource.start();
        baseOsc.start();
        harmonicOsc.start();
        lfoOsc.start();

        this.ambientGraph = {
          masterGain,
          noiseSource,
          noiseFilter,
          baseOsc,
          harmonicOsc,
          lfoOsc,
          lfoGain,
        };
      } else {
        // Smoothly crossfade filter & frequencies to the new zone's soundscape spec
        const g = this.ambientGraph;
        g.noiseFilter.type = spec.filterType;
        g.noiseFilter.frequency.setTargetAtTime(spec.filterCutoffHz, now, 0.35);
        g.baseOsc.frequency.setTargetAtTime(spec.baseFreqHz, now, 0.35);
        g.harmonicOsc.frequency.setTargetAtTime(spec.harmonicFreqHz, now, 0.35);
        g.lfoOsc.frequency.setTargetAtTime(spec.lfoRateHz, now, 0.35);
        g.lfoGain.gain.setTargetAtTime(spec.filterCutoffHz * 0.28, now, 0.35);
      }

      // Configure subtle rhythmic telemetry pulses for 'office-hustle' and 'server-hum'
      if (this.pulseTimerId !== null) {
        window.clearInterval(this.pulseTimerId);
        this.pulseTimerId = null;
      }

      if (spec.pulseIntervalMs !== null && typeof window !== 'undefined') {
        this.pulseTimerId = window.setInterval(() => {
          if (!this.enabled || !this.ctx || this.ctx.state !== 'running') return;
          this.playAmbientPulse(spec);
        }, spec.pulseIntervalMs);
      }
    } catch {
      // Ignore Web Audio errors when blocked by browser autoplay policy
    }
  }

  private playAmbientPulse(spec: AmbientSoundscapeSpec): void {
    const ctx = this.ctx;
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = spec.trackId === 'office-hustle' ? 'sine' : 'triangle';
      const freq =
        spec.trackId === 'office-hustle'
          ? 880 + ((Math.floor(ctx.currentTime * 10) % 3) * 110)
          : 360;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.012, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0005, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch {
      // Ignore
    }
  }

  private stopAmbientGraph(): void {
    if (this.pulseTimerId !== null && typeof window !== 'undefined') {
      window.clearInterval(this.pulseTimerId);
      this.pulseTimerId = null;
    }
    if (!this.ambientGraph) return;
    try {
      this.ambientGraph.noiseSource.stop();
      this.ambientGraph.baseOsc.stop();
      this.ambientGraph.harmonicOsc.stop();
      this.ambientGraph.lfoOsc.stop();
      this.ambientGraph.masterGain.disconnect();
    } catch {
      // Ignore
    }
    this.ambientGraph = null;
  }

  public playUiClick(pitch = 520): void {
    const ctx = this.getContext();
    if (!ctx) return;
    this.syncAmbientGraph();
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(pitch, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(pitch * 1.35, ctx.currentTime + 0.06);

      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.065);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.07);
    } catch {
      // Ignore audio errors if blocked by autoplay policy
    }
  }

  public playRoofWhoosh(opening: boolean): void {
    const ctx = this.getContext();
    if (!ctx) return;
    this.syncAmbientGraph();
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      const startFreq = opening ? 160 : 310;
      const endFreq = opening ? 340 : 150;
      osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + 0.24);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.26);
    } catch {
      // Ignore
    }
  }

  public playDispatchChime(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    this.syncAmbientGraph();
    try {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        const start = ctx.currentTime + idx * 0.065;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.07, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.24);
      });
    } catch {
      // Ignore
    }
  }
}

export const soundEngine = new SoundEffectEngine();
