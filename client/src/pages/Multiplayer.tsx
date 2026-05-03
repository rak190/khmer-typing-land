import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Play, RotateCcw, Target, Trophy, Users, Zap } from "lucide-react";
import { HUD } from "@/components/HUD";
import { Button } from "@/components/ui/button";
import { useGameStore } from "@/lib/store";

type Phase = "menu" | "racing" | "results";

interface Racer {
  id: string;
  name: string;
  progress: number;
  wpm: number;
  accuracy: number;
  finished: boolean;
}

const RACE_TEXT =
  "ការប្រកួតវាយអក្សរខ្មែរ ជួយឱ្យអ្នករៀនបង្កើនល្បឿន ភាពត្រឹមត្រូវ និងទំនុកចិត្ត។";

export const Multiplayer: React.FC = () => {
  const { profile } = useGameStore();
  const [phase, setPhase] = useState<Phase>("menu");
  const [typedText, setTypedText] = useState("");
  const [errors, setErrors] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const [racers, setRacers] = useState<Racer[]>([]);

  const myRacer = racers.find((racer) => racer.id === "you");
  const sortedRacers = useMemo(
    () => [...racers].sort((a, b) => b.progress - a.progress || b.wpm - a.wpm),
    [racers],
  );

  const startRace = () => {
    setTypedText("");
    setErrors(0);
    setStartTime(Date.now());
    setRacers([
      { id: "you", name: profile.name || "អ្នក", progress: 0, wpm: 0, accuracy: 100, finished: false },
      { id: "bot-1", name: "នីតា", progress: 0, wpm: 0, accuracy: 97, finished: false },
      { id: "bot-2", name: "ដារ៉ា", progress: 0, wpm: 0, accuracy: 94, finished: false },
      { id: "bot-3", name: "សុខា", progress: 0, wpm: 0, accuracy: 91, finished: false },
    ]);
    setPhase("racing");
  };

  useEffect(() => {
    if (phase === "racing") {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [phase]);

  useEffect(() => {
    if (phase !== "racing" || !startTime) return;

    const interval = window.setInterval(() => {
      const elapsed = Math.max((Date.now() - startTime) / 1000, 1);
      setRacers((current) =>
        current.map((racer) => {
          if (racer.id === "you" || racer.finished) return racer;
          const speed = racer.id === "bot-1" ? 4.8 : racer.id === "bot-2" ? 4.1 : 3.5;
          const progress = Math.min(RACE_TEXT.length, Math.round(elapsed * speed));
          return {
            ...racer,
            progress,
            wpm: Math.round((progress / 5 / elapsed) * 60),
            finished: progress >= RACE_TEXT.length,
          };
        }),
      );
    }, 400);

    return () => window.clearInterval(interval);
  }, [phase, startTime]);

  useEffect(() => {
    if (phase === "racing" && racers.length > 0 && racers.every((racer) => racer.finished)) {
      setPhase("results");
    }
  }, [phase, racers]);

  const handleTyping = (value: string) => {
    if (phase !== "racing") return;

    const nextValue = value.slice(0, RACE_TEXT.length);
    let nextErrors = 0;
    for (let i = 0; i < nextValue.length; i++) {
      if (nextValue[i] !== RACE_TEXT[i]) nextErrors++;
    }

    const elapsed = Math.max((Date.now() - startTime) / 1000, 1);
    const accuracy =
      nextValue.length > 0
        ? Math.max(0, Math.round(((nextValue.length - nextErrors) / nextValue.length) * 100))
        : 100;
    const wpm = Math.round((nextValue.length / 5 / elapsed) * 60);

    setTypedText(nextValue);
    setErrors(nextErrors);
    setRacers((current) =>
      current.map((racer) =>
        racer.id === "you"
          ? {
              ...racer,
              progress: nextValue.length,
              wpm,
              accuracy,
              finished: nextValue.length >= RACE_TEXT.length,
            }
          : racer,
      ),
    );
  };

  const renderProgress = (racer: Racer) => Math.round((racer.progress / RACE_TEXT.length) * 100);

  return (
    <div className="min-h-screen bg-background pb-20 pt-20">
      <HUD />
      <div className="container mx-auto px-4 max-w-6xl mt-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/home">
            <Button variant="ghost" size="icon" data-testid="button-back-home">
              <ArrowLeft />
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-black font-display text-foreground" data-testid="text-multiplayer-title">
              ការប្រកួតផ្ទាល់
            </h1>
            <p className="text-muted-foreground">
              ប្រកួតជាមួយអ្នកលេងកុំព្យូទ័រ ដើម្បីហ្វឹកហាត់ល្បឿន និងភាពត្រឹមត្រូវ។
            </p>
          </div>
        </div>

        {phase === "menu" && (
          <div className="glass-panel rounded-3xl p-8 border-border bg-card max-w-2xl mx-auto text-center">
            <Users className="mx-auto mb-4 text-primary" size={56} />
            <h2 className="text-2xl font-black text-foreground mb-3">ត្រៀមប្រកួតខ្លីៗហើយឬនៅ?</h2>
            <p className="text-muted-foreground mb-8">
              ចាប់ផ្តើមវាយអក្សរតាមអត្ថបទ ហើយមើលចំណាត់ថ្នាក់ផ្ទាល់ពេលប្រកួត។
            </p>
            <Button onClick={startRace} className="h-14 px-8 text-lg font-black" data-testid="button-start-local-race">
              <Play className="mr-2" fill="currentColor" /> ចាប់ផ្តើមប្រកួត
            </Button>
          </div>
        )}

        {phase === "racing" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass-panel rounded-3xl p-8 border-border bg-card">
              <div className="text-2xl leading-relaxed mb-6 text-foreground/80">
                {RACE_TEXT.split("").map((char, index) => {
                  const typed = typedText[index];
                  const isTyped = index < typedText.length;
                  const isCorrect = typed === char;
                  const isCurrent = index === typedText.length;

                  return (
                    <span
                      key={`${char}-${index}`}
                      className={`${isTyped ? (isCorrect ? "text-emerald-600" : "text-red-600 underline") : "text-foreground/40"} ${isCurrent ? "bg-primary/20" : ""}`}
                    >
                      {char}
                    </span>
                  );
                })}
              </div>

              <input
                ref={inputRef}
                value={typedText}
                onChange={(event) => handleTyping(event.target.value)}
                className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="ចាប់ផ្តើមវាយអក្សរ..."
                data-testid="input-race-typing"
                autoFocus
              />

              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="bg-muted/30 rounded-xl p-4">
                  <div className="text-xs font-black uppercase text-muted-foreground">ពាក្យ/នាទី</div>
                  <div className="text-3xl font-mono font-black text-foreground">{myRacer?.wpm || 0}</div>
                </div>
                <div className="bg-muted/30 rounded-xl p-4">
                  <div className="text-xs font-black uppercase text-muted-foreground">ភាពត្រឹមត្រូវ</div>
                  <div className="text-3xl font-mono font-black text-foreground">{myRacer?.accuracy || 100}%</div>
                </div>
                <div className="bg-muted/30 rounded-xl p-4">
                  <div className="text-xs font-black uppercase text-muted-foreground">កំហុស</div>
                  <div className="text-3xl font-mono font-black text-red-600">{errors}</div>
                </div>
              </div>
            </div>

            <div className="glass-panel rounded-3xl p-8 border-border bg-card">
              <h2 className="text-xl font-black mb-4 flex items-center gap-2">
                <Trophy size={20} className="text-amber-500" /> ចំណាត់ថ្នាក់ផ្ទាល់
              </h2>
              <div className="space-y-3">
                {sortedRacers.map((racer, index) => (
                  <div key={racer.id} className={`rounded-xl p-4 ${racer.id === "you" ? "bg-primary/10 border-2 border-primary" : "bg-secondary/50"}`}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${index === 0 ? "bg-amber-500 text-white" : "bg-muted text-foreground"}`}>
                        {index + 1}
                      </div>
                      <span className="font-bold text-sm">{racer.name}</span>
                      {racer.finished && <span className="ml-auto text-xs font-black text-emerald-600">រួចរាល់</span>}
                    </div>
                    <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-primary to-emerald-500 h-full transition-all duration-300"
                        style={{ width: `${renderProgress(racer)}%` }}
                      />
                    </div>
                    <div className="mt-2 flex gap-3 text-xs text-muted-foreground">
                      <span><Zap size={12} className="inline" /> {racer.wpm} ពាក្យ/នាទី</span>
                      <span><Target size={12} className="inline" /> {racer.accuracy}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {phase === "results" && (
          <div className="glass-panel rounded-3xl p-8 border-border bg-card max-w-3xl mx-auto">
            <h2 className="text-3xl font-black text-foreground mb-6 text-center">ការប្រកួតបានបញ្ចប់</h2>
            <div className="space-y-4">
              {sortedRacers.map((racer, index) => (
                <div key={racer.id} className={`rounded-2xl p-5 flex items-center gap-4 ${racer.id === "you" ? "bg-primary/10 border-2 border-primary" : "bg-secondary/40"}`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xl ${index === 0 ? "bg-amber-500 text-white" : "bg-muted text-foreground"}`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-black text-lg">{racer.name}</div>
                    <div className="text-sm text-muted-foreground">{racer.wpm} ពាក្យ/នាទី · ភាពត្រឹមត្រូវ {racer.accuracy}% · បានបញ្ចប់ {renderProgress(racer)}%</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 flex gap-4">
              <Button onClick={startRace} className="flex-1 h-14 text-lg font-black" data-testid="button-new-race">
                <RotateCcw className="mr-2" /> ប្រកួតម្តងទៀត
              </Button>
              <Link href="/home" className="flex-1">
                <Button variant="outline" className="w-full h-14 text-lg font-black">
                  ត្រឡប់ទៅទំព័រដើម
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
