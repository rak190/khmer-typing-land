import React, { useState, useEffect } from 'react';
import { useGameStore } from '@/lib/store';
import { Badge, Volume2, VolumeX, Sun, Moon, Palette, Info, Heart } from 'lucide-react';
import { makeBadges } from '@/lib/badges';
import { Link } from 'wouter';
import { sounds } from '@/lib/sounds';
import { useTranslation } from '@/lib/useTranslation';
import donateQrCode from '@/assets/images/donate-qr.jpg';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const ALL_BADGES = makeBadges();

export const HUD: React.FC = () => {
  const { profile, selectedBadgeId, getTotalStars } = useGameStore();
  const { t, lang } = useTranslation();
  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem('musicMuted');
    return saved === 'true';
  });
  const [theme, setTheme] = useState<'light' | 'dark'>(
    typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  );

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    if (!isMuted) {
      const startMusic = () => {
        sounds.startBackgroundMusic();
        document.removeEventListener('click', startMusic);
        document.removeEventListener('keydown', startMusic);
      };
      document.addEventListener('click', startMusic);
      document.addEventListener('keydown', startMusic);
      sounds.startBackgroundMusic();
      return () => {
        document.removeEventListener('click', startMusic);
        document.removeEventListener('keydown', startMusic);
      };
    }
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };
  
  const badge = ALL_BADGES.find(b => b.id === selectedBadgeId) || ALL_BADGES[0];
  const stars = getTotalStars();

  const toggleMusic = () => {
    if (isMuted) {
      sounds.startBackgroundMusic();
      setIsMuted(false);
      localStorage.setItem('musicMuted', 'false');
    } else {
      sounds.stopBackgroundMusic();
      setIsMuted(true);
      localStorage.setItem('musicMuted', 'true');
    }
  };

  useEffect(() => {
    return () => {
      sounds.stopBackgroundMusic();
    };
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-3 flex justify-between items-center bg-background/80 backdrop-blur-md border-b border-border shadow-sm transition-colors duration-300">
      <div className="flex items-center gap-3">
        <span className="text-3xl animate-bounce-slow">{badge.icon}</span>
        <div className="flex flex-col">
          <span className="text-lg font-black tracking-tight text-foreground leading-none">
            Khmer Typing Land
          </span>
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
            NiDA Mode
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Link href="/themes">
          <button 
            className="p-2 rounded-full bg-secondary border border-border text-foreground hover:text-primary transition-colors"
            title={t.themeSettings}
          >
            <Palette size={18} />
          </button>
        </Link>
        
        <button 
          onClick={toggleMusic}
          className="p-2 rounded-full bg-secondary border border-border text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
          title={isMuted ? "បើកចម្រៀងផ្ទៃខាងក្រោយ" : "បិទចម្រៀងផ្ទៃខាងក្រោយ"}
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} className="animate-pulse" />}
        </button>

        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary border border-border backdrop-blur-sm">
          <span className="text-lg">{badge.icon}</span>
          <span className="text-sm font-bold text-foreground">{profile.name}</span>
        </div>
        
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 backdrop-blur-sm">
          <span className="text-yellow-600 text-sm">⭐</span>
          <span className="text-sm font-black text-yellow-700 dark:text-yellow-500">{stars}</span>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <button 
              className="p-2 rounded-full bg-secondary border border-border text-foreground hover:text-primary transition-colors"
              title="អំពីយើង"
              data-testid="button-about-us"
            >
              <Info size={18} />
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-background border-border sm:rounded-3xl p-0 overflow-hidden shadow-2xl">
            <div className="relative">
              {/* Header/Hero Section */}
              <div className="bg-primary p-8 text-primary-foreground">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-4xl animate-float">🇰🇭</div>
                  <div>
                    <h2 className="text-3xl font-black tracking-tight font-display">Khmer Typing Land</h2>
                    <p className="text-primary-foreground/80 font-medium font-body">ស្ទាត់ជំនាញក្នុងការវាយអត្ថបទខ្មែរ</p>
                  </div>
                </div>
              </div>
              
              {/* Content Section */}
              <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto font-body">
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2 font-display">
                    <span className="p-1.5 bg-primary/10 rounded-lg text-primary">✨</span>
                    បេសកកម្មរបស់យើង
                  </h3>
                  <p className="text-muted-foreground leading-relaxed font-body">Khmer Typing Land គឺជាកម្មវិធីអប់រំតាមបែបហ្គេម ដែលបង្កើតឡើងដើម្បីថែរក្សា និងលើកកម្ពស់ភាសាខ្មែរក្នុងសម័យឌីជីថល។ គោលដៅរបស់យើងគឺធ្វើឱ្យការរៀនវាយអត្ថបទតាមរយៈKhmer Unicode មានភាពសប្បាយរីករាយ និងងាយស្រួលសម្រាប់អ្នករាល់គ្នា។</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-secondary/50 rounded-2xl border border-border">
                    <h4 className="font-bold text-foreground mb-2 flex items-center gap-2 font-display">
                      🎮 ការរៀនបែបកម្សាន្ត
                    </h4>
                    <p className="text-sm text-muted-foreground font-body">
                      រុករកពិភពប្លែកៗចំនួន ៩ ជាមួយ ៨១ វគ្គដែលបានរៀបចំឡើងសម្រាប់ការរីកចម្រើនជាជំហានៗ។
                    </p>
                  </div>
                  <div className="p-4 bg-secondary/50 rounded-2xl border border-border">
                    <h4 className="font-bold text-foreground mb-2 flex items-center gap-2 font-display">🏫 មុខងារសម្រាប់គ្រូបង្រៀន</h4>
                    <p className="text-sm text-muted-foreground font-body">ផ្តល់មុខងារដល់គ្រូបង្រៀនជាមួយនឹងការគ្រប់គ្រងបន្ទប់រៀន និងការតាមដានការរីកចម្រើនរបស់សិស្សក្នុងពេលជាក់ស្តែង។</p>
                  </div>
                </div>

                <div className="p-6 bg-amber-50 rounded-2xl border border-amber-200">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="bg-white p-2 rounded-xl shadow-sm border border-amber-100 shrink-0">
                      <img 
                        src={donateQrCode} 
                        alt="Donate QR" 
                        className="w-32 h-32 object-contain"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-amber-900 mb-1 font-display flex items-center gap-2">
                        <Heart size={18} className="text-red-500 fill-red-500" />
                        គាំទ្រការងាររបស់យើង
                      </h3>
                      <p className="text-sm text-amber-800/80 font-body mb-3">
                        រាល់ការបរិច្ចាគរបស់លោកអ្នក នឹងជួយឱ្យយើងបន្តអភិវឌ្ឍកម្មវិធីនេះឱ្យកាន់តែប្រសើរ។
                      </p>
                      <p className="text-xs font-bold text-amber-700 uppercase tracking-wider font-body">
                        គាំទ្រជាកាហ្វេមួយកែវ
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2 font-display">
                    <span className="p-1.5 bg-amber-500/10 rounded-lg text-amber-500">🛡️</span>
                    បង្កើតឡើងសម្រាប់អ្នក
                  </h3>
                  <p className="text-muted-foreground leading-relaxed font-body">មិនថាអ្នកជាសិស្សដែលកំពុងចាប់ផ្តើមដំណើរវាយអត្ថបទ ឬជាគ្រូបង្រៀនដែលកំពុងណែនាំសិស្សនោះទេ កម្មវិធីនេះផ្តល់នូវមុខងារដែលអ្នកត្រូវការដើម្បីទទួលបានជោគជ័យ ជាមួយនឹងការតាមដានល្បឿនវាយអត្ថបទ ភាពត្រឹមត្រូវ និងហ្គេមខ្នាតតូចដែលមានមានភាពទាក់ទាញ។</p>
                </div>

                <div className="pt-4 border-t border-border flex justify-between items-center text-xs text-muted-foreground italic font-body">
                  <span>កំណែ ២.០.០ (ប្លង់ NiDA)</span>
                  <span>បង្កើតឡើងដោយ ❤️ សម្រាប់កម្ពុជា</span>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        <Link href="/">
          <button 
            className="px-4 py-1.5 rounded-full bg-primary hover:opacity-90 text-sm font-bold text-primary-foreground transition-all font-body"
          >
            {t.home}
          </button>
        </Link>
      </div>
    </header>
  );
};
