
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
  private isBgPlaying = false;

  startBackgroundMusic() {
    if (this.isBgPlaying) return;
    this.init();
    
    if (!this.bgAudio) {
      // Using the newly attached file path
      const audioPath = "/attached_assets/kids-game-gaming-background-music-295075_1768702772378.mp3";
      this.bgAudio = new Audio(audioPath);
      this.bgAudio.loop = true;
      this.bgAudio.volume = 0.3;
      
      this.bgAudio.addEventListener('error', (e) => {
        console.warn("Main audio failed, using local Sakura Girl fallback:", e);
        if (this.bgAudio) {
          this.bgAudio.src = "/attached_assets/Sakura-Girl-Daisy-chosic.com__1768701930800.mp3";
          this.bgAudio.load();
          this.bgAudio.play().catch(err => console.error("All fallback audio failed:", err));
        }
      });
    }
    
    const playPromise = this.bgAudio.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        this.isBgPlaying = true;
      }).catch(error => {
        console.warn("Autoplay blocked, wait for user interaction:", error);
      });
    }
  }

  stopBackgroundMusic() {
    if (this.bgAudio) {
      this.bgAudio.pause();
      this.isBgPlaying = false;
    }
  }
}

export const sounds = new SoundManager();
