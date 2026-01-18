
class SoundManager {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  private playTone(freq: number, type: OscillatorType, duration: number, volume: number) {
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playCorrect() {
    this.playTone(880, 'sine', 0.1, 0.1);
  }

  playWrong() {
    this.playTone(220, 'sawtooth', 0.2, 0.1);
  }

  playClick() {
    this.playTone(440, 'sine', 0.05, 0.05);
  }

  playLevelUp() {
    this.playTone(523.25, 'sine', 0.1, 0.1);
    setTimeout(() => this.playTone(659.25, 'sine', 0.1, 0.1), 100);
    setTimeout(() => this.playTone(783.99, 'sine', 0.2, 0.1), 200);
  }

  private bgOsc: OscillatorNode | null = null;
  private bgGain: GainNode | null = null;
  private isBgPlaying = false;

  startBackgroundMusic() {
    if (this.isBgPlaying) return;
    this.init();
    if (!this.ctx) return;

    this.bgOsc = this.ctx.createOscillator();
    this.bgGain = this.ctx.createGain();

    // Educational game menu style: Playful, rhythmic, and bright
    const now = this.ctx.currentTime;
    
    // Pentatonic scale for a friendly, educational feel (C4, D4, E4, G4, A4, C5)
    const notes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25];
    
    this.bgOsc.type = 'triangle'; // Softer, more "toy-like" sound than sine
    
    // Schedule a bouncy, rhythmic sequence
    let time = now;
    for (let i = 0; i < 200; i++) {
      const note = notes[i % notes.length];
      // Create a "bouncing" rhythm with frequency shifts
      this.bgOsc.frequency.setValueAtTime(note, time);
      // Add a slight portamento/glide between some notes for playfulness
      if (i % 4 === 0) {
        this.bgOsc.frequency.exponentialRampToValueAtTime(note * 1.05, time + 0.1);
      }
      time += 0.25; // Faster tempo (120 BPM)
    }

    this.bgGain.gain.setValueAtTime(0, now);
    this.bgGain.gain.linearRampToValueAtTime(0.015, now + 1); // Subtly quiet

    this.bgOsc.connect(this.bgGain);
    this.bgGain.connect(this.ctx.destination);

    this.bgOsc.start();
    this.isBgPlaying = true;
  }

  stopBackgroundMusic() {
    if (this.bgOsc) {
      this.bgOsc.stop();
      this.bgOsc.disconnect();
      this.isBgPlaying = false;
    }
  }
}

export const sounds = new SoundManager();
