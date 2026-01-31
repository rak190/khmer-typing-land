import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Clock3, Gauge, Target, RotateCcw } from "lucide-react";

import { HUD } from "@/components/HUD";
import { Button } from "@/components/ui/button";
import { useGameStore } from "@/lib/store";
import { buildWorlds } from "@/lib/curriculum";
import { sounds } from "@/lib/sounds";
import { Celebration } from "@/components/Celebration";

const WORLDS = buildWorlds();

type Difficulty = "beginner" | "intermediate" | "expert";
type Duration = 30 | 60 | 120;
type Phase = "ready" | "running" | "done";

function pickPoolForDifficulty(diff: Difficulty) {
  if (diff === "beginner") return WORLDS[0]?.stages[0]?.pool || ["ក", "ខ", "គ", " "];
  if (diff === "intermediate") return WORLDS[1]?.stages[4]?.pool || ["ក", "ខ", "គ", "ដ", "ត", "ប", " "];
  return WORLDS[8]?.stages[8]?.pool || ["ក", "ខ", "គ", "ដ", "ត", "ប", " ", "។"];
}

function formatSeconds(s: number) {
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${mm}:${String(ss).padStart(2, "0")}`;
}

export const TimedTest: React.FC = () => {
  const { difficulty, recordStageResult } = useGameStore();

  const diff: Difficulty = (difficulty || "beginner") as Difficulty;
  const pool = useMemo(() => pickPoolForDifficulty(diff), [diff]);

  const [duration, setDuration] = useState<Duration>(60);
  const [phase, setPhase] = useState<Phase>("ready");

  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [typed, setTyped] = useState<string>("");
  const [target, setTarget] = useState<string>("");

  const [hits, setHits] = useState(0);
  const [miss, setMiss] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setTimeLeft(duration);
    if (phase !== "running") {
      setTyped("");
      setHits(0);
      setMiss(0);
      setTarget("");
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [duration, phase]);

  useEffect(() => {
    if (!target) {
      const next = pool[Math.floor(Math.random() * pool.length)] || "ក";
      setTarget(next);
    }
  }, [pool, target]);

  useEffect(() => {
    if (phase !== "running") return;

    const id = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          window.clearInterval(id);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => window.clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase === "running" && timeLeft === 0) {
      setPhase("done");
    }
  }, [phase, timeLeft]);

  useEffect(() => {
    if (phase !== "done") return;

    const total = hits + miss;
    const accuracy = total > 0 ? (hits / total) * 100 : 0;
    const minutes = duration / 60;
    const wpm = Math.round((hits / 5) / Math.max(0.01, minutes));

    const stars = accuracy >= 95 ? 3 : accuracy >= 85 ? 2 : accuracy >= 70 ? 1 : 0;

    recordStageResult("tt", `s${duration}`, stars, { wpm, accuracy });
    
    setShowCelebration(true);
    if (stars >= 2) {
      sounds.playVictory();
    } else {
      sounds.playLevelUp();
    }
  }, [phase, hits, miss, duration, recordStageResult]);

  const start = () => {
    setTimeLeft(duration);
    setTyped("");
    setHits(0);
    setMiss(0);
    setPhase("running");
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const reset = () => {
    setPhase("ready");
    setTimeLeft(duration);
    setTyped("");
    setHits(0);
    setMiss(0);
    setStreak(0);
    setTarget("");
    setShowCelebration(false);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const [lastMistake, setLastMistake] = useState<{ expected: string; got: string } | null>(null);

  const handleInputChange = (v: string) => {
    if (phase !== "running") return;

    setTyped(v);

    const lastChar = v.slice(-1);
    if (!lastChar) return;

    if (lastChar === target) {
      setHits((h) => h + 1);
      setStreak((s) => {
        const newStreak = s + 1;
        sounds.playStreak(newStreak);
        return newStreak;
      });
      setLastMistake(null);
      const next = pool[Math.floor(Math.random() * pool.length)] || "ក";
      setTarget(next);
    } else {
      setMiss((m) => m + 1);
      if (streak >= 3) {
        sounds.playComboBreak();
      } else {
        sounds.playWrong();
      }
      setStreak(0);
      setLastMistake({ expected: target, got: lastChar });
    }
  };

  const total = hits + miss;
  const accuracy = total > 0 ? Math.round((hits / total) * 100) : 0;
  const elapsedSeconds = Math.max(1, duration - timeLeft);
  const wpmLive = Math.round((hits / 5) / Math.max(0.01, elapsedSeconds / 60));

  return (
    <div className="min-h-screen bg-background pb-20 pt-20">
      <HUD />
      
      {showCelebration && phase === "done" && (
        <Celebration 
          type="stars" 
          intensity={accuracy >= 90 ? "high" : "medium"}
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
            <h1 className="text-4xl font-black font-display text-foreground" data-testid="text-timedtest-title">
              ការប្រឡងពេលវេលា / Timed Test
            </h1>
            <p className="text-muted-foreground" data-testid="text-timedtest-subtitle">
              Type as many characters as possible before time runs out.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 glass-panel rounded-3xl p-8 border-border bg-card">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <div className="text-xs font-black uppercase tracking-widest text-muted-foreground">Target</div>
                <div className="text-6xl font-khmer font-black text-primary mt-2" data-testid="text-target-char">
                  {target || "—"}
                </div>
              </div>

              <div className="flex flex-col items-end">
                <div className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Clock3 size={14} /> Time
                </div>
                <div className="text-4xl font-mono font-black text-foreground mt-2" data-testid="text-time-left">
                  {formatSeconds(timeLeft)}
                </div>
              </div>
            </div>

            <div className="relative">
              {lastMistake && phase === "running" && (
                <div className="mb-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3" data-testid="panel-error-feedback">
                  <div className="text-xs font-black uppercase tracking-widest text-red-400">Oops</div>
                  <div className="mt-1 text-sm text-red-200">
                    Expected <span className="font-khmer font-black">{lastMistake.expected}</span> but you typed <span className="font-khmer font-black">{lastMistake.got}</span>.
                  </div>
                  <div className="mt-1 text-xs text-red-200/80">
                    Hint: look at the highlighted key below.
                  </div>
                </div>
              )}
              <input
                ref={inputRef}
                value={typed}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={phase === "running" ? "Type here…" : "Press Start…"}
                className="w-full bg-secondary border border-border rounded-2xl px-6 py-5 text-2xl font-khmer text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                data-testid="input-timedtest"
                disabled={phase !== "running"}
                aria-label="Timed test input"
              />
              {phase !== "running" && (
                <div className="absolute inset-0 rounded-2xl bg-background/40 backdrop-blur-sm flex items-center justify-center">
                  <div className="text-sm font-bold text-muted-foreground" data-testid="text-overlay-hint">
                    Choose a duration and press Start
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {phase !== "running" ? (
                <Button
                  size="lg"
                  className="h-12 rounded-2xl px-8 font-black"
                  onClick={start}
                  data-testid="button-start-timedtest"
                >
                  Start
                </Button>
              ) : (
                <Button
                  size="lg"
                  variant="secondary"
                  className="h-12 rounded-2xl px-8 font-black"
                  onClick={() => setPhase("done")}
                  data-testid="button-finish-timedtest"
                >
                  Finish
                </Button>
              )}

              <Button
                size="lg"
                variant="outline"
                className="h-12 rounded-2xl px-6 font-bold"
                onClick={reset}
                data-testid="button-reset-timedtest"
              >
                <RotateCcw size={18} />
                Reset
              </Button>

              <div
                className="ml-auto flex items-center gap-2 bg-white/50 border border-amber-300 shadow-sm rounded-2xl px-3 py-2"
                data-testid="group-duration"
              >
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-700">Duration</span>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value) as Duration)}
                  className="bg-transparent text-sm font-bold text-amber-900 focus:outline-none"
                  data-testid="select-duration"
                  disabled={phase === "running"}
                >
                  <option value={30}>30s</option>
                  <option value={60}>60s</option>
                  <option value={120}>120s</option>
                </select>
              </div>
            </div>

            {phase === "done" && (
              <div className="mt-8 p-5 rounded-2xl border border-primary/20 bg-primary/5" data-testid="panel-results">
                <div className="text-xs font-black uppercase tracking-widest text-primary mb-3">Results</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white/60 rounded-xl p-4 border border-white/70">
                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Gauge size={12} /> WPM
                    </div>
                    <div className="text-3xl font-mono font-black text-foreground mt-2" data-testid="text-result-wpm">
                      {Number.isFinite(wpmLive) ? wpmLive : 0}
                    </div>
                  </div>
                  <div className="bg-white/60 rounded-xl p-4 border border-white/70">
                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Target size={12} /> Accuracy
                    </div>
                    <div className="text-3xl font-mono font-black text-foreground mt-2" data-testid="text-result-accuracy">
                      {accuracy}%
                    </div>
                  </div>
                  <div className="bg-white/60 rounded-xl p-4 border border-white/70">
                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Typed</div>
                    <div className="text-3xl font-mono font-black text-foreground mt-2" data-testid="text-result-count">
                      {hits}
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mt-4" data-testid="text-results-note">
                  Tip: Increase difficulty (កម្រិត) on Home to unlock a bigger character pool.
                </p>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 glass-panel rounded-3xl p-8 border-border bg-card">
            <div className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">Live Stats</div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-muted/30 border border-border p-4">
                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Hits</div>
                <div className="text-3xl font-mono font-black text-foreground mt-2" data-testid="text-live-hits">
                  {hits}
                </div>
              </div>
              <div className="rounded-2xl bg-muted/30 border border-border p-4">
                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Miss</div>
                <div className="text-3xl font-mono font-black text-red-600 mt-2" data-testid="text-live-miss">
                  {miss}
                </div>
              </div>
              <div className="rounded-2xl bg-muted/30 border border-border p-4">
                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Accuracy</div>
                <div className="text-3xl font-mono font-black text-foreground mt-2" data-testid="text-live-accuracy">
                  {accuracy}%
                </div>
              </div>
              <div className="rounded-2xl bg-muted/30 border border-border p-4">
                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">WPM</div>
                <div className="text-3xl font-mono font-black text-primary mt-2" data-testid="text-live-wpm">
                  {Number.isFinite(wpmLive) ? wpmLive : 0}
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-border bg-white/40 p-4" data-testid="panel-rules">
              <div className="text-sm font-black mb-2">How it works</div>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• You’ll see one target character at a time.</li>
                <li>• Each correct key adds to your score.</li>
                <li>• Mistypes reduce accuracy (but you keep going).</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
