import React, { useState, useEffect } from 'react';
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
import { Celebration } from '@/components/Celebration';

import { sounds } from '@/lib/sounds';
import { STORY_CHAPTERS, RANDOM_EVENTS, EASTER_EGGS } from '@/lib/story';

const WORLDS = buildWorlds();
const ALL_BADGES = makeBadges();

type GamePhase = "intro" | "platform" | "runner" | "defender" | "result" | "easter-egg";

export const Play: React.FC = () => {
  const [, params] = useRoute("/play/:wid/:sid");
  const [, setLocation] = useLocation();
  const { recordStageResult, selectedBadgeId, getTotalStars, difficulty } = useGameStore();

  const [phase, setPhase] = useState<GamePhase>("intro");
  const [stats, setStats] = useState({ hits: 0, miss: 0 });
  const [newBadges, setNewBadges] = useState<string[]>([]);
  const [activeEvent, setActiveEvent] = useState<typeof RANDOM_EVENTS[0] | null>(null);
  const [activeEgg, setActiveEgg] = useState<typeof EASTER_EGGS[0] | null>(null);
  const [eggInput, setEggInput] = useState("");
  const [showCelebration, setShowCelebration] = useState(false);
  
  const worldId = params?.wid;
  const stageId = params?.sid;
  
  const world = WORLDS.find(w => w.id === worldId);
  const stage = world?.stages.find(s => s.id === stageId);
  const chapter = STORY_CHAPTERS.find(c => c.worldId === worldId);
  
  // Find mascot icon
  const badge = ALL_BADGES.find(b => b.id === selectedBadgeId) || ALL_BADGES[0];
  const mascot = badge.icon;

  useEffect(() => {
    // Start background music on entry and keep it playing
    sounds.startBackgroundMusic();

    // Random Event & Easter Egg Check
    if (phase === "intro") {
      const event = RANDOM_EVENTS.find(e => Math.random() < e.chance);
      if (event) {
        setActiveEvent(event);
      }

      const totalStars = getTotalStars();
      const egg = EASTER_EGGS.find(e => totalStars >= e.triggerMilestone && Math.random() < 0.2);
      if (egg) {
        setActiveEgg(egg);
      }
    }
  }, [getTotalStars]); // Removed phase from dependencies to prevent restart on phase change

  if (!world || !stage) return <div>Stage not found</div>;

  // Difficulty tuning
  const stageNo = parseInt(stageId?.replace("s","") || "1");

  const diff = difficulty || "beginner";
  const diffFactor = diff === "beginner" ? 1 : diff === "intermediate" ? 1.25 : 1.55;

  const platformCount = Math.round((10 + stageNo * 2) * diffFactor);
  const runGoal = Math.round((50 + stageNo * 5) * diffFactor);
  const killsGoal = Math.round((10 + stageNo * 2) * diffFactor);

  const handlePhaseComplete = (phaseStats: { hits: number, miss: number }) => {
    const newStats = { hits: stats.hits + phaseStats.hits, miss: stats.miss + phaseStats.miss };
    setStats(newStats);

    if (phase === "platform") setPhase("runner");
    else if (phase === "runner") setPhase("defender");
    else if (phase === "defender") {
      // Calculate Stars
      const total = newStats.hits + newStats.miss;
      const acc = total > 0 ? (newStats.hits / total) * 100 : 0;
      const stars = acc >= 95 ? 3 : acc >= 85 ? 2 : acc >= 70 ? 1 : 0;
      
      // Performance stats
      const wpm = Math.round(newStats.hits / 1.5); 

      const res = recordStageResult(worldId!, stageId!, stars, { wpm, accuracy: acc });
      setNewBadges(res.newBadges);
      setPhase("result");
      setShowCelebration(true);
      
      if (res.newBadges.length > 0) {
        sounds.playBadgeUnlock();
      } else if (stars >= 2) {
        sounds.playVictory();
      } else {
        sounds.playLevelUp();
      }
    }
  };

  const handleQuit = () => {
    setLocation(`/world/${worldId}`);
  };

  return (
    <div className="min-h-screen p-4 sm:p-8 flex flex-col items-center" data-world={worldId} data-stage={stageId}>
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
          <div className="glass-panel p-10 rounded-3xl text-center max-w-2xl w-full animate-in fade-in zoom-in duration-500 border-primary/40 shadow-[0_0_50px_rgba(59,130,246,0.15)]">
            <div className="text-sm font-bold text-primary uppercase tracking-[0.3em] mb-4">Quest Objective</div>
            <h1 className="text-4xl font-black text-slate-900 mb-6">{stage.name}</h1>
            
            <div className="flex items-center justify-center gap-8 mb-8">
              <div className="text-6xl animate-bounce">{mascot}</div>
              <div className="text-2xl text-slate-400 font-bold">VS</div>
              <div className="text-6xl animate-pulse">{chapter?.monsterEmoji}</div>
            </div>

            <p className="text-slate-600 italic text-xl mb-10 leading-relaxed">
              "To defeat the {chapter?.monsterName}, you must master these scripts: <span className="text-slate-900 font-bold not-italic">{stage.pool.join(' ')}</span>"
            </p>

            {activeEvent && (
              <div className="mb-8 p-4 bg-yellow-400/10 border border-yellow-400/30 rounded-2xl animate-pulse">
                <div className="text-yellow-400 font-bold flex items-center justify-center gap-2">
                  ✨ Random Event: {activeEvent.name}
                </div>
                <div className="text-xs text-yellow-200/70">{activeEvent.description}</div>
              </div>
            )}

            {activeEgg && (
              <div className="mb-8 p-6 bg-purple-500/20 border border-purple-500/50 rounded-2xl animate-pulse relative overflow-hidden group hover:scale-105 transition-transform cursor-pointer" onClick={() => setPhase("easter-egg")}>
                <div className="absolute top-0 right-0 p-2 text-xs font-black bg-purple-500 text-white rounded-bl-xl">HIDDEN QUEST</div>
                <div className="text-purple-300 font-bold flex items-center justify-center gap-2 text-lg">
                  💎 Secret Unlocked: {activeEgg.name}
                </div>
                <div className="text-sm text-purple-200/70 mt-1">A mysterious portal has appeared. Click to enter!</div>
              </div>
            )}

            <Button size="lg" className="px-12 py-8 text-2xl font-black bg-primary hover:bg-primary/80 text-primary-foreground rounded-2xl shadow-xl shadow-primary/20" onClick={() => setPhase("platform")}>
              BEGIN QUEST
            </Button>
          </div>
        )}

        {phase === "easter-egg" && activeEgg && (
          <div className="glass-panel p-10 rounded-3xl text-center max-w-2xl w-full animate-in slide-in-from-bottom-20 duration-500 border-purple-500/50 shadow-[0_0_80px_rgba(168,85,247,0.3)]">
            <div className="text-sm font-bold text-purple-400 uppercase tracking-[0.4em] mb-4">Secret Realm</div>
            <h1 className="text-4xl font-black text-white mb-4">{activeEgg.name}</h1>
            <p className="text-slate-300 mb-8 leading-relaxed">"{activeEgg.description}"</p>
            
            <div className="bg-black/40 p-8 rounded-2xl border border-white/10 mb-8">
              <div className="text-xs font-bold text-slate-500 uppercase mb-4 tracking-widest">Type the Secret Script to Claim Your Reward</div>
              <div className="text-6xl font-khmer text-white mb-6 animate-pulse select-none">
                {activeEgg.secretWord}
              </div>
              <input 
                autoFocus
                value={eggInput}
                onChange={(e) => {
                  const val = e.target.value;
                  setEggInput(val);
                  if (val === activeEgg.secretWord) {
                    sounds.playLevelUp();
                    setPhase("result");
                    setStats({ hits: 100, miss: 0 }); // Instant win for secret
                    setNewBadges([activeEgg.reward]);
                  }
                }}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-center text-3xl font-khmer text-primary focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Type here..."
              />
            </div>

            <Button variant="ghost" className="text-slate-400" onClick={() => setPhase("intro")}>
              Return to Quest
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
            difficulty={difficulty}
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
          <>
            {showCelebration && (
              <Celebration 
                type={newBadges.length > 0 ? "victory" : "confetti"} 
                intensity={newBadges.length > 0 ? "high" : "medium"}
                onComplete={() => setShowCelebration(false)}
              />
            )}
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

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-sm text-slate-400 uppercase tracking-widest">WPM</div>
                <div className="text-2xl font-mono font-bold text-primary">
                  {Math.round(stats.hits / 1.5)}
                </div>
              </div>
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
          </>
        )}
      </div>
    </div>
  );
};
