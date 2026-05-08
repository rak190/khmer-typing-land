export interface MusicTrack {
  id: string;
  name: string;
  nameKh: string;
  file?: string;
  icon: string;
  mood: string;
  generated?: {
    tempo: number;
    wave: OscillatorType;
    lead: number[];
    bass: number[];
    pad: number[];
    volume: number;
  };
}

export interface SoundTheme {
  id: string;
  name: string;
  nameKh: string;
  description: string;
  icon: string;
  wave: OscillatorType;
  keystrokeBase: number;
  keystrokeRange: number;
  correct: number[];
  wrong: number[];
  victory: number[];
}

export const MUSIC_TRACKS: MusicTrack[] = [
  { id: "main", name: "Khmer Spirit", nameKh: "ចិត្តខ្មែរ", file: "/main-bg.mp3", icon: "🎵", mood: "Warm Khmer learning music" },
  { id: "game", name: "Game Adventure", nameKh: "ដំណើរផ្សងព្រេង", file: "/game-bg.mp3", icon: "🎮", mood: "Energetic challenge music" },
  { id: "happy", name: "Happy Day", nameKh: "ថ្ងៃសប្បាយ", file: "/happy-bg.mp3", icon: "☀️", mood: "Bright and cheerful music" },
  { id: "calm", name: "Calm & Relaxing", nameKh: "ស្ងប់ស្ងាត់", file: "/calm-bg.mp3", icon: "🌿", mood: "Gentle focus music" },
  {
    id: "angkor-bells",
    name: "Angkor Bells",
    nameKh: "ជួងអង្គរ",
    icon: "🔔",
    mood: "Sparkly temple bell loop",
    generated: {
      tempo: 96,
      wave: "triangle",
      lead: [659.25, 783.99, 880, 783.99, 987.77, 880, 783.99, 659.25],
      bass: [261.63, 329.63, 392, 329.63],
      pad: [523.25, 659.25, 783.99],
      volume: 0.12,
    },
  },
  {
    id: "lotus-dance",
    name: "Lotus Dance",
    nameKh: "របាំផ្កាឈូក",
    icon: "🪷",
    mood: "Soft floating melody",
    generated: {
      tempo: 82,
      wave: "sine",
      lead: [587.33, 659.25, 783.99, 880, 783.99, 659.25, 587.33, 523.25],
      bass: [293.66, 349.23, 392, 349.23],
      pad: [587.33, 739.99, 880],
      volume: 0.1,
    },
  },
  {
    id: "jungle-jump",
    name: "Jungle Jump",
    nameKh: "ព្រៃលោតសប្បាយ",
    icon: "🌳",
    mood: "Bouncy forest typing beat",
    generated: {
      tempo: 118,
      wave: "square",
      lead: [392, 493.88, 587.33, 493.88, 659.25, 587.33, 493.88, 392],
      bass: [196, 246.94, 293.66, 246.94],
      pad: [392, 493.88, 587.33],
      volume: 0.075,
    },
  },
  {
    id: "mekong-ripple",
    name: "Mekong Ripple",
    nameKh: "រលកមេគង្គ",
    icon: "🌊",
    mood: "Gentle river sparkle",
    generated: {
      tempo: 74,
      wave: "sine",
      lead: [523.25, 659.25, 783.99, 659.25, 587.33, 739.99, 880, 739.99],
      bass: [261.63, 329.63, 293.66, 349.23],
      pad: [523.25, 659.25, 880],
      volume: 0.095,
    },
  },
  {
    id: "royal-parade",
    name: "Royal Parade",
    nameKh: "ដង្ហែរាជវាំង",
    icon: "👑",
    mood: "Tiny victory parade",
    generated: {
      tempo: 108,
      wave: "triangle",
      lead: [523.25, 659.25, 783.99, 1046.5, 987.77, 783.99, 659.25, 783.99],
      bass: [261.63, 392, 329.63, 392],
      pad: [523.25, 659.25, 987.77],
      volume: 0.11,
    },
  },
];

export const SOUND_THEMES: SoundTheme[] = [
  {
    id: "bubble",
    name: "Bubble Pop",
    nameKh: "ប៊ូប៊លសប្បាយ",
    description: "Soft pop sounds for young learners.",
    icon: "🫧",
    wave: "sine",
    keystrokeBase: 650,
    keystrokeRange: 180,
    correct: [880, 1174.66],
    wrong: [220, 185],
    victory: [523.25, 659.25, 783.99, 1046.5, 1318.51],
  },
  {
    id: "temple",
    name: "Temple Bells",
    nameKh: "សំឡេងជួងប្រាសាទ",
    description: "Bright bell tones inspired by Khmer temples.",
    icon: "🔔",
    wave: "triangle",
    keystrokeBase: 520,
    keystrokeRange: 140,
    correct: [784, 1046.5, 1318.51],
    wrong: [246.94, 196],
    victory: [392, 523.25, 659.25, 783.99, 1046.5, 1567.98],
  },
  {
    id: "jungle",
    name: "Jungle Quest",
    nameKh: "ដំណើរព្រៃរីករាយ",
    description: "Playful adventure sounds with a warm bounce.",
    icon: "🌿",
    wave: "square",
    keystrokeBase: 440,
    keystrokeRange: 120,
    correct: [659.25, 783.99, 987.77],
    wrong: [174.61, 146.83],
    victory: [329.63, 392, 493.88, 659.25, 783.99, 987.77],
  },
  {
    id: "water",
    name: "Mekong Splash",
    nameKh: "ទន្លេមេគង្គស្រស់",
    description: "Light splashy tones that feel calm and happy.",
    icon: "🌊",
    wave: "sine",
    keystrokeBase: 720,
    keystrokeRange: 90,
    correct: [987.77, 1174.66, 1396.91],
    wrong: [293.66, 246.94],
    victory: [587.33, 739.99, 880, 1174.66, 1396.91],
  },
  {
    id: "royal",
    name: "Royal Stars",
    nameKh: "ផ្កាយរាជវាំង",
    description: "Sparkly reward sounds for confident typing.",
    icon: "👑",
    wave: "triangle",
    keystrokeBase: 760,
    keystrokeRange: 160,
    correct: [1046.5, 1318.51, 1567.98],
    wrong: [196, 164.81],
    victory: [523.25, 659.25, 783.99, 987.77, 1318.51, 1567.98],
  },
];

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted = false;
  private currentTrackId = "main";
  private currentSoundThemeId = "bubble";
  private effectsEnabled = true;
  private bgAudio: HTMLAudioElement | null = null;
  private isBgPlaying = false;
  private bgMaster: GainNode | null = null;
  private bgTimer: number | null = null;
  private bgStep = 0;

  constructor() {
    const savedTrack = localStorage.getItem("selectedMusicTrack");
    const savedSoundTheme = localStorage.getItem("selectedSoundTheme");
    const savedEffects = localStorage.getItem("typingSoundEffects");

    if (savedTrack && MUSIC_TRACKS.some((track) => track.id === savedTrack)) {
      this.currentTrackId = savedTrack;
    }

    if (savedSoundTheme && SOUND_THEMES.some((theme) => theme.id === savedSoundTheme)) {
      this.currentSoundThemeId = savedSoundTheme;
    }

    this.effectsEnabled = savedEffects !== "false";
  }

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => undefined);
    }
  }

  private getActiveSoundTheme() {
    return SOUND_THEMES.find((theme) => theme.id === this.currentSoundThemeId) || SOUND_THEMES[0];
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
    if (!MUSIC_TRACKS.some((track) => track.id === trackId)) return;
    this.currentTrackId = trackId;
    localStorage.setItem("selectedMusicTrack", trackId);
  }

  getCurrentSoundThemeId() {
    return this.currentSoundThemeId;
  }

  setCurrentSoundTheme(themeId: string) {
    if (!SOUND_THEMES.some((theme) => theme.id === themeId)) return;
    this.currentSoundThemeId = themeId;
    localStorage.setItem("selectedSoundTheme", themeId);
  }

  setSoundEffectsEnabled(enabled: boolean) {
    this.effectsEnabled = enabled;
    localStorage.setItem("typingSoundEffects", String(enabled));
  }

  getSoundEffectsEnabled() {
    return this.effectsEnabled;
  }

  previewSoundTheme(themeId: string) {
    if (!SOUND_THEMES.some((theme) => theme.id === themeId)) return;

    const previousTheme = this.currentSoundThemeId;
    const previousEnabled = this.effectsEnabled;

    this.currentSoundThemeId = themeId;
    this.effectsEnabled = true;
    this.playKeystroke();
    setTimeout(() => this.playCorrect(), 80);
    setTimeout(() => {
      this.currentSoundThemeId = previousTheme;
      this.effectsEnabled = previousEnabled;
    }, 360);
  }

  private playTone(freq: number, type: OscillatorType, duration: number, volume: number) {
    if (this.isMuted || !this.effectsEnabled) return;
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

  private playBackgroundTone(freq: number, type: OscillatorType, delay: number, duration: number, volume: number) {
    if (this.isMuted || !this.ctx || !this.bgMaster) return;

    const startAt = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startAt);

    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

    osc.connect(gain);
    gain.connect(this.bgMaster);

    osc.start(startAt);
    osc.stop(startAt + duration + 0.04);
  }

  playKeystroke() {
    const theme = this.getActiveSoundTheme();
    this.playTone(theme.keystrokeBase + Math.random() * theme.keystrokeRange, theme.wave, 0.03, 0.03);
  }

  playCorrect() {
    const theme = this.getActiveSoundTheme();
    theme.correct.forEach((note, i) => {
      setTimeout(() => this.playTone(note, theme.wave, 0.08, i === 0 ? 0.1 : 0.075), i * 55);
    });
  }

  playWrong() {
    const theme = this.getActiveSoundTheme();
    theme.wrong.forEach((note, i) => {
      setTimeout(() => this.playTone(note, "sawtooth", 0.12, i === 0 ? 0.07 : 0.045), i * 75);
    });
  }

  playClick() {
    const theme = this.getActiveSoundTheme();
    this.playTone(theme.keystrokeBase * 0.72, theme.wave, 0.05, 0.045);
  }

  playLevelUp() {
    const theme = this.getActiveSoundTheme();
    theme.victory.slice(0, 4).forEach((note, i) => {
      setTimeout(() => this.playTone(note, theme.wave, 0.15, 0.1), i * 100);
    });
  }

  playStarEarned() {
    const theme = this.getActiveSoundTheme();
    const notes = theme.correct.length >= 3 ? theme.correct : [...theme.correct, theme.correct[theme.correct.length - 1] * 1.25];

    notes.slice(0, 3).forEach((note, i) => {
      setTimeout(() => this.playTone(note, theme.wave, i === 2 ? 0.15 : 0.1, i === 2 ? 0.12 : 0.1), i * 80);
    });
  }

  playBadgeUnlock() {
    const theme = this.getActiveSoundTheme();
    theme.victory.forEach((note, i) => {
      setTimeout(() => this.playTone(note, "triangle", 0.2, 0.1), i * 120);
    });
  }

  playRaceStart() {
    const theme = this.getActiveSoundTheme();
    this.playTone(theme.keystrokeBase * 0.75, "square", 0.15, 0.08);
    setTimeout(() => this.playTone(theme.keystrokeBase * 0.75, "square", 0.15, 0.08), 400);
    setTimeout(() => this.playTone(theme.keystrokeBase * 1.5, "square", 0.3, 0.1), 800);
  }

  playVictory() {
    const theme = this.getActiveSoundTheme();
    theme.victory.forEach((note, i) => {
      setTimeout(() => this.playTone(note, theme.wave, 0.2, 0.12), i * 80);
    });
    setTimeout(() => {
      this.playTone(theme.victory[theme.victory.length - 2] || 1046.5, theme.wave, 0.5, 0.15);
    }, 600);
  }

  playStreak(count: number) {
    const theme = this.getActiveSoundTheme();
    const baseFreq = theme.keystrokeBase + Math.min(count * 45, 420);
    this.playTone(baseFreq, theme.wave, 0.08, 0.06);
    if (count >= 5) {
      setTimeout(() => this.playTone(baseFreq * 1.5, theme.wave, 0.06, 0.04), 40);
    }
    if (count >= 10) {
      setTimeout(() => this.playTone(baseFreq * 2, theme.wave, 0.06, 0.04), 80);
    }
  }

  playComboBreak() {
    const theme = this.getActiveSoundTheme();
    this.playTone(theme.wrong[0] || 300, "sawtooth", 0.2, 0.06);
    setTimeout(() => this.playTone(theme.wrong[1] || 200, "sawtooth", 0.3, 0.04), 100);
  }

  playCountdown(num: number) {
    const theme = this.getActiveSoundTheme();
    if (num > 0) {
      this.playTone(theme.keystrokeBase * 0.75, "square", 0.1, 0.08);
    } else {
      this.playTone(theme.keystrokeBase * 1.5, "square", 0.2, 0.1);
    }
  }

  private startGeneratedBackground(track: MusicTrack) {
    if (!track.generated || !this.ctx) return;

    if (this.bgAudio) {
      this.bgAudio.pause();
      this.bgAudio.currentTime = 0;
    }

    this.stopGeneratedBackground();

    const generated = track.generated;
    const stepSeconds = 60 / generated.tempo;
    this.bgMaster = this.ctx.createGain();
    this.bgMaster.gain.setValueAtTime(generated.volume, this.ctx.currentTime);
    this.bgMaster.connect(this.ctx.destination);
    this.bgStep = 0;

    const tick = () => {
      if (!track.generated) return;

      const leadNote = generated.lead[this.bgStep % generated.lead.length];
      this.playBackgroundTone(leadNote, generated.wave, 0, stepSeconds * 0.72, 0.24);

      if (this.bgStep % 2 === 1) {
        this.playBackgroundTone(leadNote * 2, "sine", stepSeconds * 0.2, stepSeconds * 0.35, 0.07);
      }

      if (this.bgStep % 4 === 0) {
        const bassNote = generated.bass[Math.floor(this.bgStep / 4) % generated.bass.length];
        this.playBackgroundTone(bassNote, "sine", 0, stepSeconds * 2.8, 0.14);
      }

      if (this.bgStep % 8 === 0) {
        generated.pad.forEach((note, index) => {
          this.playBackgroundTone(note, "sine", index * 0.04, stepSeconds * 6.2, 0.035);
        });
      }

      this.bgStep += 1;
    };

    tick();
    this.bgTimer = window.setInterval(tick, stepSeconds * 1000);
    this.isBgPlaying = true;
  }

  private stopGeneratedBackground() {
    if (this.bgTimer) {
      window.clearInterval(this.bgTimer);
      this.bgTimer = null;
    }

    if (this.bgMaster) {
      this.bgMaster.disconnect();
      this.bgMaster = null;
    }

    this.bgStep = 0;
  }

  startBackgroundMusic() {
    if (this.isMuted || this.isBgPlaying) return;
    this.init();

    const savedTrack = localStorage.getItem("selectedMusicTrack");
    if (savedTrack && MUSIC_TRACKS.some((track) => track.id === savedTrack)) {
      this.currentTrackId = savedTrack;
    }

    const track = MUSIC_TRACKS.find((item) => item.id === this.currentTrackId) || MUSIC_TRACKS[0];

    if (track.generated) {
      this.startGeneratedBackground(track);
      return;
    }

    if (!track.file) return;

    this.stopGeneratedBackground();

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
    this.stopGeneratedBackground();
    if (this.bgAudio) {
      this.bgAudio.pause();
      this.bgAudio.currentTime = 0;
    }
    this.isBgPlaying = false;
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
    const safeVolume = Math.max(0, Math.min(1, volume));
    if (this.bgAudio) {
      this.bgAudio.volume = safeVolume;
    }
    if (this.bgMaster && this.ctx) {
      this.bgMaster.gain.setValueAtTime(safeVolume, this.ctx.currentTime);
    }
  }
}

export const sounds = new SoundManager();
