import React, { useEffect, useState, useRef, useCallback } from 'react';
import { findKeyForTarget, nidaFromEvent } from '@/lib/nida-map';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Keyboard } from '@/components/Keyboard';
import { CODE_TO_FINGER, FINGER } from '@/lib/fingers';
import { sounds } from '@/lib/sounds';

interface GameProps {
  pool: string[];
  distanceGoal: number;
  mascot: string;
  difficulty?: "beginner" | "intermediate" | "expert";
  onComplete: (stats: { hits: number, miss: number }) => void;
  onQuit: () => void;
}

export const GameRunner: React.FC<GameProps> = ({ pool, distanceGoal, mascot, difficulty = "beginner", onComplete, onQuit }) => {
  const [target, setTarget] = useState<string>("");
  const [hits, setHits] = useState(0);
  const [miss, setMiss] = useState(0);
  const [dist, setDist] = useState(0);
  const [activeCode, setActiveCode] = useState<string | null>(null);
  const [wrongCode, setWrongCode] = useState<string | null>(null);

  const [combo, setCombo] = useState(0);
  const [speedMult, setSpeedMult] = useState(1);

  // Progressive speed challenge: speed ramps up while the player maintains accuracy.
  // We treat combo as an "accuracy streak" (resets on any miss).
  const baseSpeedBoost = difficulty === "beginner" ? 0.08 : difficulty === "intermediate" ? 0.11 : 0.14;
  const maxSpeedBoost = difficulty === "beginner" ? 1.8 : difficulty === "intermediate" ? 2.0 : 2.2;

  const [streakSeconds, setStreakSeconds] = useState(0);
  const streakTimerRef = useRef<number | null>(null);

  const heroRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);
  const stateRef = useRef({
    y: 0,
    vy: 0,
    frames: 0,
    dist: 0,
    target: "",
    hits: 0,
    miss: 0,
    speed: 1
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
      sounds.playClick();
      stateRef.current.vy = 12 + (stateRef.current.speed - 1) * 2; // jump higher if faster
      stateRef.current.vy = Math.min(stateRef.current.vy, 18);
    }
  };

  // Progressive speed timer (counts only while streak is active)
  useEffect(() => {
    if (combo <= 0) {
      setStreakSeconds(0);
      if (streakTimerRef.current) {
        window.clearInterval(streakTimerRef.current);
        streakTimerRef.current = null;
      }
      return;
    }

    if (!streakTimerRef.current) {
      streakTimerRef.current = window.setInterval(() => {
        setStreakSeconds((s) => s + 1);
      }, 1000);
    }

    return () => {
      if (streakTimerRef.current) {
        window.clearInterval(streakTimerRef.current);
        streakTimerRef.current = null;
      }
    };
  }, [combo]);

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
        // Visual speed tilt and vibration
        const tilt = Math.min(stateRef.current.speed * 10, 25);
        const vibrate = stateRef.current.speed > 1.5 ? (Math.random() - 0.5) * 2 : 0;
        heroRef.current.style.transform += ` rotate(${tilt}deg) translateX(${vibrate}px)`;
      }

      // Parallax Background elements
      const bgElements = document.querySelectorAll('.parallax-bg');
      bgElements.forEach((el: any) => {
        const speed = parseFloat(el.dataset.speed || "1");
        const currentX = parseFloat(el.dataset.x || "0");
        const newX = (currentX - (stateRef.current.speed * speed)) % 1000;
        el.dataset.x = newX.toString();
        el.style.transform = `translateX(${newX}px)`;
      });

      // Progress based on speed
      if (stateRef.current.frames % Math.max(1, Math.floor(12 / stateRef.current.speed)) === 0) {
        stateRef.current.dist++;
        setDist(stateRef.current.dist);
        
        if (stateRef.current.dist >= distanceGoal) {
          sounds.playLevelUp();
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
        sounds.playCorrect();
        stateRef.current.hits++;
        setHits(stateRef.current.hits);
        
        // Combo & Speed logic
        const newCombo = combo + 1;
        setCombo(newCombo);

        // Ramp speed based on combo AND sustained streak time.
        // Every 5 seconds of streak adds a small bump (capped by maxSpeedBoost).
        const timeBonus = Math.floor(streakSeconds / 5) * (baseSpeedBoost * 0.5);
        const newSpeed = 1 + Math.min(newCombo * baseSpeedBoost + timeBonus, maxSpeedBoost);
        stateRef.current.speed = newSpeed;
        setSpeedMult(newSpeed);

        jump();
        
        // New target
        const next = pick();
        setTarget(next);
        stateRef.current.target = next;
      } else {
        // Miss
        sounds.playWrong();
        setCombo(0);
        setSpeedMult(1);
        stateRef.current.speed = 1;
        stateRef.current.miss++;
        setMiss(stateRef.current.miss);
        setWrongCode(e.code);
        setTimeout(() => setWrongCode(null), 150);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pick, combo]);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto gap-4">
      <div className="glass-panel p-6 rounded-3xl w-full text-center relative overflow-hidden h-[350px] flex flex-col justify-between">
        <div className="flex justify-between w-full items-center text-muted-foreground font-mono text-sm z-10 relative">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span>Runner Mode</span>
          </div>
          <div className="flex gap-4 items-center">
            <span className="text-foreground">Goal: {dist}/{distanceGoal}m</span>
            <span className="text-primary font-bold">{speedMult.toFixed(1)}x Speed</span>
            <span className="text-muted-foreground">Streak: {streakSeconds}s</span>
            <span className="text-accent font-bold">Hits: {hits}</span>
          </div>
        </div>

        {/* Combo Popups */}
        {combo > 5 && (
          <div className="absolute top-12 left-1/2 -translate-x-1/2 z-20 pointer-events-none animate-bounce">
             <span className="text-3xl font-black italic text-primary drop-shadow-glow">HYPER SPEED!</span>
          </div>
        )}

        {/* Game World */}
        <div className="absolute inset-0 flex items-end pb-8 px-16 overflow-hidden">
          {/* Background Mountains (Parallax) */}
          <div 
            className="parallax-bg absolute bottom-12 left-0 w-[2000px] h-32 opacity-10 pointer-events-none" 
            data-speed="0.2"
            data-x="0"
            style={{ backgroundImage: 'radial-gradient(circle at 50% 100%, #1A237E 0%, transparent 70%)', backgroundSize: '400px 200px', backgroundRepeat: 'repeat-x' }}
          />

          {/* Ground with moving texture */}
          <div className="absolute bottom-0 left-0 w-full h-8 bg-white/5 border-t border-white/10 overflow-hidden">
             <div 
               className="absolute inset-0 w-[200%] h-full opacity-20"
               style={{ 
                 backgroundImage: 'linear-gradient(90deg, transparent 50%, white 50%)',
                 backgroundSize: '40px 100%',
                 animation: `slide ${0.5 / speedMult}s linear infinite`
               }}
             />
          </div>
          
          {/* Hero */}
          <div 
            ref={heroRef}
            className={cn(
              "w-20 h-20 bg-primary/20 border border-primary/50 rounded-2xl flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(90,200,250,0.3)] z-10 transition-transform duration-75 ease-linear will-change-transform",
              speedMult > 1.5 && "shadow-[0_0_50px_rgba(90,200,250,0.6)] border-white/50"
            )}
          >
            <div className="relative">
              {mascot}
              {speedMult > 2 && (
                <div className="absolute inset-0 animate-ping opacity-50 bg-primary rounded-full" />
              )}
            </div>
          </div>

          {/* Obstacle / Target Display */}
          <div className="absolute right-32 bottom-32 flex flex-col items-center">
            <div className="text-[10px] text-slate-500 mb-2 font-bold uppercase tracking-[0.3em] opacity-80">Type to Jump</div>
            <div className={cn(
              "w-32 h-32 rounded-full border-4 border-dashed border-slate-400 flex items-center justify-center text-7xl font-khmer text-slate-900 bg-white/40 backdrop-blur-md shadow-lg relative transition-all",
              speedMult > 2 && "border-primary scale-110 shadow-primary/20"
            )}>
              {target}
            </div>
          </div>
        </div>

        <div className="w-full flex justify-center z-10">
          <Button variant="secondary" onClick={onQuit}>Quit</Button>
        </div>
      </div>

      <Keyboard activeCode={activeCode} wrongCode={wrongCode} target={target} />
    </div>
  );
};
