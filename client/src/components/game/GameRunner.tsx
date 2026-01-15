import React, { useEffect, useState, useRef, useCallback } from 'react';
import { findKeyForTarget, nidaFromEvent } from '@/lib/nida-map';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Keyboard } from '@/components/Keyboard';
import { CODE_TO_FINGER, FINGER } from '@/lib/fingers';

interface GameProps {
  pool: string[];
  distanceGoal: number;
  mascot: string;
  onComplete: (stats: { hits: number, miss: number }) => void;
  onQuit: () => void;
}

export const GameRunner: React.FC<GameProps> = ({ pool, distanceGoal, mascot, onComplete, onQuit }) => {
  const [target, setTarget] = useState<string>("");
  const [hits, setHits] = useState(0);
  const [miss, setMiss] = useState(0);
  const [dist, setDist] = useState(0);
  const [activeCode, setActiveCode] = useState<string | null>(null);
  const [wrongCode, setWrongCode] = useState<string | null>(null);

  const heroRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);
  const stateRef = useRef({
    y: 0,
    vy: 0,
    frames: 0,
    dist: 0,
    target: "",
    hits: 0,
    miss: 0
  });

  const pick = useCallback(() => {
    return pool[Math.floor(Math.random() * pool.length)];
  }, [pool]);

  // Init
  useEffect(() => {
    const t = pick();
    setTarget(t);
    stateRef.current.target = t;
  }, [pick]);

  // Keyboard hints
  useEffect(() => {
    if(!target) return;
    const k = findKeyForTarget(target);
    setActiveCode(k?.code || null);
  }, [target]);

  const jump = () => {
    if (stateRef.current.y === 0) {
      stateRef.current.vy = 12; // slightly higher jump
    }
  };

  // Game Loop
  useEffect(() => {
    const animate = () => {
      stateRef.current.frames++;
      
      // Physics
      stateRef.current.y = Math.max(0, stateRef.current.y + stateRef.current.vy);
      stateRef.current.vy -= 0.85; // Gravity
      if (stateRef.current.y === 0) stateRef.current.vy = Math.min(stateRef.current.vy, 0);

      // Update DOM
      if (heroRef.current) {
        heroRef.current.style.transform = `translateY(${-stateRef.current.y}px)`;
      }

      // Progress
      if (stateRef.current.frames % 12 === 0) {
        stateRef.current.dist++;
        setDist(stateRef.current.dist);
        
        if (stateRef.current.dist >= distanceGoal) {
          onComplete({ hits: stateRef.current.hits, miss: stateRef.current.miss });
          return; // Stop loop
        }
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [distanceGoal, onComplete]);

  // Input Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Shift" || e.key === "Alt" || e.key === "Control") return;

      const produced = nidaFromEvent(e);
      if (!produced) return;

      if (produced === stateRef.current.target) {
        // Hit
        stateRef.current.hits++;
        setHits(stateRef.current.hits);
        jump();
        
        // New target
        const next = pick();
        setTarget(next);
        stateRef.current.target = next;
      } else {
        // Miss
        stateRef.current.miss++;
        setMiss(stateRef.current.miss);
        setWrongCode(e.code);
        setTimeout(() => setWrongCode(null), 150);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pick]);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto gap-4">
      <div className="glass-panel p-6 rounded-3xl w-full text-center relative overflow-hidden h-[350px] flex flex-col justify-between">
        
        <div className="flex justify-between w-full items-center text-slate-400 font-mono text-sm z-10 relative">
          <span>Runner Mode</span>
          <div className="flex gap-4">
            <span className="text-white">Goal: {dist}/{distanceGoal}m</span>
            <span className="text-green-400">Hits: {hits}</span>
            <span className="text-red-400">Miss: {miss}</span>
          </div>
        </div>

        {/* Game World */}
        <div className="absolute inset-0 flex items-end pb-8 px-16">
          {/* Ground */}
          <div className="absolute bottom-0 left-0 w-full h-8 bg-white/5 border-t border-white/10" />
          
          {/* Hero */}
          <div 
            ref={heroRef}
            className="w-20 h-20 bg-primary/20 border border-primary/50 rounded-2xl flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(90,200,250,0.3)] z-10 transition-transform duration-75 ease-linear will-change-transform"
          >
            {mascot}
          </div>

          {/* Obstacle / Target Display */}
          <div className="absolute right-32 bottom-32 flex flex-col items-center animate-pulse">
            <div className="text-sm text-slate-400 mb-2 font-bold uppercase tracking-widest">Type Jump</div>
            <div className="w-32 h-32 rounded-full border-4 border-dashed border-white/30 flex items-center justify-center text-7xl font-khmer text-white bg-black/20 backdrop-blur-sm relative">
              {target}
              {activeCode && (
                <div className="absolute -bottom-12 bg-primary border-2 border-white/20 px-4 py-1.5 rounded-xl text-sm font-black text-primary-foreground shadow-[0_0_20px_rgba(90,200,250,0.4)] animate-bounce whitespace-nowrap">
                  👆 {FINGER[CODE_TO_FINGER[activeCode]]}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="w-full flex justify-center z-10">
          <Button variant="secondary" onClick={onQuit}>Quit</Button>
        </div>
      </div>

      <Keyboard activeCode={activeCode} wrongCode={wrongCode} />
    </div>
  );
};
