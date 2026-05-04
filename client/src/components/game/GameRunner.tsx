import React, { useEffect, useState, useRef, useCallback } from 'react';
import { findKeyForTarget, nidaFromEvent } from '@/lib/nida-map';
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

export const GameRunner: React.FC<GameProps> = ({ pool, distanceGoal, mascot, difficulty = "beginner", onComplete }) => {
  const [hits, setHits] = useState(0);
  const [miss, setMiss] = useState(0);
  const [score, setScore] = useState(0);
  const [activeCode, setActiveCode] = useState<string | null>(null);
  const [wrongCode, setWrongCode] = useState<string | null>(null);
  const [currentTarget, setCurrentTarget] = useState<string>("");
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [heroY, setHeroY] = useState(0);
  const [isJumping, setIsJumping] = useState(false);

  const heroRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  
  const baseSpeed = difficulty === "beginner" ? 1.2 : difficulty === "intermediate" ? 1.6 : 2.0;
  const spawnInterval = difficulty === "beginner" ? 2500 : difficulty === "intermediate" ? 2000 : 1600;
  
  const stateRef = useRef({
    heroY: 0,
    heroVY: 0,
    isJumping: false,
    obstacles: [] as Obstacle[],
    nextObstacleId: 0,
    lastSpawnTime: 0,
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
      stateRef.current.heroVY = 12;
      setIsJumping(true);
      sounds.playClick();
    }
  }, []);

  const spawnObstacle = useCallback(() => {
    const char = pick();
    const obstacle: Obstacle = {
      id: stateRef.current.nextObstacleId++,
      char,
      x: 95,
      passed: false,
      hit: false
    };
    stateRef.current.obstacles.push(obstacle);
    stateRef.current.lastSpawnTime = performance.now();
  }, [pick]);

  useEffect(() => {
    spawnObstacle();
    stateRef.current.lastSpawnTime = performance.now();
  }, []);

  useEffect(() => {
    let lastFrame = performance.now();
    
    const animate = (currentTime: number) => {
      const deltaTime = Math.min((currentTime - lastFrame) / 16.67, 2);
      lastFrame = currentTime;
      
      stateRef.current.heroY += stateRef.current.heroVY * deltaTime;
      stateRef.current.heroVY -= 0.6 * deltaTime;
      
      if (stateRef.current.heroY <= 0) {
        stateRef.current.heroY = 0;
        stateRef.current.heroVY = 0;
        if (stateRef.current.isJumping) {
          stateRef.current.isJumping = false;
          setIsJumping(false);
        }
      }
      setHeroY(stateRef.current.heroY);

      stateRef.current.groundOffset -= stateRef.current.speed * deltaTime;
      if (stateRef.current.groundOffset <= -40) {
        stateRef.current.groundOffset += 40;
      }

      const timeSinceLastSpawn = currentTime - stateRef.current.lastSpawnTime;
      if (timeSinceLastSpawn >= spawnInterval && stateRef.current.obstacles.filter(o => !o.passed && !o.hit).length < 2) {
        spawnObstacle();
      }

      let needsUpdate = false;
      stateRef.current.obstacles = stateRef.current.obstacles.filter(obs => {
        const prevX = obs.x;
        obs.x -= stateRef.current.speed * 0.4 * deltaTime;
        
        if (obs.x !== prevX) needsUpdate = true;
        
        if (obs.x < 18 && obs.x > 8 && !obs.passed && !obs.hit) {
          if (stateRef.current.heroY < 40) {
            obs.passed = true;
            stateRef.current.miss++;
            setMiss(stateRef.current.miss);
            sounds.playWrong();
            setWrongCode("miss");
            setTimeout(() => setWrongCode(null), 300);
            needsUpdate = true;
          }
        }
        
        return obs.x > -15;
      });

      if (needsUpdate) {
        setObstacles([...stateRef.current.obstacles]);
      }

      const frontObstacle = stateRef.current.obstacles.find(o => !o.passed && !o.hit);
      if (frontObstacle) {
        setCurrentTarget(frontObstacle.char);
        const k = findKeyForTarget(frontObstacle.char);
        setActiveCode(k?.code || null);
      } else {
        setCurrentTarget("");
        setActiveCode(null);
      }

      stateRef.current.score += deltaTime * 0.5;
      const newScore = Math.floor(stateRef.current.score);
      if (newScore !== score) {
        setScore(newScore);
      }

      if (stateRef.current.hits >= distanceGoal) {
        sounds.playLevelUp();
        onComplete({ hits: stateRef.current.hits, miss: stateRef.current.miss });
        return;
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [distanceGoal, onComplete, spawnObstacle, spawnInterval]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Shift" || e.key === "Alt" || e.key === "Control") return;

      const produced = nidaFromEvent(e);
      if (!produced) return;

      const frontObstacle = stateRef.current.obstacles.find(o => !o.passed && !o.hit);
      
      if (frontObstacle && produced === frontObstacle.char) {
        frontObstacle.hit = true;
        stateRef.current.hits++;
        setHits(stateRef.current.hits);
        setObstacles([...stateRef.current.obstacles]);
        sounds.playCorrect();
        jump();
      } else {
        sounds.playWrong();
        stateRef.current.miss++;
        setMiss(stateRef.current.miss);
        setWrongCode(e.code);
        setTimeout(() => setWrongCode(null), 200);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [jump]);

  return (
    <div className="flex w-full max-w-[1000px] flex-col items-center justify-center gap-2 mx-auto">
      <div className={cn(
        "glass-panel relative flex h-[clamp(240px,36vh,310px)] w-full flex-col justify-between overflow-hidden rounded-3xl p-4 text-center",
        wrongCode && "animate-shake"
      )}>
        {wrongCode && (
          <div className="pointer-events-none absolute inset-0 z-40 bg-destructive/35 animate-wrong-screen-flash" />
        )}

        <div className="flex justify-between w-full items-center text-muted-foreground font-mono text-sm z-10 relative">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span>របៀបរត់</span>
          </div>
          <div className="flex gap-6 items-center">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-muted-foreground uppercase">គោលដៅ</span>
              <span className="text-foreground font-bold">{hits} / {distanceGoal}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-muted-foreground uppercase">ពិន្ទុ</span>
              <span className="text-primary font-bold">{String(score).padStart(5, '0')}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-accent uppercase">ត្រូវ</span>
              <span className="text-accent font-bold">{hits}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-destructive uppercase">ខុស</span>
              <span className="text-destructive font-bold">{miss}</span>
            </div>
          </div>
        </div>

        <div className="absolute left-1/2 top-14 z-20 flex -translate-x-1/2 flex-col items-center gap-1 sm:top-16">
          {currentTarget && (
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-dashed border-primary/50 bg-primary/10 backdrop-blur-sm sm:h-24 sm:w-24">
              <span className="font-khmer text-5xl font-bold text-foreground drop-shadow-lg sm:text-6xl">
                {currentTarget}
              </span>
            </div>
          )}
        </div>

        <div className="absolute inset-x-0 bottom-0 h-36 overflow-hidden sm:h-40">
          <div 
            className="absolute bottom-0 left-0 w-full h-10 border-t-2 border-foreground/20 bg-gradient-to-t from-foreground/5 to-transparent"
            style={{ 
              backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 38px, rgba(128,128,128,0.1) 38px, rgba(128,128,128,0.1) 40px)',
              backgroundPosition: `${stateRef.current.groundOffset}px 0`
            }}
          />
          
          <div 
            ref={heroRef}
            className={cn(
              "absolute left-16 z-20 flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-primary bg-primary/20 text-4xl transition-shadow duration-200 sm:h-20 sm:w-20 sm:text-5xl",
              isJumping && "shadow-[0_0_40px_rgba(90,200,250,0.6)] border-white"
            )}
            style={{ 
              bottom: `${40 + heroY}px`,
              transition: 'box-shadow 0.2s'
            }}
          >
            <div className={cn("transition-transform duration-100", isJumping && "scale-110")}>
              {mascot}
            </div>
          </div>

          {obstacles.map(obs => (
            <div
              key={obs.id}
              className={cn(
                "absolute flex flex-col items-center z-10 transition-opacity duration-200",
                obs.hit && "opacity-20",
                obs.passed && !obs.hit && "opacity-40"
              )}
              style={{ 
                left: `${obs.x}%`,
                bottom: '40px',
                transform: 'translateX(-50%)'
              }}
            >
              <div className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl border-3 font-khmer text-3xl font-bold transition-all duration-200 sm:h-14 sm:w-14 sm:text-4xl",
                obs.hit ? "border-accent bg-accent/20 text-accent scale-90" : 
                obs.passed ? "border-destructive bg-destructive/20 text-destructive animate-shake" :
                "border-orange-400 bg-orange-400/20 text-foreground shadow-lg shadow-orange-400/20",
                wrongCode === obs.char && "border-destructive bg-destructive/10 text-destructive animate-shake"
              )}>
                {obs.char}
              </div>
            </div>
          ))}

          <div 
            className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"
            style={{
              animation: 'pulse 2s ease-in-out infinite'
            }}
          />
        </div>

      </div>

      <Keyboard activeCode={activeCode} wrongCode={wrongCode} target={currentTarget} compact />
    </div>
  );
};
