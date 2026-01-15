import React, { useState } from 'react';
import { useGameStore } from '@/lib/store';
import { buildWorlds } from '@/lib/curriculum';
import { Link, useRoute, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { HUD } from '@/components/HUD';
import { GamePlatform } from '@/components/game/GamePlatform';
import { GameRunner } from '@/components/game/GameRunner';
import { GameDefender } from '@/components/game/GameDefender';
import { makeBadges } from '@/lib/badges';
import { cn } from '@/lib/utils';

const WORLDS = buildWorlds();
const ALL_BADGES = makeBadges();

type GamePhase = "platform" | "runner" | "defender" | "result";

export const Play: React.FC = () => {
  const [, params] = useRoute("/play/:wid/:sid");
  const [, setLocation] = useLocation();
  const { recordStageResult, selectedBadgeId } = useGameStore();

  const [phase, setPhase] = useState<GamePhase>("platform");
  const [stats, setStats] = useState({ hits: 0, miss: 0 });
  const [newBadges, setNewBadges] = useState<string[]>([]);
  
  const worldId = params?.wid;
  const stageId = params?.sid;
  
  const world = WORLDS.find(w => w.id === worldId);
  const stage = world?.stages.find(s => s.id === stageId);
  
  // Find mascot icon
  const badge = ALL_BADGES.find(b => b.id === selectedBadgeId) || ALL_BADGES[0];
  const mascot = badge.icon;

  if (!world || !stage) return <div>Stage not found</div>;

  // Difficulty tuning
  const stageNo = parseInt(stageId?.replace("s","") || "1");
  const platformCount = 10 + stageNo * 2;
  const runGoal = 16 + stageNo * 2;
  const killsGoal = 10 + stageNo * 2;

  const handlePhaseComplete = (phaseStats: { hits: number, miss: number }) => {
    const newStats = { hits: stats.hits + phaseStats.hits, miss: stats.miss + phaseStats.miss };
    setStats(newStats);

    if (phase === "platform") setPhase("runner");
    else if (phase === "runner") setPhase("defender");
    else if (phase === "defender") {
      // Calculate Stars
      const total = newStats.hits + newStats.miss;
      const acc = total > 0 ? newStats.hits / total : 0;
      const stars = acc >= 0.95 ? 3 : acc >= 0.85 ? 2 : acc >= 0.70 ? 1 : 0;
      
      const res = recordStageResult(worldId!, stageId!, stars);
      setNewBadges(res.newBadges);
      setPhase("result");
    }
  };

  const handleQuit = () => {
    setLocation(`/world/${worldId}`);
  };

  return (
    <div className="min-h-screen bg-background pb-10 pt-20">
      <HUD />

      {phase !== "result" && (
        <div className="container mx-auto px-4 mt-4 mb-4">
           <Button variant="ghost" onClick={handleQuit} className="gap-2 text-slate-400 hover:text-white">
             <ArrowLeft size={16} /> Quit Lesson
           </Button>
        </div>
      )}

      <div className="container mx-auto px-4 flex justify-center">
        {phase === "platform" && (
          <GamePlatform 
            pool={stage.pool} 
            count={platformCount} 
            onComplete={handlePhaseComplete}
            onQuit={handleQuit}
          />
        )}
        {phase === "runner" && (
          <GameRunner 
            pool={stage.pool} 
            distanceGoal={runGoal} 
            mascot={mascot}
            onComplete={handlePhaseComplete}
            onQuit={handleQuit}
          />
        )}
        {phase === "defender" && (
          <GameDefender 
            pool={stage.pool} 
            killsGoal={killsGoal} 
            mascot={mascot}
            onComplete={handlePhaseComplete}
            onQuit={handleQuit}
          />
        )}
        
        {phase === "result" && (
          <div className="glass-panel p-10 rounded-3xl text-center max-w-lg w-full animate-in zoom-in-95 duration-300">
            <h1 className="text-4xl font-black text-white mb-2">Lesson Complete! 🎉</h1>
            
            {/* Stars */}
            <div className="flex justify-center gap-2 my-6">
              {[1,2,3].map(i => {
                const total = stats.hits + stats.miss;
                const acc = total > 0 ? stats.hits / total : 0;
                const earnedStars = acc >= 0.95 ? 3 : acc >= 0.85 ? 2 : acc >= 0.70 ? 1 : 0;
                
                return (
                  <span key={i} className={cn("text-5xl transition-all delay-100", i <= earnedStars ? "text-yellow-400 animate-pulse" : "text-slate-700")}>
                    ★
                  </span>
                )
              })}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-sm text-slate-400 uppercase tracking-widest">Accuracy</div>
                <div className="text-2xl font-mono font-bold text-white">
                  {stats.hits + stats.miss > 0 
                    ? Math.round((stats.hits / (stats.hits + stats.miss)) * 100) 
                    : 0}%
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-sm text-slate-400 uppercase tracking-widest">Misses</div>
                <div className="text-2xl font-mono font-bold text-red-400">{stats.miss}</div>
              </div>
            </div>

            {newBadges.length > 0 && (
              <div className="mb-8 p-4 bg-primary/20 border border-primary/40 rounded-xl">
                 <div className="text-primary font-bold mb-2">New Badges Unlocked!</div>
                 <div className="flex justify-center gap-2 flex-wrap">
                   {newBadges.map(bid => {
                     const b = ALL_BADGES.find(x => x.id === bid);
                     return (
                       <div key={bid} className="flex flex-col items-center">
                         <span className="text-3xl">{b?.icon}</span>
                         <span className="text-xs text-white">{b?.name}</span>
                       </div>
                     )
                   })}
                 </div>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <Button size="lg" className="w-full" onClick={() => {
                setPhase("platform");
                setStats({ hits: 0, miss: 0 });
                setNewBadges([]);
              }}>
                Play Again
              </Button>
              <Button size="lg" variant="secondary" className="w-full" onClick={handleQuit}>
                Back to Stages
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
