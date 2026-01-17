import React from 'react';
import { useGameStore } from '@/lib/store';
import { buildWorlds } from '@/lib/curriculum';
import { cn } from '@/lib/utils';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Lock, Unlock, Play } from 'lucide-react';
import { HUD } from '@/components/HUD';

import { STORY_CHAPTERS } from '@/lib/story';

const WORLDS = buildWorlds();

export const Home: React.FC = () => {
  const { getTotalStars, profile, setProfileName, badgesOwned, resetProgress } = useGameStore();
  const totalStars = getTotalStars();

  return (
    <div className="min-h-screen bg-background pb-20 pt-20">
      <HUD />
      
      <div className="container mx-auto px-4 mt-8 max-w-5xl">
        {/* Welcome Card */}
        <div className="glass-panel p-8 rounded-3xl mb-12 border-primary/20 bg-primary/5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl font-black text-white mb-2 font-display">
                <span className="text-primary">Chapter {Math.min(9, Math.floor(totalStars / 12) + 1)}:</span> {STORY_CHAPTERS[Math.min(8, Math.floor(totalStars / 12))]?.title}
              </h1>
              <p className="text-slate-300 max-w-2xl text-lg italic">
                "{STORY_CHAPTERS[Math.min(8, Math.floor(totalStars / 12))]?.intro}"
              </p>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <div className="text-6xl animate-bounce">
                {STORY_CHAPTERS[Math.min(8, Math.floor(totalStars / 12))]?.monsterEmoji}
              </div>
              <div className="text-xs font-bold text-red-400 uppercase tracking-widest">Target: {STORY_CHAPTERS[Math.min(8, Math.floor(totalStars / 12))]?.monsterName}</div>
            </div>
          </div>
          
          <div className="mt-8 flex gap-4 items-center">
             <input 
               value={profile.name}
               onChange={(e) => setProfileName(e.target.value)}
               className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 w-64"
               placeholder="Scribe Name..."
             />
             <div className="flex gap-2 ml-auto">
              <Link href="/badges">
                <Button variant="glass" size="sm" className="gap-2">
                  <span>Collection</span>
                  <span className="bg-white/10 px-2 py-0.5 rounded text-xs">
                    {badgesOwned.length}
                  </span>
                </Button>
              </Link>
              <Button variant="ghost" size="sm" className="text-xs text-slate-500" onClick={() => {
                if(confirm("Erase your legend?")) resetProgress();
              }}>
                Reset Journey
              </Button>
             </div>
          </div>
        </div>

        {/* Worlds Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {WORLDS.map((world, i) => {
            const isUnlocked = totalStars >= world.unlockStars;
            
            return (
              <div 
                key={world.id}
                className={cn(
                  "group relative p-6 rounded-2xl border transition-all duration-300",
                  isUnlocked 
                    ? "bg-card/50 border-white/10 hover:border-primary/50 hover:bg-card/80 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10" 
                    : "bg-black/20 border-white/5 opacity-70 grayscale"
                )}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-2xl border border-white/10 group-hover:bg-primary/20 group-hover:border-primary/30 transition-colors">
                    {isUnlocked ? "🌍" : "🔒"}
                  </div>
                  {!isUnlocked && (
                    <div className="px-3 py-1 rounded-full bg-black/40 border border-white/5 text-xs font-mono text-slate-400">
                      Need {world.unlockStars} ⭐
                    </div>
                  )}
                </div>
                
                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-primary transition-colors">
                  {world.name}
                </h3>
                <p className="text-sm text-slate-400 mb-6">
                  {world.stages.length} Stages • Focus on basic consonants
                </p>

                <Link href={isUnlocked ? `/world/${world.id}` : "#"}>
                  <Button 
                    className="w-full gap-2" 
                    variant={isUnlocked ? "secondary" : "ghost"}
                    disabled={!isUnlocked}
                  >
                    {isUnlocked ? (
                      <>Enter World <Play size={14} /></>
                    ) : (
                      <>Locked <Lock size={14} /></>
                    )}
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
