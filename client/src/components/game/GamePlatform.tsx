import React, { useEffect, useState, useRef, useCallback } from 'react';
import { findKeyForTarget, nidaFromEvent } from '@/lib/nida-map';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useGameStore } from '@/lib/store';
import { Keyboard } from '@/components/Keyboard';
import { CODE_TO_FINGER, FINGER } from '@/lib/fingers';

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore modifier only
      if (e.key === "Shift" || e.key === "Alt" || e.key === "Control") return;

      const produced = nidaFromEvent(e);
      if (!produced) return;

      if (produced === target) {
        // Hit
        setHits(h => h + 1);
        setDone(d => d + 1);
        setFlash("good");
        setTimeout(() => setFlash(null), 180);
        
        // Next
        const nextDone = done + 1;
        if (nextDone >= count) {
          onComplete({ hits: hits + 1, miss });
        } else {
          setTarget(pick());
        }
      } else {
        // Miss
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
  }, [target, done, count, hits, miss, onComplete, pick]);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto gap-4">
      <div className="glass-panel p-6 rounded-3xl w-full text-center relative overflow-hidden min-h-[350px] flex flex-col items-center justify-between">
        <div className="absolute top-0 left-0 w-full h-1 bg-white/10">
          <div 
            className="h-full bg-primary transition-all duration-300" 
            style={{ width: `${(done / count) * 100}%` }}
          />
        </div>

        <div className="flex justify-between w-full items-center text-slate-400 font-mono text-sm">
          <span>Platform Mode</span>
          <div className="flex gap-4">
            <span className="text-green-400">Hits: {hits}</span>
            <span className="text-red-400">Miss: {miss}</span>
            <span className="text-white">Left: {count - done}</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center relative">
           <div 
             className={cn(
               "w-48 h-48 rounded-full border-4 border-dashed border-white/20 flex items-center justify-center text-9xl font-khmer text-white transition-all duration-200 relative",
               flash === "good" && "border-accent bg-accent/20 scale-110 shadow-[0_0_50px_rgba(48,209,88,0.5)]",
               flash === "bad" && "border-destructive bg-destructive/20 scale-95 shadow-[0_0_50px_rgba(255,69,58,0.5)]"
             )}
           >
             {target}
             {activeCode && (
               <div className="absolute -bottom-16 bg-primary border-2 border-white/20 px-6 py-2 rounded-2xl text-lg font-black text-primary-foreground shadow-[0_0_30px_rgba(90,200,250,0.5)] animate-bounce whitespace-nowrap z-20">
                 👆 {FINGER[CODE_TO_FINGER[activeCode]] || "any finger"}
               </div>
             )}
           </div>
        </div>

        <div className="w-full flex justify-center">
          <Button variant="secondary" onClick={onQuit}>Quit</Button>
        </div>
      </div>

      <Keyboard activeCode={activeCode} correct={flash === "good"} wrongCode={wrongCode} />
    </div>
  );
};
