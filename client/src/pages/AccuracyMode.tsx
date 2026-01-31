import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, ShieldCheck, Target, RotateCcw, Trophy } from "lucide-react";

import { HUD } from "@/components/HUD";
import { Button } from "@/components/ui/button";
import { useGameStore } from "@/lib/store";
import { buildWorlds } from "@/lib/curriculum";

const WORLDS = buildWorlds();

type Difficulty = "beginner" | "intermediate" | "expert";

type Duration = 30 | 60;

type Phase = "ready" | "running" | "done";

function pickPoolForDifficulty(diff: Difficulty) {
  if (diff === "beginner") return WORLDS[0]?.stages[0]?.pool || ["ក", "ខ", "គ", " "];
  if (diff === "intermediate") return WORLDS[1]?.stages[4]?.pool || ["ក", "ខ", "គ", "ដ", "ត", "ប", " "];
  return WORLDS[8]?.stages[8]?.pool || ["ក", "ខ", "គ", "ដ", "ត", "ប", " ", "។"];
}

export const AccuracyMode: React.FC = () => {
  const { difficulty, recordStageResult } = useGameStore();

  const diff: Difficulty = (difficulty || "beginner") as Difficulty;
  const pool = useMemo(() => pickPoolForDifficulty(diff), [diff]);

  const [duration, setDuration] = useState<Duration>(60);
  const [phase, setPhase] = useState<Phase>("ready");
  const [timeLeft, setTimeLeft] = useState<number>(duration);

  const [target, setTarget] = useState<string>("");
  const [typed, setTyped] = useState<string>("");

  const [hits, setHits] = useState(0);
  const [miss, setMiss] = useState(0);
  const [perfectStreak, setPerfectStreak] = useState(0);

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!target) {
      const next = pool[Math.floor(Math.random() * pool.length)] || "ក";
      setTarget(next);
    }
  }, [pool, target]);

  useEffect(() => {
    setTimeLeft(duration);
    if (phase !== "running") {
      setTyped("");
      setHits(0);
      setMiss(0);
      setPerfectStreak(0);
      setTarget("");
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [duration, phase]);

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

    const accuracy = miss === 0 ? 100 : Math.max(0, Math.round((hits / Math.max(1, hits + miss)) * 100));

    // In accuracy mode, rewards favor perfect runs.
    const stars = miss === 0 ? 3 : accuracy >= 95 ? 2 : accuracy >= 85 ? 1 : 0;

    // WPM here is secondary; still record for badges.
    const minutes = duration / 60;
    const wpm = Math.round((hits / 5) / Math.max(0.01, minutes));

    recordStageResult("acc", `s${duration}`, stars, { wpm, accuracy });
  }, [phase, hits, miss, duration, recordStageResult]);

  const start = () => {
    setTimeLeft(duration);
    setTyped("");
    setHits(0);
    setMiss(0);
    setPerfectStreak(0);
    setPhase("running");
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const reset = () => {
    setPhase("ready");
    setTimeLeft(duration);
    setTyped("");
    setHits(0);
    setMiss(0);
    setPerfectStreak(0);
    setTarget("");
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handleKey = (v: string) => {
    if (phase !== "running") return;

    setTyped(v);

    const lastChar = v.slice(-1);
    if (!lastChar) return;

    if (lastChar === target) {
      setHits((h) => h + 1);
      setPerfectStreak((s) => s + 1);
      const next = pool[Math.floor(Math.random() * pool.length)] || "ក";
      setTarget(next);
    } else {
      // Harsh penalty: any mistake breaks the run.
      setMiss((m) => m + 1);
      setPerfectStreak(0);
    }
  };

  const accuracy = miss === 0 ? 100 : Math.round((hits / Math.max(1, hits + miss)) * 100);

  return (
    <div className="min-h-screen bg-background pb-20 pt-20">
      <HUD />

      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/home">
            <Button variant="ghost" size="icon" data-testid="button-back-home">
              <ArrowLeft />
            </Button>
          </Link>
          <div className="flex flex-col">
            <h1 className="text-4xl font-black font-display text-foreground" data-testid="text-accuracy-title">
              ការផ្តោតលើភាពត្រឹមត្រូវ / Accuracy Mode
            </h1>
            <p className="text-muted-foreground" data-testid="text-accuracy-subtitle">
              Rewards perfect typing. One mistake breaks your streak.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 glass-panel rounded-3xl p-8 border-border bg-card">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <div className="text-xs font-black uppercase tracking-widest text-muted-foreground">Target</div>
                <div className="text-6xl font-khmer font-black text-emerald-600 mt-2" data-testid="text-accuracy-target">
                  {target || "—"}
                </div>
              </div>

              <div className="flex flex-col items-end">
                <div className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <ShieldCheck size={14} /> Perfect
                </div>
                <div className="text-4xl font-mono font-black text-foreground mt-2" data-testid="text-perfect-streak">
                  {perfectStreak}
                </div>
              </div>
            </div>

            <input
              ref={inputRef}
              value={typed}
              onChange={(e) => handleKey(e.target.value)}
              placeholder={phase === "running" ? "Type here…" : "Press Start…"}
              className="w-full bg-secondary border border-border rounded-2xl px-6 py-5 text-2xl font-khmer text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              data-testid="input-accuracy"
              disabled={phase !== "running"}
              aria-label="Accuracy mode input"
            />

            <div className="mt-6 flex flex-wrap gap-3">
              {phase !== "running" ? (
                <Button size="lg" className="h-12 rounded-2xl px-8 font-black bg-emerald-600 hover:bg-emerald-500" onClick={start} data-testid="button-start-accuracy">
                  Start
                </Button>
              ) : (
                <Button size="lg" variant="secondary" className="h-12 rounded-2xl px-8 font-black" onClick={() => setPhase("done")} data-testid="button-finish-accuracy">
                  Finish
                </Button>
              )}

              <Button size="lg" variant="outline" className="h-12 rounded-2xl px-6 font-bold" onClick={reset} data-testid="button-reset-accuracy">
                <RotateCcw size={18} />
                Reset
              </Button>

              <div className="ml-auto flex items-center gap-2 bg-white/50 border border-emerald-300 shadow-sm rounded-2xl px-3 py-2" data-testid="group-duration-accuracy">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Duration</span>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value) as Duration)}
                  className="bg-transparent text-sm font-bold text-emerald-900 focus:outline-none"
                  data-testid="select-duration-accuracy"
                  disabled={phase === "running"}
                >
                  <option value={30}>30s</option>
                  <option value={60}>60s</option>
                </select>
              </div>
            </div>

            {phase === "done" && (
              <div className="mt-8 p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5" data-testid="panel-accuracy-results">
                <div className="text-xs font-black uppercase tracking-widest text-emerald-700 mb-3 flex items-center gap-2">
                  <Trophy size={14} /> Results
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white/60 rounded-xl p-4 border border-white/70">
                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Target size={12} /> Accuracy
                    </div>
                    <div className="text-3xl font-mono font-black text-foreground mt-2" data-testid="text-result-accuracy-mode">
                      {accuracy}%
                    </div>
                  </div>
                  <div className="bg-white/60 rounded-xl p-4 border border-white/70">
                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Miss</div>
                    <div className="text-3xl font-mono font-black text-red-600 mt-2" data-testid="text-result-miss-mode">
                      {miss}
                    </div>
                  </div>
                  <div className="bg-white/60 rounded-xl p-4 border border-white/70">
                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Perfect Streak</div>
                    <div className="text-3xl font-mono font-black text-emerald-700 mt-2" data-testid="text-result-streak-mode">
                      {perfectStreak}
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mt-4" data-testid="text-accuracy-note">
                  Perfect runs (0 mistakes) are the fastest way to earn rewards here.
                </p>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 glass-panel rounded-3xl p-8 border-border bg-card">
            <div className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">Live Stats</div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-muted/30 border border-border p-4">
                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Hits</div>
                <div className="text-3xl font-mono font-black text-foreground mt-2" data-testid="text-live-hits-accuracy">
                  {hits}
                </div>
              </div>
              <div className="rounded-2xl bg-muted/30 border border-border p-4">
                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Miss</div>
                <div className="text-3xl font-mono font-black text-red-600 mt-2" data-testid="text-live-miss-accuracy">
                  {miss}
                </div>
              </div>
              <div className="rounded-2xl bg-muted/30 border border-border p-4">
                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Accuracy</div>
                <div className="text-3xl font-mono font-black text-foreground mt-2" data-testid="text-live-accuracy-accuracy">
                  {accuracy}%
                </div>
              </div>
              <div className="rounded-2xl bg-muted/30 border border-border p-4">
                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Streak</div>
                <div className="text-3xl font-mono font-black text-emerald-700 mt-2" data-testid="text-live-streak-accuracy">
                  {perfectStreak}
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-border bg-white/40 p-4" data-testid="panel-accuracy-rules">
              <div className="text-sm font-black mb-2">Rule</div>
              <p className="text-sm text-muted-foreground">
                This mode is strict: mistakes matter. Slow and clean beats fast and messy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
