export interface MusicTrack {
  id: string;
  name: string;
  nameKh: string;
  file: string;
  icon: string;
}

export const MUSIC_TRACKS: MusicTrack[] = [
  { id: "main", name: "Khmer Spirit", nameKh: "ចិត្តខ្មែរ", file: "/main-bg.mp3", icon: "🎵" },
  { id: "game", name: "Game Adventure", nameKh: "ដំណើរផ្សងព្រេង", file: "/game-bg.mp3", icon: "🎮" },
  { id: "happy", name: "Happy Day", nameKh: "ថ្ងៃសប្បាយ", file: "/happy-bg.mp3", icon: "☀️" },
  { id: "calm", name: "Calm & Relaxing", nameKh: "ស្ងប់ស្ងាត់", file: "/calm-bg.mp3", icon: "🌿" },
];

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted = false;
  private currentTrackId = "main";

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopBackgroundMusic();
    }
  }

  getMuted() {
    return this.isMuted;
  }

  getCurrentTrackId() {
    return this.currentTrackId;
  }

  setCurrentTrack(trackId: string) {
    this.currentTrackId = trackId;
    localStorage.setItem('selectedMusicTrack', trackId);
  }

  private playTone(
    freq: number,
    type: OscillatorType,
    duration: number,
    volume: number,
  ) {
    if (this.isMuted) return;
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

  playKeystroke() {
    this.playTone(600 + Math.random() * 100, "sine", 0.03, 0.03);
  }

  playCorrect() {
    this.playTone(880, "sine", 0.1, 0.12);
    setTimeout(() => this.playTone(1100, "sine", 0.08, 0.08), 50);
  }

  playWrong() {
    this.playTone(180, "sawtooth", 0.15, 0.08);
    setTimeout(() => this.playTone(150, "sawtooth", 0.1, 0.05), 80);
  }

  playClick() {
    this.playTone(440, "sine", 0.05, 0.05);
  }

  playLevelUp() {
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((note, i) => {
      setTimeout(() => this.playTone(note, "sine", 0.15, 0.1), i * 100);
    });
  }

  playStarEarned() {
    this.playTone(700, "sine", 0.1, 0.1);
    setTimeout(() => this.playTone(900, "sine", 0.1, 0.1), 80);
    setTimeout(() => this.playTone(1200, "sine", 0.15, 0.12), 160);
  }

  playBadgeUnlock() {
    const melody = [392, 523.25, 659.25, 783.99, 1046.50];
    melody.forEach((note, i) => {
      setTimeout(() => this.playTone(note, "triangle", 0.2, 0.1), i * 120);
    });
  }

  playRaceStart() {
    this.playTone(440, "square", 0.15, 0.08);
    setTimeout(() => this.playTone(440, "square", 0.15, 0.08), 400);
    setTimeout(() => this.playTone(880, "square", 0.3, 0.1), 800);
  }

  playVictory() {
    const fanfare = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
    fanfare.forEach((note, i) => {
      setTimeout(() => this.playTone(note, "sine", 0.2, 0.12), i * 80);
    });
    setTimeout(() => {
      this.playTone(1046.50, "sine", 0.5, 0.15);
    }, 600);
  }

  playStreak(count: number) {
    const baseFreq = 400 + Math.min(count * 50, 400);
    this.playTone(baseFreq, "sine", 0.08, 0.06);
    if (count >= 5) {
      setTimeout(() => this.playTone(baseFreq * 1.5, "sine", 0.06, 0.04), 40);
    }
    if (count >= 10) {
      setTimeout(() => this.playTone(baseFreq * 2, "sine", 0.06, 0.04), 80);
    }
  }

  playComboBreak() {
    this.playTone(300, "sawtooth", 0.2, 0.06);
    setTimeout(() => this.playTone(200, "sawtooth", 0.3, 0.04), 100);
  }

  playCountdown(num: number) {
    if (num > 0) {
      this.playTone(440, "square", 0.1, 0.08);
    } else {
      this.playTone(880, "square", 0.2, 0.1);
    }
  }

  private bgAudio: HTMLAudioElement | null = null;
  private isBgPlaying = false;

  startBackgroundMusic() {
    if (this.isMuted || this.isBgPlaying) return;
    this.init();

    const savedTrack = localStorage.getItem('selectedMusicTrack');
    if (savedTrack) {
      this.currentTrackId = savedTrack;
    }

    const track = MUSIC_TRACKS.find(t => t.id === this.currentTrackId) || MUSIC_TRACKS[0];

    if (!this.bgAudio || this.bgAudio.src !== window.location.origin + track.file) {
      if (this.bgAudio) {
        this.bgAudio.pause();
      }
      this.bgAudio = new Audio(track.file);
      this.bgAudio.loop = true;
      this.bgAudio.volume = 0.25;
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

  changeTrack(trackId: string) {
    const wasPlaying = this.isBgPlaying;
    this.stopBackgroundMusic();
    this.setCurrentTrack(trackId);
    if (wasPlaying || !this.isMuted) {
      this.startBackgroundMusic();
    }
  }

  stopBackgroundMusic() {
    if (this.bgAudio) {
      this.bgAudio.pause();
      this.bgAudio.currentTime = 0;
      this.isBgPlaying = false;
    }
  }

  toggleBackgroundMusic() {
    if (this.isBgPlaying) {
      this.stopBackgroundMusic();
    } else {
      this.startBackgroundMusic();
    }
    return this.isBgPlaying;
  }

  isBackgroundMusicPlaying() {
    return this.isBgPlaying;
  }

  setVolume(volume: number) {
    if (this.bgAudio) {
      this.bgAudio.volume = Math.max(0, Math.min(1, volume));
    }
  }
}

export const sounds = new SoundManager();
