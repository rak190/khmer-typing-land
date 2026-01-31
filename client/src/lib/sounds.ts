class SoundManager {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }
  }

  private playTone(
    freq: number,
    type: OscillatorType,
    duration: number,
    volume: number,
  ) {
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.01,
      this.ctx.currentTime + duration,
    );

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playCorrect() {
    this.playTone(880, "sine", 0.1, 0.1);
  }

  playWrong() {
    this.playTone(220, "sawtooth", 0.2, 0.1);
  }

  playClick() {
    this.playTone(440, "sine", 0.05, 0.05);
  }

  playLevelUp() {
    this.playTone(523.25, "sine", 0.1, 0.1);
    setTimeout(() => this.playTone(659.25, "sine", 0.1, 0.1), 100);
    setTimeout(() => this.playTone(783.99, "sine", 0.2, 0.1), 200);
  }

  private bgAudio: HTMLAudioElement | null = null;
  private isBgPlaying = false;

  startBackgroundMusic() {
    if (this.isBgPlaying) return;
    this.init();

    if (!this.bgAudio) {
      this.bgAudio = new Audio(
        "/game-bg.mp3",
      );
      this.bgAudio.loop = true;
      this.bgAudio.volume = 0.3;
    }

    const playPromise = this.bgAudio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.isBgPlaying = true;
        })
        .catch((error) => {
          console.warn("Autoplay blocked, wait for user interaction:", error);
        });
    }
  }

  stopBackgroundMusic() {
    if (this.bgAudio) {
      this.bgAudio.pause();
      this.bgAudio.currentTime = 0; // Ensure it starts from beginning next time
      this.isBgPlaying = false;
    }
  }
}

export const sounds = new SoundManager();
