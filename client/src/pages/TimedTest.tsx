import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Clock, Flag, RotateCcw, Target, Zap } from "lucide-react";
import { HUD } from "@/components/HUD";
import { Button } from "@/components/ui/button";
import { buildWorlds } from "@/lib/curriculum";
import { useGameStore } from "@/lib/store";

const WORLDS = buildWorlds();

type TimedMode = "wpm" | "accuracy";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const TimedTest: React.FC = () => {
  const [, setLocation] = useLocation();
  const { profile, recordStageResult } = useGameStore();

  const [durationSec, setDurationSec] = useState<30 | 60 | 120>(60);
  const [mode, setMode] = useState<TimedMode>("wpm");
  const [worldId, setWorldId] = useState<string>("w1");

  const [progressiveSpeed, setProgressiveSpeed] = useState(true);
  const [speedLevel, setSpeedLevel] = useState(1);
  const [targetTimeLimitMs, setTargetTimeLimitMs] = useState(3500);

  const [running, setRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(durationSec);
  const [input, setInput] = useState("");
  const [typedCount, setTypedCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [round, setRound] = useState(0);

  const [showFeedback, setShowFeedback] = useState(true);
  const [isWrongNow, setIsWrongNow] = useState(false);
  const [hintIndex, setHintIndex] = useState<number | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const world = useMemo(() => WORLDS.find(w => w.id === worldId) || WORLDS[0], [worldId]);

  const wordBank = useMemo(() => {
    const raw = world.stages.flatMap(s => s.pool);
    const unique = Array.from(new Set(raw))
      .map(x => (x || "").trim())
      .filter(x => x.length > 0 && x !== " " && x !== "។" && x !== "?" && x !== "!" && x !== "៖" && x !== "៕");

    const bank = unique.length > 0 ? unique : ["សួស្តី", "អរគុណ", "កម្ពុជា", "អង្គរវត្ត"];
    return shuffle(bank);
  }, [worldId, round, world]);

  const [index, setIndex] = useState(0);

  const currentWord = wordBank[index % wordBank.length] || "";

  const accuracyPct = useMemo(() => {
    const total = correctCount + wrongCount;
    return total > 0 ? Math.round((correctCount / total) * 100) : 0;
  }, [correctCount, wrongCount]);

  const wpm = useMemo(() => {
    const elapsed = (durationSec - timeLeft) / 60;
    if (elapsed <= 0) return 0;
    return Math.round(correctCount / elapsed);
  }, [correctCount, durationSec, timeLeft]);

  const score = useMemo(() => {
    if (mode === "accuracy") return accuracyPct;
    return wpm;
  }, [mode, accuracyPct, wpm]);

  useEffect(() => {
    setTimeLeft(durationSec);
  }, [durationSec]);

  useEffect(() => {
    if (!running) return;
    if (timeLeft <= 0) return;

    const t = window.setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => window.clearInterval(t);
  }, [running, timeLeft]);

  useEffect(() => {
    if (!running) return;
    if (timeLeft > 0) return;

    // End
    setRunning(false);

    // Use store reward system (mock stage key for timed)
    // We'll map per-world timed tests to a stable stage id.
    const pseudoStageId = "sTimed" as any;
    const stars = mode === "accuracy"
      ? (accuracyPct >= 98 ? 3 : accuracyPct >= 92 ? 2 : accuracyPct >= 85 ? 1 : 0)
      : (wpm >= 60 ? 3 : wpm >= 40 ? 2 : wpm >= 25 ? 1 : 0);

    recordStageResult(worldId, pseudoStageId, stars, { wpm, accuracy: accuracyPct });
  }, [running, timeLeft, recordStageResult, worldId, mode, accuracyPct, wpm]);

  const start = () => {
    setRound(r => r + 1);
    setIndex(0);
    setInput("");
    setTypedCount(0);
    setCorrectCount(0);
    setWrongCount(0);
    setSpeedLevel(1);
    setTargetTimeLimitMs(3500);
    setIsWrongNow(false);
    setHintIndex(null);
    setTimeLeft(durationSec);
    setRunning(true);

    window.setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const reset = () => {
    setRunning(false);
    setTimeLeft(durationSec);
    setInput("");
    setTypedCount(0);
    setCorrectCount(0);
    setWrongCount(0);
    setSpeedLevel(1);
    setTargetTimeLimitMs(3500);
    setIsWrongNow(false);
    setHintIndex(null);
    setIndex(0);
  };

  const submit = () => {
    if (!running) return;
    const val = input;
    const expectedWord = currentWord;

    const started = performance.now();

    const mismatchAt = (() => {
      const a = (val || "").trim();
      const b = (expectedWord || "").trim();
      const n = Math.min(a.length, b.length);
      for (let i = 0; i < n; i++) {
        if (a[i] !== b[i]) return i;
      }
      if (a.length !== b.length) return n;
      return null;
    })();

    const isCorrect = mismatchAt === null;

    setTypedCount(c => c + 1);
    if (isCorrect) setCorrectCount(c => c + 1);
    else setWrongCount(c => c + 1);

    if (showFeedback) {
      setIsWrongNow(!isCorrect);
      setHintIndex(isCorrect ? null : mismatchAt);
    } else {
      setIsWrongNow(false);
      setHintIndex(null);
    }

    // Progressive speed logic: if player maintains >=80% accuracy, tighten time window.
    // This simulates increasing pressure (words must be typed faster).
    window.setTimeout(() => {
      const end = performance.now();
      const took = end - started;

      const total = correctCount + wrongCount + 1;
      const nextAcc = Math.round(((correctCount + (isCorrect ? 1 : 0)) / total) * 100);

      if (!progressiveSpeed) return;
      if (nextAcc < 80) {
        // Cool down if accuracy slips
        setSpeedLevel(l => Math.max(1, l - 1));
        setTargetTimeLimitMs(ms => Math.min(4500, ms + 250));
        return;
      }

      // Reward sustained accuracy: ramp up challenge every few correct answers.
      if (isCorrect && total % 5 === 0) {
        setSpeedLevel(l => Math.min(10, l + 1));
        setTargetTimeLimitMs(ms => Math.max(900, ms - 250));
      }

      // If they are also fast, give an extra tiny bump.
      if (isCorrect && took < targetTimeLimitMs * 0.6) {
        setTargetTimeLimitMs(ms => Math.max(900, ms - 80));
      }
    }, 0);

    setInput("");
    setIndex(i => i + 1);

    // Clear feedback after a brief moment so it feels responsive but not noisy.
    if (showFeedback && !isCorrect) {
      window.setTimeout(() => {
        setIsWrongNow(false);
        setHintIndex(null);
      }, 900);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 pt-20">
      <HUD />

      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/challenges">
            <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-back-challenges">
              <ArrowLeft />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-4xl font-black font-display text-foreground" data-testid="text-timed-title">
              Timed Test
            </h1>
            <p className="text-muted-foreground" data-testid="text-timed-subtitle">
              Type as many words as possible before the timer ends.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border-border bg-card">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary mb-4" data-testid="text-settings-title">
              <Target size={14} /> Settings
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="text-xs font-bold text-muted-foreground uppercase" data-testid="text-duration-label">Duration</div>
                <div className="flex gap-2 flex-wrap">
                  {[30, 60, 120].map((s) => (
                    <Button
                      key={s}
                      variant={durationSec === s ? "default" : "outline"}
                      className="rounded-xl"
                      onClick={() => setDurationSec(s as any)}
                      disabled={running}
                      data-testid={`button-duration-${s}`}
                    >
                      <Clock size={14} /> {s}s
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-muted-foreground uppercase" data-testid="text-mode-label">Goal</div>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant={mode === "wpm" ? "default" : "outline"}
                    className="rounded-xl"
                    onClick={() => setMode("wpm")}
                    disabled={running}
                    data-testid="button-mode-wpm"
                  >
                    <Zap size={14} /> Fastest WPM
                  </Button>
                  <Button
                    variant={mode === "accuracy" ? "default" : "outline"}
                    className="rounded-xl"
                    onClick={() => setMode("accuracy")}
                    disabled={running}
                    data-testid="button-mode-accuracy"
                  >
                    <Target size={14} /> Highest Accuracy
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-muted-foreground uppercase" data-testid="text-world-label">Theme</div>
                <select
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground font-bold focus:outline-none focus:ring-2 focus:ring-primary/40"
                  value={worldId}
                  onChange={(e) => setWorldId(e.target.value)}
                  disabled={running}
                  data-testid="select-timed-world"
                >
                  {WORLDS.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.theme?.emoji ? `${w.theme.emoji} ` : ""}{w.name}
                    </option>
                  ))}
                </select>
                {world?.theme && (
                  <div className="text-sm text-muted-foreground" data-testid="text-timed-world-description">
                    {world.theme.description}
                  </div>
                )}

                <div className="mt-2 rounded-2xl border border-border bg-muted/30 p-3" data-testid="panel-progressive-speed">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-black uppercase tracking-widest text-muted-foreground" data-testid="text-progressive-label">Progressive Speed</div>
                      <div className="text-sm font-bold text-foreground" data-testid="text-progressive-sub">
                        Keep 80%+ accuracy to increase pressure.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setProgressiveSpeed(v => !v)}
                      disabled={running}
                      className={`h-9 px-3 rounded-xl border font-bold transition-colors ${progressiveSpeed ? "bg-primary text-primary-foreground border-primary" : "bg-white/70 text-slate-700 border-border"} ${running ? "opacity-60 cursor-not-allowed" : "hover:bg-white"}`}
                      data-testid="button-toggle-progressive"
                    >
                      {progressiveSpeed ? "ON" : "OFF"}
                    </button>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="rounded-xl bg-white/70 border border-border px-3 py-2" data-testid="card-speed-level">
                      <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Level</div>
                      <div className="font-mono font-black text-primary" data-testid="text-speed-level">{speedLevel}</div>
                    </div>
                    <div className="rounded-xl bg-white/70 border border-border px-3 py-2" data-testid="card-time-window">
                      <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Time window</div>
                      <div className="font-mono font-black text-amber-700" data-testid="text-time-window">{Math.round(targetTimeLimitMs / 100) / 10}s</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                {!running ? (
                  <Button className="flex-1 h-12 rounded-xl font-black" onClick={start} data-testid="button-start-timed">
                    Start
                  </Button>
                ) : (
                  <Button className="flex-1 h-12 rounded-xl font-black" variant="secondary" disabled data-testid="button-running-timed">
                    Running…
                  </Button>
                )}

                <Button
                  variant="outline"
                  className="h-12 rounded-xl"
                  onClick={reset}
                  data-testid="button-reset-timed"
                >
                  <RotateCcw size={16} />
                </Button>
              </div>

              <Button
                variant="ghost"
                className="w-full justify-start text-muted-foreground"
                onClick={() => setLocation("/home")}
                data-testid="button-exit-timed"
              >
                <Flag size={16} /> Exit to Home
              </Button>
            </div>
          </div>

          <div className="lg:col-span-3 glass-panel p-8 rounded-3xl border-primary/20 bg-primary/5">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/60 border border-primary/20 flex items-center justify-center" data-testid="icon-timer">
                  <Clock />
                </div>
                <div>
                  <div className="text-xs font-black uppercase tracking-widest text-primary" data-testid="text-live-title">Live</div>
                  <div className="text-2xl font-black" data-testid="text-live-world">
                    {world?.theme?.emoji} {world?.theme?.title}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className={`px-4 py-2 rounded-2xl border font-mono text-lg font-black ${timeLeft <= 10 && running ? "bg-red-50 border-red-200 text-red-700" : "bg-white/60 border-primary/20 text-slate-900"}`} data-testid="text-time-left">
                  {timeLeft}s
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white/60 border border-primary/20 p-6">
              <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3" data-testid="text-target-label">
                Target word
              </div>
              <div
                className={`text-5xl font-black tracking-tight font-display transition-colors ${isWrongNow ? "text-red-600" : "text-slate-900"}`}
                data-testid="text-current-word"
              >
                {currentWord}
              </div>

              <div className="mt-3 rounded-2xl border border-border bg-white/60 p-3" data-testid="panel-live-feedback">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-bold text-slate-700" data-testid="text-feedback-title">
                      Live feedback
                    </div>
                    <div className="text-xs text-muted-foreground" data-testid="text-feedback-sub">
                      Highlights the first wrong character position.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowFeedback(v => !v)}
                    className={`h-8 px-3 rounded-xl border text-xs font-black transition-colors ${showFeedback ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-border"}`}
                    data-testid="button-toggle-feedback"
                  >
                    {showFeedback ? "ON" : "OFF"}
                  </button>
                </div>

                {showFeedback && (
                  <>
                    {isWrongNow ? (
                      <div className="mt-2">
                        <div className="text-sm font-black text-red-700" data-testid="status-incorrect">
                          Incorrect — check the highlighted position.
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <div className="text-xs font-bold text-slate-600" data-testid="text-hint-label">Hint:</div>
                          <div className="rounded-xl bg-red-50 border border-red-200 px-3 py-2 font-mono font-black text-red-700" data-testid="text-hint-index">
                            {hintIndex === null ? "—" : `Mismatch at #${hintIndex + 1}`}
                          </div>
                          <div className="rounded-xl bg-white border border-border px-3 py-2 font-mono font-black text-slate-900" data-testid="text-hint-expected">
                            {hintIndex === null ? "Expected: —" : `Expected: ${currentWord[hintIndex] || "(end)"}`}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2 text-sm text-muted-foreground" data-testid="status-correct">
                        Type the word and press Enter. Mistakes will show you exactly where you diverged.
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="mt-6 flex gap-3">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => {
                    const v = e.target.value;
                    setInput(v);
                    if (!showFeedback) return;

                    const expected = currentWord;
                    const a = (v || "").trim();
                    const b = (expected || "").trim();
                    const n = Math.min(a.length, b.length);
                    let mismatch: number | null = null;
                    for (let i = 0; i < n; i++) {
                      if (a[i] !== b[i]) { mismatch = i; break; }
                    }
                    if (mismatch === null && a.length > b.length) mismatch = n;

                    if (mismatch !== null && a.length > 0) {
                      setIsWrongNow(true);
                      setHintIndex(mismatch);
                    } else {
                      setIsWrongNow(false);
                      setHintIndex(null);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submit();
                  }}
                  disabled={!running}
                  placeholder={running ? "Type and press Enter" : "Press Start to begin"}
                  className={`flex-1 bg-white border rounded-2xl px-5 py-4 text-xl font-bold text-slate-900 focus:outline-none focus:ring-2 disabled:opacity-60 transition-colors ${isWrongNow ? "border-red-300 focus:ring-red-200" : "border-border focus:ring-primary/40"}`}
                  data-testid="input-timed"
                />
                <Button
                  className="h-[58px] rounded-2xl px-6 font-black"
                  onClick={submit}
                  disabled={!running}
                  data-testid="button-submit-word"
                >
                  Enter
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                <div className="rounded-2xl bg-white border border-border p-4" data-testid="card-metric-wpm">
                  <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">WPM</div>
                  <div className="text-2xl font-mono font-black text-primary" data-testid="text-metric-wpm">{wpm}</div>
                </div>
                <div className="rounded-2xl bg-white border border-border p-4" data-testid="card-metric-accuracy">
                  <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Accuracy</div>
                  <div className="text-2xl font-mono font-black text-green-700" data-testid="text-metric-accuracy">{accuracyPct}%</div>
                </div>
                <div className="rounded-2xl bg-white border border-border p-4" data-testid="card-metric-correct">
                  <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Correct</div>
                  <div className="text-2xl font-mono font-black" data-testid="text-metric-correct">{correctCount}</div>
                </div>
                <div className="rounded-2xl bg-white border border-border p-4" data-testid="card-metric-wrong">
                  <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Wrong</div>
                  <div className="text-2xl font-mono font-black text-red-600" data-testid="text-metric-wrong">{wrongCount}</div>
                </div>
              </div>

              {!running && typedCount > 0 && (
                <div className="mt-6 rounded-3xl bg-slate-950 text-white p-6" data-testid="panel-result">
                  <div className="text-xs font-black uppercase tracking-[0.25em] text-white/60" data-testid="text-result-label">Result</div>
                  <div className="mt-2 flex items-end justify-between gap-6">
                    <div>
                      <div className="text-4xl font-black" data-testid="text-result-score">{score}</div>
                      <div className="text-white/70" data-testid="text-result-sub">
                        {mode === "wpm" ? "WPM" : "Accuracy %"} • {profile.name}
                      </div>
                    </div>
                    <Button className="rounded-2xl font-black" onClick={start} data-testid="button-try-again">
                      Try again
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
