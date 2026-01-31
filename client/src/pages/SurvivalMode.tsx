import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Heart, Skull, Timer, Trophy, RotateCcw, Zap } from "lucide-react";

import { HUD } from "@/components/HUD";
import { Button } from "@/components/ui/button";
import { Keyboard } from "@/components/Keyboard";
import { useGameStore } from "@/lib/store";
import { buildWorlds } from "@/lib/curriculum";
import { sounds } from "@/lib/sounds";
import { Celebration } from "@/components/Celebration";
import { cn } from "@/lib/utils";

const WORLDS = buildWorlds();

type Difficulty = "beginner" | "intermediate" | "expert";
type Phase = "ready" | "playing" | "gameover";

function pickPoolForDifficulty(diff: Difficulty) {
  if (diff === "beginner") return WORLDS[0]?.stages[0]?.pool || ["ក", "ខ", "គ", " "];
  if (diff === "intermediate") return WORLDS[1]?.stages[4]?.pool || ["ក", "ខ", "គ", "ដ", "ត", "ប", " "];
  return WORLDS[8]?.stages[8]?.pool || ["ក", "ខ", "គ", "ដ", "ត", "ប", " ", "។"];
}

export const SurvivalMode: React.FC = () => {
  const { difficulty, recordStageResult } = useGameStore();
  const diff: Difficulty = (difficulty || "beginner") as Difficulty;
  const pool = useMemo(() => pickPoolForDifficulty(diff), [diff]);

  const [phase, setPhase] = useState<Phase>("ready");
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [level, setLevel] = useState(1);
  const [target, setTarget] = useState<string>("");
  const [typed, setTyped] = useState("");
  const [timeLimit, setTimeLimit] = useState(5000);
  const [timeLeft, setTimeLeft] = useState(5000);
  const [showCelebration, setShowCelebration] = useState(false);
  const [screenFlash, setScreenFlash] = useState<"damage" | "heal" | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const pickNextTarget = () => {
    const next = pool[Math.floor(Math.random() * pool.length)] || "ក";
    setTarget(next);
    setTyped("");
    startTimeRef.current = Date.now();
    setTimeLeft(timeLimit);
  };

  useEffect(() => {
    if (phase === "playing" && !target) {
      pickNextTarget();
    }
  }, [phase, target, pool]);

  useEffect(() => {
    if (phase !== "playing") return;

    timerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, timeLimit - elapsed);
      setTimeLeft(remaining);

      if (remaining <= 0) {
        handleMiss();
      }
    }, 50);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [phase, target, timeLimit]);

  const handleMiss = () => {
    sounds.playWrong();
    setScreenFlash("damage");
    setTimeout(() => setScreenFlash(null), 300);
    
    const newLives = lives - 1;
    setLives(newLives);
    setStreak(0);

    if (newLives <= 0) {
      setPhase("gameover");
      sounds.playComboBreak();
    } else {
      pickNextTarget();
    }
  };

  const handleInputChange = (value: string) => {
    if (phase !== "playing") return;
    setTyped(value);

    const lastChar = value.slice(-1);
    if (!lastChar) return;

    if (lastChar === target) {
      sounds.playCorrect();
      const newStreak = streak + 1;
      setStreak(newStreak);
      setMaxStreak(Math.max(maxStreak, newStreak));
      
      const levelBonus = level * 10;
      const streakBonus = Math.floor(newStreak / 5) * 5;
      setScore(score + 10 + levelBonus + streakBonus);

      if (newStreak % 10 === 0) {
        sounds.playLevelUp();
        setLevel(level + 1);
        setTimeLimit(Math.max(1500, timeLimit - 300));
        
        if (lives < 5) {
          setLives(lives + 1);
          setScreenFlash("heal");
          setTimeout(() => setScreenFlash(null), 300);
        }
      }

      pickNextTarget();
    } else {
      handleMiss();
    }
  };

  const startGame = () => {
    setPhase("playing");
    setLives(3);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setLevel(1);
    setTimeLimit(5000);
    setTarget("");
    setTyped("");
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const resetGame = () => {
    setPhase("ready");
    setLives(3);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setLevel(1);
    setTimeLimit(5000);
    setTarget("");
    setTyped("");
    setShowCelebration(false);
  };

  useEffect(() => {
    if (phase === "gameover") {
      setShowCelebration(true);
      const stars = score >= 500 ? 3 : score >= 200 ? 2 : score >= 50 ? 1 : 0;
      const wpm = Math.round(score / 10);
      const accuracy = maxStreak > 0 ? Math.min(100, 50 + maxStreak * 5) : 0;
      recordStageResult("survival", `s${level}`, stars, { wpm, accuracy });
    }
  }, [phase]);

  const timePercent = (timeLeft / timeLimit) * 100;

  return (
    <div className={cn(
      "min-h-screen bg-background pb-20 pt-20 transition-colors",
      screenFlash === "damage" && "animate-wrong-flash",
      screenFlash === "heal" && "animate-correct-flash"
    )}>
      <HUD />
      
      {showCelebration && phase === "gameover" && score >= 100 && (
        <Celebration 
          type="stars" 
          intensity={score >= 300 ? "high" : "medium"}
          onComplete={() => setShowCelebration(false)}
        />
      )}

      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/home">
            <Button variant="ghost" size="icon" data-testid="button-back-home">
              <ArrowLeft />
            </Button>
          </Link>
          <div className="flex flex-col">
            <h1 className="text-4xl font-black font-display text-foreground" data-testid="text-survival-title">
              របៀបរស់រានមានជីវិត / Survival Mode
            </h1>
            <p className="text-muted-foreground" data-testid="text-survival-subtitle">
              វាយអក្សរឱ្យបានច្រើនបំផុតមុនពេលអស់ជីវិត!
            </p>
          </div>
        </div>

        {phase === "ready" && (
          <div className="glass-panel rounded-3xl p-8 border-border bg-card text-center">
            <div className="text-8xl mb-6">⚔️</div>
            <h2 className="text-3xl font-black text-foreground mb-4">រួចរាល់ដើម្បីរស់រានមានជីវិត?</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              វាយអក្សរឱ្យបានត្រឹមត្រូវមុនពេលអស់ពេល។ កំហុសនីមួយៗធ្វើអោយបាត់ជីវិត។ បន្តឱ្យបានយូរបំផុត!
            </p>
            
            <div className="flex justify-center gap-4 mb-8">
              <div className="bg-secondary rounded-xl p-4 border border-border">
                <div className="text-3xl mb-2">❤️❤️❤️</div>
                <div className="text-xs text-muted-foreground">ជីវិត ៣</div>
              </div>
              <div className="bg-secondary rounded-xl p-4 border border-border">
                <div className="text-3xl mb-2">⏱️</div>
                <div className="text-xs text-muted-foreground">ពេលវេលាកំណត់</div>
              </div>
              <div className="bg-secondary rounded-xl p-4 border border-border">
                <div className="text-3xl mb-2">🔥</div>
                <div className="text-xs text-muted-foreground">កម្រិតកើនឡើង</div>
              </div>
            </div>

            <Button size="lg" className="px-12 py-6 text-xl font-black" onClick={startGame} data-testid="button-start-survival">
              ចាប់ផ្តើម!
            </Button>
          </div>
        )}

        {phase === "playing" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className={cn(
                    "text-3xl transition-all",
                    i < lives ? "animate-pulse" : "grayscale opacity-30"
                  )}>
                    {i < lives ? "❤️" : "🖤"}
                  </div>
                ))}
              </div>
              
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30">
                  <Zap className="text-amber-500" size={20} />
                  <span className="font-mono font-black text-amber-600">កម្រិត {level}</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30">
                  <Trophy className="text-primary" size={20} />
                  <span className="font-mono font-black text-primary">{score}</span>
                </div>
              </div>
            </div>

            <div className="w-full h-3 bg-secondary rounded-full overflow-hidden border border-border">
              <div 
                className={cn(
                  "h-full transition-all duration-100",
                  timePercent > 50 ? "bg-green-500" : timePercent > 25 ? "bg-amber-500" : "bg-red-500"
                )}
                style={{ width: `${timePercent}%` }}
              />
            </div>

            <div className="glass-panel rounded-3xl p-8 border-border bg-card">
              <div className="text-center mb-8">
                <div className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">វាយអក្សរ</div>
                <div className="text-8xl font-khmer font-black text-primary animate-pulse" data-testid="text-survival-target">
                  {target}
                </div>
              </div>

              <input
                ref={inputRef}
                value={typed}
                onChange={(e) => handleInputChange(e.target.value)}
                className="w-full bg-secondary border border-border rounded-2xl px-6 py-5 text-2xl font-khmer text-foreground text-center focus:outline-none focus:ring-2 focus:ring-primary/50"
                data-testid="input-survival"
                autoFocus
                placeholder="វាយនៅទីនេះ..."
              />

              {streak >= 5 && (
                <div className="mt-4 text-center">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-600 font-bold animate-pulse">
                    🔥 {streak} ខ្សែបន្ត!
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col items-center gap-4">
              <Keyboard activeCode={null} target={target} />
            </div>
          </div>
        )}

        {phase === "gameover" && (
          <div className="glass-panel rounded-3xl p-8 border-border bg-card text-center">
            <div className="text-8xl mb-6">
              {score >= 300 ? "🏆" : score >= 100 ? "⭐" : "💀"}
            </div>
            <h2 className="text-3xl font-black text-foreground mb-2">ល្បែងបានបញ្ចប់!</h2>
            <p className="text-muted-foreground mb-8">អ្នកបានទទួលពិន្ទុ {score} ពិន្ទុ!</p>

            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-8">
              <div className="bg-secondary rounded-xl p-4 border border-border">
                <div className="text-xs text-muted-foreground uppercase tracking-widest">ពិន្ទុ</div>
                <div className="text-3xl font-mono font-black text-primary" data-testid="text-final-score">{score}</div>
              </div>
              <div className="bg-secondary rounded-xl p-4 border border-border">
                <div className="text-xs text-muted-foreground uppercase tracking-widest">កម្រិត</div>
                <div className="text-3xl font-mono font-black text-amber-600" data-testid="text-final-level">{level}</div>
              </div>
              <div className="bg-secondary rounded-xl p-4 border border-border">
                <div className="text-xs text-muted-foreground uppercase tracking-widest">ខ្សែបន្តអតិបរមា</div>
                <div className="text-3xl font-mono font-black text-orange-600" data-testid="text-max-streak">{maxStreak}</div>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <Button size="lg" className="gap-2" onClick={startGame} data-testid="button-retry-survival">
                <RotateCcw size={18} />
                លេងម្តងទៀត
              </Button>
              <Link href="/home">
                <Button size="lg" variant="outline" data-testid="button-back-survival">
                  ត្រឡប់ទៅផ្ទះ
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
