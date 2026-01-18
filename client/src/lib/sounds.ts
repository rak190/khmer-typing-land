
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

  private bgAudio: HTMLAudioElement | null = null;
  private fallbackOsc: OscillatorNode | null = null;
  private isBgPlaying = false;

  startBackgroundMusic() {
    if (this.isBgPlaying) return;
    this.init();
    
    if (!this.bgAudio) {
      // Direct relative path for assets using the newly attached file
      this.bgAudio = new Audio("/attached_assets/Sakura-Girl-Daisy-chosic.com__1768701930800.mp3");
      this.bgAudio.loop = true;
      this.bgAudio.volume = 0.5;
      
      this.bgAudio.addEventListener('error', (e) => {
        console.error("Audio file failed to load:", e);
        // Fallback to generated sound
        this.startGeneratedMusic();
      });
    }
    
    this.bgAudio.play()
      .then(() => {
        this.isBgPlaying = true;
      })
      .catch(error => {
        console.warn("Autoplay blocked or file failed, trying fallback:", error);
        this.startGeneratedMusic();
      });
  }

  private startGeneratedMusic() {
    if (this.isBgPlaying && this.fallbackOsc) return;
    this.init();
    if (!this.ctx) return;
    
    this.fallbackOsc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    this.fallbackOsc.type = 'triangle';
    this.fallbackOsc.frequency.setValueAtTime(440, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
    this.fallbackOsc.connect(gain);
    gain.connect(this.ctx.destination);
    this.fallbackOsc.start();
    this.isBgPlaying = true;
  }

  stopBackgroundMusic() {
    if (this.bgAudio) {
      this.bgAudio.pause();
    }
    if (this.fallbackOsc) {
      this.fallbackOsc.stop();
      this.fallbackOsc.disconnect();
      this.fallbackOsc = null;
    }
    this.isBgPlaying = false;
  }
}

export const sounds = new SoundManager();
