import React from 'react';
import { useGameStore } from '@/lib/store';
import { Badge } from 'lucide-react';
import { makeBadges } from '@/lib/badges';
import { Link } from 'wouter';

const ALL_BADGES = makeBadges();

export const HUD: React.FC = () => {
  const { profile, selectedBadgeId, getTotalStars } = useGameStore();
  
  const badge = ALL_BADGES.find(b => b.id === selectedBadgeId) || ALL_BADGES[0];
  const stars = getTotalStars();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-3 flex justify-between items-center bg-background/50 backdrop-blur-md border-b border-white/5">
      <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
        <span className="text-3xl animate-bounce-slow">{badge.icon}</span>
        <div className="flex flex-col">
          <span className="text-lg font-black tracking-tight text-foreground leading-none">
            Khmer Typing Land
          </span>
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
            NiDA Mode
          </span>
        </div>
      </Link>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary border border-border backdrop-blur-sm">
          <span className="text-lg">{badge.icon}</span>
          <span className="text-sm font-bold text-foreground">{profile.name}</span>
        </div>
        
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 backdrop-blur-sm">
          <span className="text-yellow-600 text-sm">⭐</span>
          <span className="text-sm font-black text-yellow-700">{stars}</span>
        </div>

        <Link href="/">
           <button className="px-4 py-1.5 rounded-full bg-primary hover:opacity-90 text-sm font-bold text-primary-foreground transition-all">
             Home
           </button>
        </Link>
      </div>
    </header>
  );
};
