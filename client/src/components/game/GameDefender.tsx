import React, { useEffect, useState, useRef, useCallback } from 'react';
import { findKeyForTarget, nidaFromEvent } from '@/lib/nida-map';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Keyboard } from '@/components/Keyboard';
import { CODE_TO_FINGER, FINGER } from '@/lib/fingers';
import { sounds } from '@/lib/sounds';

interface GameProps {
  pool: string[];
  killsGoal: number;
  mascot: string;
  onComplete: (stats: { hits: number, miss: number }) => void;
  onQuit: () => void;
}

export const GameDefender: React.FC<GameProps> = ({ pool, killsGoal, mascot, onComplete, onQuit }) => {
  const [hits, setHits] = useState(0);
  const [miss, setMiss] = useState(0);
  const [hp, setHp] = useState(3);
  const [kills, setKills] = useState(0);
  const [activeCode, setActiveCode] = useState<string | null>(null);
  const [wrongCode, setWrongCode] = useState<string | null>(null);

  const requestRef = useRef<number>(0);
  const boxRef = useRef<HTMLDivElement>(null);
  // We keep track of the enemy purely in ref to avoid re-renders during animation, 
  // but we mirror the target to state for the Keyboard component.
  const stateRef = useRef({
    enemy: { x: 0, target: "", active: false },
    hp: 3,
    kills: 0,
    hits: 0,
    miss: 0
  });

  const [enemyVisual, setEnemyVisual] = useState<{x: number, target: string} | null>(null);

  const pick = useCallback(() => {
    return pool[Math.floor(Math.random() * pool.length)];
  }, [pool]);

  const spawnEnemy = useCallback(() => {
    const t = pick();
    stateRef.current.enemy = { x: 0, target: t, active: true };
    setEnemyVisual({ x: 0, target: t });
    
    // Keyboard hint
    const k = findKeyForTarget(t);
    setActiveCode(k?.code || null);
  }, [pick]);

  // Init
  useEffect(() => {
    spawnEnemy();
  }, [spawnEnemy]);

  // Loop
  useEffect(() => {
    const animate = () => {
      if (!stateRef.current.enemy.active) {
         requestRef.current = requestAnimationFrame(animate);
         return;
      }

      // Move enemy
      stateRef.current.enemy.x += 1.5; // Speed
      
      // Update visual state (React state update will trigger render)
      // For smoother performance we could use direct DOM, but React state at 60fps might be jittery.
      // Let's use direct DOM manipulation for the enemy element if possible, 
      // but simpler to just set state for prototype. 
      // Actually, updating React state 60 times a second is bad.
      // I'll use a Ref for the enemy DOM element.
      
      const boxWidth = boxRef.current?.clientWidth || 800;
      const limit = boxWidth - 180; // Hit zone

      if (stateRef.current.enemy.x >= limit) {
        // Damage
        sounds.playWrong();
        stateRef.current.hp--;
        setHp(stateRef.current.hp);
        stateRef.current.enemy.active = false;
        setEnemyVisual(null);

        if (stateRef.current.hp <= 0) {
          onComplete({ hits: stateRef.current.hits, miss: stateRef.current.miss });
          return;
        } else {
          spawnEnemy();
        }
      } else {
         // Only update visual ref if we are using it, 
         // but here I'm using state for the enemy visual.
         // Let's optimize: Update a DOM element directly.
         const el = document.getElementById("enemy-sprite");
         if (el) {
           el.style.transform = `translateX(${-stateRef.current.enemy.x}px)`;
         }
      }

      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [spawnEnemy, onComplete]);

  // Input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Shift" || e.key === "Alt" || e.key === "Control") return;

      const produced = nidaFromEvent(e);
      if (!produced) return;

      if (stateRef.current.enemy.active && produced === stateRef.current.enemy.target) {
        // Kill
        sounds.playCorrect();
        stateRef.current.hits++;
        setHits(stateRef.current.hits);
        stateRef.current.kills++;
        setKills(stateRef.current.kills);
        
        stateRef.current.enemy.active = false;
        setEnemyVisual(null); // Hide

        if (stateRef.current.kills >= killsGoal) {
          sounds.playLevelUp();
          onComplete({ hits: stateRef.current.hits, miss: stateRef.current.miss });
        } else {
          spawnEnemy();
        }
      } else {
        sounds.playWrong();
        stateRef.current.miss++;
        setMiss(stateRef.current.miss);
        setWrongCode(e.code);
        setTimeout(() => setWrongCode(null), 150);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [spawnEnemy, killsGoal, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto gap-4">
      <div className="glass-panel p-6 rounded-3xl w-full text-center relative overflow-hidden h-[350px] flex flex-col justify-between" ref={boxRef}>
        
        <div className="flex justify-between w-full items-center text-slate-400 font-mono text-sm z-10 relative">
          <span>Defender Mode</span>
          <div className="flex gap-4">
             <span className="text-red-500 font-bold">HP: {"❤️".repeat(hp)}</span>
            <span className="text-white">Kills: {kills}/{killsGoal}</span>
          </div>
        </div>

        <div className="absolute inset-0 flex items-center px-16">
          {/* Hero */}
          <div className="absolute left-16 bottom-16 flex flex-col items-center gap-2 z-10">
            <div className="w-20 h-20 bg-primary/20 border-2 border-primary/50 rounded-2xl flex items-center justify-center text-5xl shadow-[0_0_30px_rgba(90,200,250,0.3)] transition-transform hover:scale-110 relative">
              <div className="absolute -inset-2 border-2 border-primary/20 rounded-3xl animate-[spin_10s_linear_infinite]" />
              {mascot}
            </div>
            <div className="px-3 py-1 rounded-full bg-black/40 border border-white/10 text-[10px] font-bold text-slate-400 uppercase tracking-widest backdrop-blur-sm">
              Guardian
            </div>
          </div>

          {/* Enemy */}
          {enemyVisual && (
            <div 
              id="enemy-sprite"
              className="absolute right-[-100px] bottom-16 flex flex-col items-center gap-1 z-10 will-change-transform"
              title={`Type: ${enemyVisual.target}`}
            >
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-5xl font-khmer text-white font-bold drop-shadow-md flex flex-col items-center gap-1">
                {enemyVisual.target}
                {activeCode && (
                  <span className="text-xs bg-primary border-2 border-white/20 px-3 py-1 rounded-xl text-primary-foreground font-black shadow-lg animate-bounce whitespace-nowrap">
                    👆 {FINGER[CODE_TO_FINGER[activeCode]]}
                  </span>
                )}
              </div>
              <div className="w-20 h-20 bg-red-500/20 border border-red-400/50 rounded-2xl flex items-center justify-center text-3xl shadow-[0_0_30px_rgba(239,68,68,0.3)]">
                 👾
              </div>
            </div>
          )}
        </div>

        <div className="w-full flex justify-center z-10">
          <Button variant="secondary" onClick={onQuit}>Quit</Button>
        </div>
      </div>

      <Keyboard activeCode={activeCode} wrongCode={wrongCode} target={enemyVisual?.target} />
    </div>
  );
};
