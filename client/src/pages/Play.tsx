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

import { STORY_CHAPTERS, RANDOM_EVENTS } from '@/lib/story';

const WORLDS = buildWorlds();
const ALL_BADGES = makeBadges();

type GamePhase = "intro" | "platform" | "runner" | "defender" | "result";

export const Play: React.FC = () => {
  const [, params] = useRoute("/play/:wid/:sid");
  const [, setLocation] = useLocation();
  const { recordStageResult, selectedBadgeId } = useGameStore();

  const [phase, setPhase] = useState<GamePhase>("intro");
  const [stats, setStats] = useState({ hits: 0, miss: 0 });
  const [newBadges, setNewBadges] = useState<string[]>([]);
  const [activeEvent, setActiveEvent] = useState<typeof RANDOM_EVENTS[0] | null>(null);
  
  const worldId = params?.wid;
  const stageId = params?.sid;
  
  const world = WORLDS.find(w => w.id === worldId);
  const stage = world?.stages.find(s => s.id === stageId);
  const chapter = STORY_CHAPTERS.find(c => c.worldId === worldId);
  
  // Find mascot icon
  const badge = ALL_BADGES.find(b => b.id === selectedBadgeId) || ALL_BADGES[0];
  const mascot = badge.icon;

  useEffect(() => {
    // Random Event Check
    if (phase === "intro") {
      const event = RANDOM_EVENTS.find(e => Math.random() < e.chance);
      if (event) {
        setActiveEvent(event);
      }
    }
  }, [phase]);

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
    <div className="min-h-screen p-4 sm:p-8 flex flex-col items-center" data-world={worldId}>
      <HUD />

      {phase !== "result" && (
        <div className="w-full max-w-4xl flex justify-between items-center mb-8 relative z-10">
           <Button variant="ghost" onClick={handleQuit} className="gap-2 text-slate-400 hover:text-white">
             <ArrowLeft size={16} /> Quit Lesson
           </Button>
        </div>
      )}

      <div className="container mx-auto px-4 flex flex-col items-center justify-center min-h-[60vh]">
        {phase === "intro" && (
          <div className="glass-panel p-10 rounded-3xl text-center max-w-2xl w-full animate-in fade-in zoom-in duration-500 border-primary/30 shadow-[0_0_50px_rgba(59,130,246,0.2)]">
            <div className="text-sm font-bold text-primary uppercase tracking-[0.3em] mb-4">Quest Objective</div>
            <h1 className="text-4xl font-black text-white mb-6">{stage.name}</h1>
            
            <div className="flex items-center justify-center gap-8 mb-8">
              <div className="text-6xl animate-bounce">{mascot}</div>
              <div className="text-2xl text-slate-500 font-bold">VS</div>
              <div className="text-6xl animate-pulse">{chapter?.monsterEmoji}</div>
            </div>

            <p className="text-slate-300 italic text-xl mb-10 leading-relaxed">
              "To defeat the {chapter?.monsterName}, you must master these scripts: <span className="text-white font-bold not-italic">{stage.pool.join(' ')}</span>"
            </p>

            {activeEvent && (
              <div className="mb-8 p-4 bg-yellow-400/10 border border-yellow-400/30 rounded-2xl animate-pulse">
                <div className="text-yellow-400 font-bold flex items-center justify-center gap-2">
                  ✨ Random Event: {activeEvent.name}
                </div>
                <div className="text-xs text-yellow-200/70">{activeEvent.description}</div>
              </div>
            )}

            <Button size="lg" className="px-12 py-8 text-2xl font-black bg-primary hover:bg-primary/80 text-primary-foreground rounded-2xl shadow-xl shadow-primary/20" onClick={() => setPhase("platform")}>
              BEGIN QUEST
            </Button>
          </div>
        )}

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
              {params?.wid && params?.sid && (
                <Button size="lg" className="w-full bg-green-600 hover:bg-green-500 text-white font-bold" onClick={() => {
                  const worldId = params.wid;
                  const currentStageNo = parseInt(params.sid.replace("s", ""));
                  const world = WORLDS.find(w => w.id === worldId);
                  const nextStageId = `s${currentStageNo + 1}`;
                  const nextStage = world?.stages.find(s => s.id === nextStageId);
                  
                  if (nextStage) {
                    setLocation(`/play/${worldId}/${nextStageId}`);
                    // Reset game state for next stage
                    setPhase("platform");
                    setStats({ hits: 0, miss: 0 });
                    setNewBadges([]);
                  } else {
                    // No more stages in this world, go back
                    setLocation(`/world/${worldId}`);
                  }
                }}>
                  Next Stage →
                </Button>
              )}
              <Button size="lg" variant="outline" className="w-full" onClick={() => {
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
