import React, { useState, useEffect } from 'react';
import { useGameStore } from '@/lib/store';
import { Badge, Volume2, VolumeX, Sun, Moon, Palette } from 'lucide-react';
import { makeBadges } from '@/lib/badges';
import { Link } from 'wouter';
import { sounds } from '@/lib/sounds';
import { useTranslation } from '@/lib/useTranslation';

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
          onClick={toggleTheme}
          className="p-2 rounded-full bg-secondary border border-border text-foreground hover:text-primary transition-colors"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

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

        <Link href="/">
           <button className="px-4 py-1.5 rounded-full bg-primary hover:opacity-90 text-sm font-bold text-primary-foreground transition-all font-body">
             {t.home}
           </button>
        </Link>
      </div>
    </header>
  );
};
