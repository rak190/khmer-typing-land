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
              <h1 className="text-4xl font-black text-foreground mb-2 font-display">
                <span className="text-primary">វគ្គទី {Math.min(9, Math.floor(totalStars / 12) + 1)}:</span> {STORY_CHAPTERS[Math.min(8, Math.floor(totalStars / 12))]?.title}
              </h1>
              <p className="text-muted-foreground max-w-2xl text-lg italic">
                "{STORY_CHAPTERS[Math.min(8, Math.floor(totalStars / 12))]?.intro}"
              </p>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <div className="text-6xl animate-bounce">
                {STORY_CHAPTERS[Math.min(8, Math.floor(totalStars / 12))]?.monsterEmoji}
              </div>
              <div className="text-xs font-bold text-red-400 uppercase tracking-widest">គោលដៅ: {STORY_CHAPTERS[Math.min(8, Math.floor(totalStars / 12))]?.monsterName}</div>
            </div>
          </div>
          
          <div className="mt-8 flex gap-4 items-center">
             <input 
               value={profile.name}
               onChange={(e) => setProfileName(e.target.value)}
               className="bg-secondary border border-border rounded-xl px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 w-64 font-body"
               placeholder="ឈ្មោះអ្នកសរសេរ..."
             />
             <div className="flex gap-2 ml-auto">
              <Link href="/badges">
                <Button variant="outline" size="sm" className="gap-2 bg-white/50 border-slate-300 text-slate-700 hover:bg-white hover:text-primary transition-all shadow-sm font-body">
                  <span className="font-bold">ការប្រមូល</span>
                  <span className="bg-slate-200 px-2 py-0.5 rounded text-xs font-mono">
                    {badgesOwned.length}
                  </span>
                </Button>
              </Link>
              <Button variant="ghost" size="sm" className="text-xs text-red-500 font-bold hover:bg-red-50 hover:text-red-600 transition-colors font-body" onClick={() => {
                if(confirm("លុបការរីកចម្រើនរបស់អ្នក?")) resetProgress();
              }}>
                ចាប់ផ្តើមឡើងវិញ
              </Button>
              <Button variant="ghost" size="sm" className="text-xs text-amber-500 font-bold hover:bg-amber-50 hover:text-amber-600 transition-colors font-body" onClick={() => {
                if(confirm("បើកគ្រប់វគ្គទាំងអស់? (Easy Mode)")) {
                  const { recordStageResult } = useGameStore.getState();
                  WORLDS.forEach(w => {
                    w.stages.forEach(s => {
                      recordStageResult(w.id, s.id, 3);
                    });
                  });
                }
              }}>
                បើកគ្រប់វគ្គ (Easy Mode)
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
                  "group relative p-6 rounded-2xl border transition-all duration-300 shadow-sm",
                  isUnlocked 
                    ? "bg-card border-border hover:border-primary/50 hover:-translate-y-1 hover:shadow-xl" 
                    : "bg-muted border-border opacity-70 grayscale"
                )}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-2xl border border-border group-hover:bg-primary/10 group-hover:border-primary/30 transition-colors">
                    {isUnlocked ? "🌍" : "🔒"}
                  </div>
                  {!isUnlocked && (
                    <div className="px-3 py-1 rounded-full bg-secondary border border-border text-xs font-mono text-muted-foreground">
                      ត្រូវការ {world.unlockStars} ⭐
                    </div>
                  )}
                </div>
                
                <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors font-display">
                  {world.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-6 font-body">
                  {world.stages.length} វគ្គ • ផ្តោតលើព្យញ្ជនៈមូលដ្ឋាន
                </p>

                <Link href={isUnlocked ? `/world/${world.id}` : "#"}>
                  <Button 
                    className="w-full gap-2 font-body" 
                    variant={isUnlocked ? "secondary" : "ghost"}
                    disabled={!isUnlocked}
                  >
                    {isUnlocked ? (
                      <>ចូលទៅកាន់ពិភព <Play size={14} /></>
                    ) : (
                      <>ជាប់សោ <Lock size={14} /></>
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
