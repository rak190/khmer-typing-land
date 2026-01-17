import React, { useEffect, useState, useRef, useCallback } from 'react';
import { findKeyForTarget, nidaFromEvent } from '@/lib/nida-map';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useGameStore } from '@/lib/store';
import { Keyboard } from '@/components/Keyboard';
import { CODE_TO_FINGER, FINGER } from '@/lib/fingers';
import { sounds } from '@/lib/sounds';

interface GameProps {
  pool: string[];
  count: number;
  onComplete: (stats: { hits: number, miss: number }) => void;
  onQuit: () => void;
}

export const GamePlatform: React.FC<GameProps> = ({ pool, count, onComplete, onQuit }) => {
  const [target, setTarget] = useState<string>("");
  const [hits, setHits] = useState(0);
  const [miss, setMiss] = useState(0);
  const [done, setDone] = useState(0);
  const [flash, setFlash] = useState<"good" | "bad" | null>(null);
  const [activeCode, setActiveCode] = useState<string | null>(null);
  const [wrongCode, setWrongCode] = useState<string | null>(null);
  
  const [combo, setCombo] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  
  const pick = useCallback(() => {
    return pool[Math.floor(Math.random() * pool.length)];
  }, [pool]);

  // Init
  useEffect(() => {
    const t = pick();
    setTarget(t);
  }, [pick]);

  // Update keyboard hint when target changes
  useEffect(() => {
    if(!target) return;
    const k = findKeyForTarget(target);
    setActiveCode(k?.code || null);
  }, [target]);

  const showFeedback = (text: string) => {
    setFeedback(text);
    setTimeout(() => setFeedback(null), 800);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore modifier only
      if (e.key === "Shift" || e.key === "Alt" || e.key === "Control") return;

      const produced = nidaFromEvent(e);
      if (!produced) return;

      if (produced === target) {
        // Hit
        sounds.playCorrect();
        const newCombo = combo + 1;
        setCombo(newCombo);
        setHits(h => h + 1);
        setDone(d => d + 1);
        setFlash("good");
        
        if (newCombo % 5 === 0) {
          showFeedback(`${newCombo} COMBO!`);
          sounds.playLevelUp();
        } else if (newCombo > 2) {
          showFeedback("Perfect!");
        }

        setTimeout(() => setFlash(null), 180);
        
        // Next
        const nextDone = done + 1;
        if (nextDone >= count) {
          sounds.playLevelUp();
          onComplete({ hits: hits + 1, miss });
        } else {
          setTarget(pick());
        }
      } else {
        // Miss
        sounds.playWrong();
        setCombo(0);
        showFeedback("Oops!");
        setMiss(m => m + 1);
        setFlash("bad");
        setWrongCode(e.code);
        setTimeout(() => {
          setFlash(null);
          setWrongCode(null);
        }, 180);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [target, done, count, hits, miss, combo, onComplete, pick]);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto gap-4">
      <div className="glass-panel p-6 rounded-3xl w-full text-center relative overflow-hidden min-h-[350px] flex flex-col items-center justify-between">
        <div className="absolute top-0 left-0 w-full h-1 bg-white/10">
          <div 
            className="h-full bg-primary transition-all duration-300 shadow-[0_0_15px_rgba(90,200,250,0.8)]" 
            style={{ width: `${(done / count) * 100}%` }}
          />
        </div>

        <div className="flex justify-between w-full items-center text-muted-foreground font-mono text-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span>Platform Mode</span>
          </div>
          <div className="flex gap-4">
            <span className="text-accent font-bold">Hits: {hits}</span>
            <span className="text-destructive">Miss: {miss}</span>
            <span className="text-foreground">Left: {count - done}</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center relative">
          {/* Combo Display */}
          {combo > 1 && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-8 flex flex-col items-center animate-bounce">
              <span className="text-xs font-bold text-primary uppercase tracking-tighter">Combo</span>
              <span className="text-3xl font-black text-foreground italic drop-shadow-sm">{combo}</span>
            </div>
          )}

          {/* Feedback Text */}
          {feedback && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50">
              <span className="text-4xl font-black text-primary italic uppercase tracking-wider animate-[ping_0.5s_ease-out_1] drop-shadow-sm">
                {feedback}
              </span>
            </div>
          )}

           <div 
             className={cn(
               "w-48 h-48 rounded-full border-4 border-dashed border-slate-200 flex items-center justify-center text-9xl font-khmer text-foreground transition-all duration-200 relative",
               flash === "good" && "border-accent bg-accent/10 scale-110 shadow-lg",
               flash === "bad" && "border-destructive bg-destructive/10 scale-95 shadow-lg"
             )}
           >
             {target}
           </div>
        </div>

        <div className="w-full flex justify-center">
          <Button variant="secondary" onClick={onQuit}>Quit</Button>
        </div>
      </div>

      <Keyboard activeCode={activeCode} correct={flash === "good"} wrongCode={wrongCode} target={target} />
    </div>
  );
};
