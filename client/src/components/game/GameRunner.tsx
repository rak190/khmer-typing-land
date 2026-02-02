import React, { useEffect, useState, useRef, useCallback } from 'react';
import { findKeyForTarget, nidaFromEvent } from '@/lib/nida-map';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Keyboard } from '@/components/Keyboard';
import { sounds } from '@/lib/sounds';

interface GameProps {
  pool: string[];
  distanceGoal: number;
  mascot: string;
  difficulty?: "beginner" | "intermediate" | "expert";
  onComplete: (stats: { hits: number, miss: number }) => void;
  onQuit: () => void;
}

interface Obstacle {
  id: number;
  char: string;
  x: number;
  passed: boolean;
  hit: boolean;
}

export const GameRunner: React.FC<GameProps> = ({ pool, distanceGoal, mascot, difficulty = "beginner", onComplete, onQuit }) => {
  const [hits, setHits] = useState(0);
  const [miss, setMiss] = useState(0);
  const [score, setScore] = useState(0);
  const [activeCode, setActiveCode] = useState<string | null>(null);
  const [wrongCode, setWrongCode] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [currentTarget, setCurrentTarget] = useState<string>("");

  const heroRef = useRef<HTMLDivElement>(null);
  const groundRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);
  
  const baseSpeed = difficulty === "beginner" ? 3 : difficulty === "intermediate" ? 4 : 5;
  
  const stateRef = useRef({
    heroY: 0,
    heroVY: 0,
    isJumping: false,
    obstacles: [] as Obstacle[],
    nextObstacleId: 0,
    frameCount: 0,
    spawnTimer: 0,
    speed: baseSpeed,
    score: 0,
    hits: 0,
    miss: 0,
    groundOffset: 0
  });

  const pick = useCallback(() => {
    return pool[Math.floor(Math.random() * pool.length)];
  }, [pool]);

  const jump = useCallback(() => {
    if (!stateRef.current.isJumping && stateRef.current.heroY === 0) {
      stateRef.current.isJumping = true;
      stateRef.current.heroVY = 18;
      sounds.playClick();
    }
  }, []);

  const spawnObstacle = useCallback(() => {
    const char = pick();
    const obstacle: Obstacle = {
      id: stateRef.current.nextObstacleId++,
      char,
      x: 100,
      passed: false,
      hit: false
    };
    stateRef.current.obstacles.push(obstacle);
    setCurrentTarget(char);
    
    const k = findKeyForTarget(char);
    setActiveCode(k?.code || null);
  }, [pick]);

  useEffect(() => {
    spawnObstacle();
  }, []);

  useEffect(() => {
    const animate = () => {
      if (gameOver) return;
      
      stateRef.current.frameCount++;
      
      stateRef.current.heroY += stateRef.current.heroVY;
      stateRef.current.heroVY -= 1.2;
      
      if (stateRef.current.heroY <= 0) {
        stateRef.current.heroY = 0;
        stateRef.current.heroVY = 0;
        stateRef.current.isJumping = false;
      }

      if (heroRef.current) {
        heroRef.current.style.bottom = `${32 + stateRef.current.heroY}px`;
      }

      stateRef.current.groundOffset -= stateRef.current.speed;
      if (stateRef.current.groundOffset <= -40) {
        stateRef.current.groundOffset = 0;
      }

      stateRef.current.spawnTimer++;
      const spawnInterval = difficulty === "beginner" ? 90 : difficulty === "intermediate" ? 70 : 55;
      if (stateRef.current.spawnTimer >= spawnInterval && stateRef.current.obstacles.length < 3) {
        stateRef.current.spawnTimer = 0;
        spawnObstacle();
      }

      stateRef.current.obstacles = stateRef.current.obstacles.filter(obs => {
        obs.x -= stateRef.current.speed * 0.5;
        
        if (obs.x < 15 && obs.x > 5 && !obs.passed && !obs.hit) {
          if (stateRef.current.heroY < 50) {
            obs.passed = true;
            stateRef.current.miss++;
            setMiss(stateRef.current.miss);
            sounds.playWrong();
            setWrongCode("miss");
            setTimeout(() => setWrongCode(null), 200);
          }
        }
        
        return obs.x > -10;
      });

      const frontObstacle = stateRef.current.obstacles.find(o => !o.passed && !o.hit);
      if (frontObstacle) {
        setCurrentTarget(frontObstacle.char);
        const k = findKeyForTarget(frontObstacle.char);
        setActiveCode(k?.code || null);
      } else {
        setCurrentTarget("");
        setActiveCode(null);
      }

      stateRef.current.score++;
      if (stateRef.current.score % 60 === 0) {
        setScore(Math.floor(stateRef.current.score / 60));
      }

      if (Math.floor(stateRef.current.score / 60) >= distanceGoal) {
        sounds.playLevelUp();
        onComplete({ hits: stateRef.current.hits, miss: stateRef.current.miss });
        return;
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [gameOver, distanceGoal, onComplete, spawnObstacle, difficulty]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Shift" || e.key === "Alt" || e.key === "Control") return;
      if (gameOver) return;

      const produced = nidaFromEvent(e);
      if (!produced) return;

      const frontObstacle = stateRef.current.obstacles.find(o => !o.passed && !o.hit);
      
      if (frontObstacle && produced === frontObstacle.char) {
        frontObstacle.hit = true;
        stateRef.current.hits++;
        setHits(stateRef.current.hits);
        sounds.playCorrect();
        jump();
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
  }, [gameOver, jump]);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto gap-4">
      <div className="glass-panel p-6 rounded-3xl w-full text-center relative overflow-hidden h-[350px] flex flex-col justify-between">
        <div className="flex justify-between w-full items-center text-muted-foreground font-mono text-sm z-10 relative">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span>Runner Mode</span>
          </div>
          <div className="flex gap-4 items-center">
            <span className="text-foreground font-bold">HI {String(distanceGoal).padStart(5, '0')}</span>
            <span className="text-primary font-bold">{String(score).padStart(5, '0')}</span>
            <span className="text-accent">Hits: {hits}</span>
            <span className="text-destructive">Miss: {miss}</span>
          </div>
        </div>

        <div className="absolute inset-0 flex items-end overflow-hidden" style={{ background: 'linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.1) 100%)' }}>
          
          <div 
            ref={groundRef}
            className="absolute bottom-0 left-0 w-full h-8 border-t-2 border-foreground/30"
            style={{ 
              backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 38px, rgba(0,0,0,0.1) 38px, rgba(0,0,0,0.1) 40px)',
              backgroundSize: '40px 100%',
              backgroundPosition: `${stateRef.current.groundOffset}px 0`
            }}
          />
          
          <div 
            ref={heroRef}
            className={cn(
              "absolute left-16 w-16 h-16 bg-primary/20 border-2 border-primary/50 rounded-xl flex items-center justify-center text-4xl z-20 transition-none",
              stateRef.current.isJumping && "shadow-[0_0_30px_rgba(90,200,250,0.5)]"
            )}
            style={{ bottom: '32px' }}
          >
            {mascot}
          </div>

          {stateRef.current.obstacles.map(obs => (
            <div
              key={obs.id}
              className={cn(
                "absolute bottom-8 flex flex-col items-center transition-none z-10",
                obs.hit && "opacity-30 scale-75",
                obs.passed && !obs.hit && "opacity-50"
              )}
              style={{ 
                left: `${obs.x}%`,
                transform: 'translateX(-50%)'
              }}
            >
              <div className={cn(
                "w-14 h-14 rounded-lg border-2 flex items-center justify-center text-3xl font-khmer font-bold transition-all",
                obs.hit ? "border-accent/50 bg-accent/10 text-accent" : 
                obs.passed ? "border-destructive/50 bg-destructive/10 text-destructive" :
                "border-foreground/30 bg-background/80 text-foreground shadow-lg"
              )}>
                {obs.char}
              </div>
              {!obs.hit && !obs.passed && (
                <div className="text-[8px] text-muted-foreground mt-1 uppercase tracking-wider">Type to jump</div>
              )}
            </div>
          ))}

          <div className="absolute top-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
            {currentTarget && (
              <>
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Next</div>
                <div className="text-6xl font-khmer font-bold text-foreground drop-shadow-lg">
                  {currentTarget}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="w-full flex justify-center z-10">
          <Button variant="secondary" onClick={onQuit}>Quit</Button>
        </div>
      </div>

      <Keyboard activeCode={activeCode} wrongCode={wrongCode} target={currentTarget} />
    </div>
  );
};
