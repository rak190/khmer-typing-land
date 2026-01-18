
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

    // Simple rhythmic ambient sound using a Triangle wave
    this.bgOsc.type = 'triangle';
    this.bgOsc.frequency.setValueAtTime(110, this.ctx.currentTime); // Low A

    this.bgGain.gain.setValueAtTime(0.015, this.ctx.currentTime); // Very quiet

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
