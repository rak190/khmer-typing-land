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

  const [combo, setCombo] = useState(0);
  const [explosion, setExplosion] = useState<{x: number, y: number, color: string} | null>(null);
  const [shield, setShield] = useState(0); // 0 to 100

  const requestRef = useRef<number>(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const [powerUp, setPowerUp] = useState<string | null>(null);

  const stateRef = useRef({
    enemy: { x: 0, target: "", active: false, isBoss: false },
    hp: 3,
    kills: 0,
    hits: 0,
    miss: 0,
    shield: 0
  });

  const [enemyVisual, setEnemyVisual] = useState<{x: number, target: string, isBoss: boolean} | null>(null);

  const pick = useCallback(() => {
    return pool[Math.floor(Math.random() * pool.length)];
  }, [pool]);

  const spawnEnemy = useCallback(() => {
    const isBoss = stateRef.current.kills > 0 && stateRef.current.kills % 5 === 0;
    const t = isBoss ? pick() + pick() : pick(); // Bosses have double the text
    stateRef.current.enemy = { x: 0, target: t, active: true, isBoss };
    setEnemyVisual({ x: 0, target: t, isBoss });
    
    // Keyboard hint
    const k = findKeyForTarget(t[0]); // Hint first char
    setActiveCode(k?.code || null);
  }, [pick]);

  // Init
  useEffect(() => {
    spawnEnemy();
  }, [spawnEnemy]);

  const triggerExplosion = (x: number, color = "orange") => {
    setExplosion({ x, y: 16, color });
    setTimeout(() => setExplosion(null), 400);
  };

  const showPowerUp = (text: string) => {
    setPowerUp(text);
    setTimeout(() => setPowerUp(null), 1000);
  };

  // Loop
  useEffect(() => {
    const animate = () => {
      if (!stateRef.current.enemy.active) {
         requestRef.current = requestAnimationFrame(animate);
         return;
      }

      // Move enemy
      const speedBase = stateRef.current.enemy.isBoss ? 0.8 : 1.5;
      stateRef.current.enemy.x += speedBase + (stateRef.current.kills * 0.1); 
      
      const boxWidth = boxRef.current?.clientWidth || 800;
      const limit = boxWidth - 180;

      if (stateRef.current.enemy.x >= limit) {
        // Damage
        if (stateRef.current.shield > 0) {
          stateRef.current.shield = Math.max(0, stateRef.current.shield - 50);
          setShield(stateRef.current.shield);
          showPowerUp("SHIELD BLOCK!");
          triggerExplosion(limit, "cyan");
        } else {
          sounds.playWrong();
          setCombo(0);
          stateRef.current.hp--;
          setHp(stateRef.current.hp);
        }
        
        stateRef.current.enemy.active = false;
        setEnemyVisual(null);

        // Shake effect
        if (boxRef.current) {
          boxRef.current.classList.add('animate-shake');
          setTimeout(() => boxRef.current?.classList.remove('animate-shake'), 400);
        }

        if (stateRef.current.hp <= 0) {
          onComplete({ hits: stateRef.current.hits, miss: stateRef.current.miss });
          return;
        } else {
          spawnEnemy();
        }
      } else {
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

      if (stateRef.current.enemy.active) {
        const target = stateRef.current.enemy.target;
        if (produced === target[0]) {
          // Progress on target
          if (target.length > 1) {
            stateRef.current.enemy.target = target.substring(1);
            setEnemyVisual(v => v ? { ...v, target: target.substring(1) } : null);
            sounds.playClick();
            
            // Update keyboard hint for next char
            const k = findKeyForTarget(target[1]);
            setActiveCode(k?.code || null);
          } else {
            // Kill
            sounds.playCorrect();
            
            const newCombo = combo + 1;
            setCombo(newCombo);
            
            triggerExplosion(stateRef.current.enemy.x, stateRef.current.enemy.isBoss ? "purple" : "orange");
            
            stateRef.current.hits++;
            setHits(stateRef.current.hits);
            stateRef.current.kills++;
            setKills(stateRef.current.kills);

            // Power up chance
            if (newCombo > 0 && newCombo % 5 === 0) {
              stateRef.current.shield = 100;
              setShield(100);
              showPowerUp("SHIELD ACTIVATED!");
              sounds.playLevelUp();
            }
            
            stateRef.current.enemy.active = false;
            setEnemyVisual(null);

            if (stateRef.current.kills >= killsGoal) {
              sounds.playLevelUp();
              onComplete({ hits: stateRef.current.hits, miss: stateRef.current.miss });
            } else {
              spawnEnemy();
            }
          }
        } else {
          sounds.playWrong();
          setCombo(0);
          stateRef.current.miss++;
          setMiss(stateRef.current.miss);
          setWrongCode(e.code);
          setTimeout(() => setWrongCode(null), 150);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [spawnEnemy, killsGoal, onComplete, combo, pick]);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto gap-4">
      <div className="glass-panel p-6 rounded-3xl w-full text-center relative overflow-hidden h-[350px] flex flex-col justify-between transition-transform duration-300" ref={boxRef}>
        
        <div className="flex justify-between w-full items-center text-muted-foreground font-mono text-sm z-10 relative">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span>Defender Mode</span>
          </div>
          <div className="flex gap-4 items-center">
             <div className="flex flex-col items-end">
               <span className="text-[10px] uppercase text-muted-foreground font-bold">Shield</span>
               <div className="w-24 h-1.5 bg-secondary rounded-full overflow-hidden border border-border">
                 <div 
                   className="h-full bg-cyan-400 shadow-sm transition-all duration-300" 
                   style={{ width: `${shield}%` }}
                 />
               </div>
             </div>
             <span className="text-destructive font-black tracking-tighter">HP: {"❤️".repeat(hp)}</span>
            <span className="text-foreground">Kills: {kills}/{killsGoal}</span>
            {combo > 2 && <span className="text-primary font-bold animate-pulse">{combo}x Combo!</span>}
          </div>
        </div>

        <div className="absolute inset-0 flex items-center px-16">
          {/* Power Up Alert */}
          {powerUp && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 animate-bounce">
              <span className="text-4xl font-black text-white italic uppercase tracking-wider drop-shadow-[0_0_20px_rgba(90,200,250,0.8)]">
                {powerUp}
              </span>
            </div>
          )}

          {/* Hero */}
          <div className="absolute left-16 bottom-16 flex flex-col items-center gap-2 z-10">
            <div className={cn(
              "w-20 h-20 bg-primary/20 border-2 border-primary/50 rounded-2xl flex items-center justify-center text-5xl shadow-[0_0_30_rgba(90,200,250,0.3)] transition-all relative",
              combo > 5 && "border-white shadow-[0_0_50px_rgba(255,255,255,0.4)] scale-110",
              shield > 0 && "ring-4 ring-cyan-400/50"
            )}>
              <div className="absolute -inset-2 border-2 border-primary/20 rounded-3xl animate-[spin_10s_linear_infinite]" />
              {shield > 0 && (
                <div className="absolute inset-0 bg-cyan-400/20 rounded-2xl animate-pulse" />
              )}
              {mascot}
            </div>
            <div className="px-3 py-1 rounded-full bg-black/40 border border-white/10 text-[10px] font-bold text-slate-400 uppercase tracking-widest backdrop-blur-sm">
              Guardian
            </div>
          </div>

          {/* Explosion Effect */}
          {explosion && (
             <div 
               className={cn(
                 "absolute right-[-100px] bottom-16 w-24 h-24 rounded-full animate-ping opacity-50 z-20",
                 explosion.color === "purple" ? "bg-purple-500" : explosion.color === "cyan" ? "bg-cyan-500" : "bg-orange-500"
               )}
               style={{ transform: `translateX(${-explosion.x}px)` }}
             />
          )}

          {/* Enemy */}
          {enemyVisual && (
            <div 
              id="enemy-sprite"
              className="absolute right-[-100px] bottom-16 flex flex-col items-center gap-1 z-10 will-change-transform"
              title={`Type: ${enemyVisual.target}`}
            >
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 flex flex-col items-center">
                <div className="text-5xl font-khmer text-foreground font-bold drop-shadow-sm flex items-center gap-1 bg-white/60 px-4 py-2 rounded-xl border border-border backdrop-blur-sm">
                  {enemyVisual.target}
                </div>
                {enemyVisual.isBoss && (
                  <div className="text-[10px] font-black uppercase text-purple-600 tracking-tighter mt-1 animate-pulse">Boss Detected</div>
                )}
              </div>
              <div className={cn(
                "w-20 h-20 bg-red-500/20 border border-red-400/50 rounded-2xl flex items-center justify-center text-3xl shadow-[0_0_30px_rgba(239,68,68,0.3)] relative overflow-hidden",
                stateRef.current.enemy.x > 500 && "animate-pulse border-red-500 scale-105",
                enemyVisual.isBoss && "border-purple-500 w-28 h-28 text-5xl bg-purple-900/20"
              )}>
                 {enemyVisual.isBoss ? "👹" : "👾"}
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
