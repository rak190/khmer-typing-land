import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, FileText, Upload, Wand2, RotateCcw, Target, Timer } from "lucide-react";
import { HUD } from "@/components/HUD";
import { Button } from "@/components/ui/button";

function normalizeWords(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((w) => w.trim())
    .filter(Boolean);
}

export const FreeTyping: React.FC = () => {
  const [text, setText] = useState(
    "សួស្តី! ខ្ញុំកំពុងហ្វឹកហាត់វាយអក្សរខ្មែរ។ សូមអរគុណដែលបានមកលេង Khmer Typing Land។"
  );

  const [cursor, setCursor] = useState(0);
  const [typed, setTyped] = useState("");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [endedAt, setEndedAt] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState(0);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const target = useMemo(() => text, [text]);

  const elapsedSec = useMemo(() => {
    const end = endedAt ?? (startedAt ? Date.now() : null);
    if (!startedAt || !end) return 0;
    return Math.max(0, Math.round((end - startedAt) / 1000));
  }, [startedAt, endedAt]);

  const accuracyPct = useMemo(() => {
    const total = Math.max(1, typed.length);
    const wrong = mistakes;
    const correctApprox = Math.max(0, total - wrong);
    return Math.round((correctApprox / total) * 100);
  }, [typed.length, mistakes]);

  const wpm = useMemo(() => {
    if (!startedAt) return 0;
    const minutes = Math.max(1 / 60, elapsedSec / 60);
    const words = normalizeWords(typed).length;
    return Math.round(words / minutes);
  }, [typed, startedAt, elapsedSec]);

  const isComplete = useMemo(() => {
    return cursor >= target.length && target.length > 0;
  }, [cursor, target.length]);

  useEffect(() => {
    if (isComplete && startedAt && !endedAt) {
      setEndedAt(Date.now());
    }
  }, [isComplete, startedAt, endedAt]);

  const reset = () => {
    setCursor(0);
    setTyped("");
    setStartedAt(null);
    setEndedAt(null);
    setMistakes(0);
    window.setTimeout(() => inputRef.current?.focus(), 50);
  };

  const loadFile = async (file: File) => {
    const content = await file.text();
    setText(content.trim() || "");
    reset();
  };

  const onKey = (val: string) => {
    if (endedAt) return;

    if (!startedAt && val.length > 0) {
      setStartedAt(Date.now());
    }

    const nextChar = val.slice(-1);
    const expected = target[cursor] || "";

    if (!expected) return;

    setTyped((t) => t + nextChar);
    if (nextChar !== expected) setMistakes((m) => m + 1);

    setCursor((c) => Math.min(target.length, c + 1));
  };

  const sampleText = () => {
    setText(
      "អង្គរវត្តជាប្រាសាទល្បីនៅកម្ពុជា។ ខ្ញុំចង់រៀនវាយអក្សរឲ្យលឿន និងត្រឹមត្រូវ។ សូមអរគុណ!"
    );
    reset();
  };

  return (
    <div className="min-h-screen bg-background pb-20 pt-20">
      <HUD />

      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/challenges">
            <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-back-free">
              <ArrowLeft />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-4xl font-black font-display text-foreground" data-testid="text-free-title">
              Free Typing Mode
            </h1>
            <p className="text-muted-foreground" data-testid="text-free-subtitle">
              Paste your own text or upload a file, then practice freely.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border-border bg-card">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary mb-4" data-testid="text-free-tools">
              <Wand2 size={14} /> Tools
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase" data-testid="text-editor-label">
                  Custom text
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="mt-2 w-full min-h-[180px] bg-secondary border border-border rounded-2xl px-4 py-3 text-foreground font-body focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="Paste Khmer text, an article, or a story..."
                  data-testid="textarea-custom-text"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="rounded-2xl"
                  onClick={sampleText}
                  data-testid="button-sample-text"
                >
                  <FileText size={16} /> Sample
                </Button>

                <Button
                  variant="outline"
                  className="rounded-2xl"
                  onClick={reset}
                  data-testid="button-reset-free"
                >
                  <RotateCcw size={16} /> Reset
                </Button>
              </div>

              <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-4">
                <div className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2" data-testid="text-upload-label">
                  Upload a .txt file
                </div>
                <label className="flex items-center justify-center gap-2 w-full h-12 rounded-2xl bg-white/70 border border-border hover:bg-white transition-colors cursor-pointer font-bold"
                  data-testid="label-upload"
                >
                  <Upload size={16} /> Choose file
                  <input
                    type="file"
                    accept=".txt,text/plain"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void loadFile(file);
                      e.currentTarget.value = "";
                    }}
                    data-testid="input-upload-file"
                  />
                </label>
                <div className="text-xs text-muted-foreground mt-2" data-testid="text-upload-help">
                  Your text stays on this device (no backend).
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 glass-panel p-8 rounded-3xl border-primary/20 bg-primary/5">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/60 border border-primary/20 flex items-center justify-center" data-testid="icon-free">
                  <Target />
                </div>
                <div>
                  <div className="text-xs font-black uppercase tracking-widest text-primary" data-testid="text-live-free">
                    Live
                  </div>
                  <div className="text-2xl font-black" data-testid="text-progress">
                    {cursor}/{target.length} characters
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-4 py-2 rounded-2xl bg-white/60 border border-primary/20 font-mono font-black text-slate-900 flex items-center gap-2" data-testid="text-timer">
                  <Timer size={16} /> {elapsedSec}s
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white/70 border border-primary/20 p-6">
              <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3" data-testid="text-target">
                Target
              </div>

              <div className="rounded-2xl bg-white border border-border p-5 leading-relaxed text-lg font-khmer text-slate-900" data-testid="text-target-preview">
                <span className="text-slate-900">
                  {target.slice(0, cursor)}
                </span>
                <span className="bg-amber-200/70 rounded px-0.5" data-testid="text-cursor">
                  {target[cursor] || ""}
                </span>
                <span className="text-slate-500">
                  {target.slice(cursor + 1)}
                </span>
              </div>

              <div className="mt-6 flex gap-3">
                <input
                  ref={inputRef}
                  value={""}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (!v) return;
                    onKey(v);
                    e.currentTarget.value = "";
                  }}
                  disabled={isComplete || !target}
                  placeholder={target ? (isComplete ? "Completed" : "Type next character...") : "Add some text first"}
                  className="flex-1 bg-white border border-border rounded-2xl px-5 py-4 text-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60"
                  data-testid="input-free-typing"
                />
                <Button
                  variant="outline"
                  className="h-[58px] rounded-2xl px-6 font-black"
                  onClick={() => inputRef.current?.focus()}
                  data-testid="button-focus-input"
                >
                  Focus
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                <div className="rounded-2xl bg-white border border-border p-4" data-testid="card-free-wpm">
                  <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">WPM</div>
                  <div className="text-2xl font-mono font-black text-primary" data-testid="text-free-wpm">{wpm}</div>
                </div>
                <div className="rounded-2xl bg-white border border-border p-4" data-testid="card-free-accuracy">
                  <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Accuracy</div>
                  <div className="text-2xl font-mono font-black text-green-700" data-testid="text-free-accuracy">{accuracyPct}%</div>
                </div>
                <div className="rounded-2xl bg-white border border-border p-4" data-testid="card-free-mistakes">
                  <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Mistakes</div>
                  <div className="text-2xl font-mono font-black text-red-600" data-testid="text-free-mistakes">{mistakes}</div>
                </div>
                <div className="rounded-2xl bg-white border border-border p-4" data-testid="card-free-status">
                  <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</div>
                  <div className="text-2xl font-black" data-testid="text-free-status">{isComplete ? "Done" : "Typing"}</div>
                </div>
              </div>

              {isComplete && (
                <div className="mt-6 rounded-3xl bg-slate-950 text-white p-6" data-testid="panel-free-result">
                  <div className="text-xs font-black uppercase tracking-[0.25em] text-white/60" data-testid="text-free-result-label">
                    Completed
                  </div>
                  <div className="mt-2 flex items-end justify-between gap-6">
                    <div>
                      <div className="text-4xl font-black" data-testid="text-free-result-wpm">{wpm} WPM</div>
                      <div className="text-white/70" data-testid="text-free-result-sub">
                        {accuracyPct}% accuracy • {elapsedSec}s
                      </div>
                    </div>
                    <Button className="rounded-2xl font-black" onClick={reset} data-testid="button-free-try-again">
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
