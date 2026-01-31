import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "wouter";
import { ArrowLeft, Scroll, Landmark, MessageCircle, Leaf, Heart, RotateCcw, Play, Check, X } from "lucide-react";
import { HUD } from "@/components/HUD";
import { Button } from "@/components/ui/button";
import { useGameStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  CulturalText,
  getContentByCategory,
  getRandomContent,
  KHMER_PROVERBS,
  KHMER_HISTORY,
  KHMER_DAILY,
  KHMER_GREETINGS,
  KHMER_NATURE,
} from "@/lib/cultural-content";

type Category = "all" | "proverb" | "history" | "daily" | "greeting" | "nature";

const CATEGORY_INFO: Record<Category, { icon: React.ReactNode; label: string; labelKm: string; color: string }> = {
  all: { icon: <Heart size={20} />, label: "All Categories", labelKm: "គ្រប់ប្រភេទ", color: "text-primary" },
  proverb: { icon: <Scroll size={20} />, label: "Proverbs", labelKm: "សុភាសិត", color: "text-amber-600" },
  history: { icon: <Landmark size={20} />, label: "History", labelKm: "ប្រវត្តិសាស្ត្រ", color: "text-blue-600" },
  daily: { icon: <MessageCircle size={20} />, label: "Daily Life", labelKm: "ជីវិតប្រចាំថ្ងៃ", color: "text-emerald-600" },
  greeting: { icon: <Heart size={20} />, label: "Greetings", labelKm: "ការស្វាគមន៍", color: "text-pink-600" },
  nature: { icon: <Leaf size={20} />, label: "Nature", labelKm: "ធម្មជាតិ", color: "text-green-600" },
};

type Phase = "select" | "playing" | "results";

export const CulturalChallenges: React.FC = () => {
  const { recordStageResult, difficulty } = useGameStore();
  const [category, setCategory] = useState<Category>("all");
  const [phase, setPhase] = useState<Phase>("select");
  const [challenges, setChallenges] = useState<CulturalText[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [results, setResults] = useState<{ correct: boolean; wpm: number; accuracy: number }[]>([]);
  const [startTime, setStartTime] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentChallenge = challenges[currentIndex];

  const startChallenge = (cat: Category) => {
    setCategory(cat);
    const content = cat === "all" 
      ? getRandomContent(5) 
      : getContentByCategory(cat as Exclude<Category, "all">).slice(0, 5);
    setChallenges(content);
    setCurrentIndex(0);
    setTypedText("");
    setResults([]);
    setPhase("playing");
    setStartTime(Date.now());
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleTyping = (value: string) => {
    setTypedText(value);

    if (!currentChallenge) return;

    // Check if complete
    if (value === currentChallenge.text) {
      const elapsed = (Date.now() - startTime) / 1000;
      const wpm = Math.round((value.length / 5) / Math.max(elapsed / 60, 0.01));
      
      let errors = 0;
      for (let i = 0; i < value.length; i++) {
        if (value[i] !== currentChallenge.text[i]) errors++;
      }
      const accuracy = Math.round(((value.length - errors) / value.length) * 100);

      setResults([...results, { correct: true, wpm, accuracy }]);

      if (currentIndex < challenges.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setTypedText("");
        setStartTime(Date.now());
      } else {
        setPhase("results");
      }
    }
  };

  const skipChallenge = () => {
    setResults([...results, { correct: false, wpm: 0, accuracy: 0 }]);
    
    if (currentIndex < challenges.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setTypedText("");
      setStartTime(Date.now());
    } else {
      setPhase("results");
    }
  };

  const avgWpm = useMemo(() => {
    const completed = results.filter(r => r.correct);
    if (completed.length === 0) return 0;
    return Math.round(completed.reduce((a, b) => a + b.wpm, 0) / completed.length);
  }, [results]);

  const avgAccuracy = useMemo(() => {
    const completed = results.filter(r => r.correct);
    if (completed.length === 0) return 0;
    return Math.round(completed.reduce((a, b) => a + b.accuracy, 0) / completed.length);
  }, [results]);

  const correctCount = results.filter(r => r.correct).length;

  useEffect(() => {
    if (phase === "results" && correctCount > 0) {
      const stars = correctCount >= 5 ? 3 : correctCount >= 3 ? 2 : 1;
      recordStageResult("cultural", category, stars, { wpm: avgWpm, accuracy: avgAccuracy });
    }
  }, [phase, correctCount, avgWpm, avgAccuracy, category, recordStageResult]);

  if (phase === "select") {
    return (
      <div className="min-h-screen bg-background pb-20 pt-20">
        <HUD />
        <div className="container mx-auto px-4 max-w-5xl mt-8">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/home">
              <Button variant="ghost" size="icon" data-testid="button-back-home">
                <ArrowLeft />
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-black font-display text-foreground" data-testid="text-cultural-title">
                បញ្ហាប្រឈមវប្បធម៌ / Cultural Challenges
              </h1>
              <p className="text-muted-foreground">Learn Khmer through proverbs, history, and daily phrases</p>
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-8 border-border bg-card mb-8">
            <h2 className="text-2xl font-black mb-6">ជ្រើសរើសប្រភេទ / Choose Category</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(Object.keys(CATEGORY_INFO) as Category[]).map((cat) => {
                const info = CATEGORY_INFO[cat];
                const count = cat === "all" 
                  ? 38 
                  : cat === "proverb" ? KHMER_PROVERBS.length
                  : cat === "history" ? KHMER_HISTORY.length
                  : cat === "daily" ? KHMER_DAILY.length
                  : cat === "greeting" ? KHMER_GREETINGS.length
                  : KHMER_NATURE.length;

                return (
                  <button
                    key={cat}
                    onClick={() => startChallenge(cat)}
                    className={cn(
                      "p-6 rounded-2xl border-2 transition-all text-left group hover:shadow-lg hover:-translate-y-1",
                      "border-border bg-card hover:border-primary/50"
                    )}
                    data-testid={`button-category-${cat}`}
                  >
                    <div className={cn("mb-3", info.color)}>{info.icon}</div>
                    <h3 className="text-xl font-black text-foreground mb-1">{info.label}</h3>
                    <p className="text-sm font-bold text-muted-foreground mb-2">{info.labelKm}</p>
                    <p className="text-xs text-muted-foreground">{count} challenges</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-8 border-border bg-card">
            <h2 className="text-xl font-black mb-4">រៀនវប្បធម៌ខ្មែរ / Learn Khmer Culture</h2>
            <p className="text-muted-foreground mb-4">
              These challenges feature authentic Khmer content including traditional proverbs, 
              historical facts about Angkor and Cambodia, everyday phrases, and nature vocabulary.
            </p>
            <div className="flex gap-2 flex-wrap">
              <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-bold">សុភាសិត</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-bold">អង្គរវត្ត</span>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-bold">ជីវិតប្រចាំថ្ងៃ</span>
              <span className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm font-bold">ការស្វាគមន៍</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-bold">ធម្មជាតិ</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "playing" && currentChallenge) {
    return (
      <div className="min-h-screen bg-background pb-20 pt-20">
        <HUD />
        <div className="container mx-auto px-4 max-w-4xl mt-8">
          <div className="flex items-center justify-between mb-8">
            <Button variant="ghost" size="icon" onClick={() => setPhase("select")}>
              <ArrowLeft />
            </Button>
            <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
              <span className={CATEGORY_INFO[currentChallenge.category].color}>
                {CATEGORY_INFO[currentChallenge.category].icon}
              </span>
              {CATEGORY_INFO[currentChallenge.category].labelKm}
            </div>
            <div className="text-sm font-bold">
              {currentIndex + 1} / {challenges.length}
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-8 border-border bg-card mb-6">
            <div className="mb-6">
              <div className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">
                Type this phrase:
              </div>
              <div className="text-3xl font-khmer leading-relaxed text-foreground mb-4">
                {currentChallenge.text.split("").map((char: string, idx: number) => {
                  const typed = typedText[idx];
                  const isTyped = idx < typedText.length;
                  const isCorrect = typed === char;
                  const isCurrent = idx === typedText.length;

                  return (
                    <span
                      key={idx}
                      className={cn(
                        isTyped ? (isCorrect ? "text-emerald-600" : "text-red-600 underline") : "text-foreground/40",
                        isCurrent && "bg-primary/20"
                      )}
                    >
                      {char}
                    </span>
                  );
                })}
              </div>
              <div className="text-sm text-muted-foreground italic">
                "{currentChallenge.translation}"
              </div>
            </div>

            <input
              ref={inputRef}
              value={typedText}
              onChange={(e) => handleTyping(e.target.value)}
              className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-xl font-khmer text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="សរសេរនៅទីនេះ..."
              data-testid="input-cultural-typing"
              autoFocus
            />

            <div className="mt-6 flex gap-4">
              <Button variant="outline" onClick={skipChallenge} className="gap-2" data-testid="button-skip">
                <X size={16} /> រំលង / Skip
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            {challenges.map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  "h-2 flex-1 rounded-full transition-all",
                  idx < currentIndex
                    ? results[idx]?.correct
                      ? "bg-emerald-500"
                      : "bg-red-400"
                    : idx === currentIndex
                    ? "bg-primary"
                    : "bg-muted"
                )}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (phase === "results") {
    return (
      <div className="min-h-screen bg-background pb-20 pt-20">
        <HUD />
        <div className="container mx-auto px-4 max-w-4xl mt-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🏛️</div>
            <h1 className="text-4xl font-black font-display text-foreground mb-2">
              បញ្ហាប្រឈមបានបញ្ចប់!
            </h1>
            <p className="text-muted-foreground">Challenge Complete!</p>
          </div>

          <div className="glass-panel rounded-3xl p-8 border-border bg-card mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-6 text-center">
                <div className="text-4xl font-black text-emerald-600">{correctCount}/{challenges.length}</div>
                <div className="text-sm font-bold text-emerald-700">Completed</div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 text-center">
                <div className="text-4xl font-black text-blue-600">{avgWpm}</div>
                <div className="text-sm font-bold text-blue-700">Avg WPM</div>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-6 text-center">
                <div className="text-4xl font-black text-amber-600">{avgAccuracy}%</div>
                <div className="text-sm font-bold text-amber-700">Accuracy</div>
              </div>
            </div>

            <div className="space-y-4">
              {challenges.map((challenge, idx) => (
                <div
                  key={challenge.id}
                  className={cn(
                    "p-4 rounded-xl border",
                    results[idx]?.correct
                      ? "border-emerald-200 bg-emerald-50 dark:bg-emerald-900/10"
                      : "border-red-200 bg-red-50 dark:bg-red-900/10"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      results[idx]?.correct ? "bg-emerald-500 text-white" : "bg-red-400 text-white"
                    )}>
                      {results[idx]?.correct ? <Check size={16} /> : <X size={16} />}
                    </div>
                    <div className="flex-1">
                      <div className="font-khmer text-lg text-foreground">{challenge.text}</div>
                      <div className="text-sm text-muted-foreground italic">"{challenge.translation}"</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <Button onClick={() => startChallenge(category)} className="flex-1 h-14 text-lg font-black gap-2">
              <RotateCcw size={20} /> ព្យាយាមម្តងទៀត / Try Again
            </Button>
            <Button variant="outline" onClick={() => setPhase("select")} className="flex-1 h-14 text-lg font-black">
              ប្រភេទផ្សេង / Other Categories
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
