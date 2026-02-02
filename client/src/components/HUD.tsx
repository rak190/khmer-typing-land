import React, { useState, useEffect } from 'react';
import { useGameStore } from '@/lib/store';
import { Badge, Volume2, VolumeX, Sun, Moon, Palette, Info } from 'lucide-react';
import { makeBadges } from '@/lib/badges';
import { Link } from 'wouter';
import { sounds } from '@/lib/sounds';
import { useTranslation } from '@/lib/useTranslation';
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
  const [isMuted, setIsMuted] = useState(true);
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

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };
  
  const badge = ALL_BADGES.find(b => b.id === selectedBadgeId) || ALL_BADGES[0];
  const stars = getTotalStars();

  const toggleMusic = () => {
    if (isMuted) {
      sounds.startBackgroundMusic();
      setIsMuted(false);
    } else {
      sounds.stopBackgroundMusic();
      setIsMuted(true);
    }
  };

  useEffect(() => {
    // Cleanup sounds when unmounting
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
          title={isMuted ? "Enable Background Music" : "Mute Background Music"}
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
              title="About Us"
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
                    <h2 className="text-3xl font-black tracking-tight">Khmer Typing Land</h2>
                    <p className="text-primary-foreground/80 font-medium">Master the Art of Khmer Typing</p>
                  </div>
                </div>
              </div>
              
              {/* Content Section */}
              <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto font-body">
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                    <span className="p-1.5 bg-primary/10 rounded-lg text-primary">✨</span>
                    Our Mission
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Khmer Typing Land is a gamified educational platform dedicated to preserving and promoting the Khmer language in the digital age. Our goal is to make learning the NiDA keyboard layout fun, engaging, and accessible for everyone.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-secondary/50 rounded-2xl border border-border">
                    <h4 className="font-bold text-foreground mb-2 flex items-center gap-2">
                      🎮 Gamified Learning
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Explore 9 unique worlds with 81 challenging stages designed for steady progression.
                    </p>
                  </div>
                  <div className="p-4 bg-secondary/50 rounded-2xl border border-border">
                    <h4 className="font-bold text-foreground mb-2 flex items-center gap-2">
                      🏫 Teacher Mode
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Empowering educators with real-time room management and student progress tracking.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                    <span className="p-1.5 bg-amber-500/10 rounded-lg text-amber-500">🛡️</span>
                    Built for You
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Whether you're a student starting your journey or a teacher guiding others, this platform provides the tools you need to succeed with high-performance tracking and interactive mini-games.
                  </p>
                </div>

                <div className="pt-4 border-t border-border flex justify-between items-center text-xs text-muted-foreground italic">
                  <span>Version 2.0.0 (NiDA Layout)</span>
                  <span>Made with ❤️ for Cambodia</span>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        <Link href="/">
           <button className="px-4 py-1.5 rounded-full bg-primary hover:opacity-90 text-sm font-bold text-primary-foreground transition-all font-body">
             {t.home}
           </button>
        </Link>
      </div>
    </header>
  );
};
