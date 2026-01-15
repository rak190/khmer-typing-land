import React, { useEffect, useMemo } from 'react';
import { NIDA_MAP } from '@/lib/nida-map';
import { CODE_TO_FINGER, FINGER } from '@/lib/fingers';
import { cn } from '@/lib/utils';

interface KeyProps {
  code: string;
  w?: string;
  fixed?: string;
  active?: boolean;
  correct?: boolean;
  wrong?: boolean;
  mod: "BASE" | "SHIFT" | "ALTGR";
}

const Key: React.FC<KeyProps> = ({ code, w, fixed, active, correct, wrong, mod }) => {
  const map = NIDA_MAP[code];
  
  if (fixed) {
    return (
      <div 
        className={cn(
          "key-cap h-14 rounded-xl border border-white/10 text-white relative",
          w === "w2" && "w-[86px]",
          w === "w3" && "w-[114px]",
          w === "w4" && "w-[142px]",
          w === "w5" && "w-[200px]",
          !w && "w-[58px]",
          active && "ring-4 ring-primary ring-offset-4 ring-offset-background scale-105 z-10 shadow-[0_0_30px_hsl(var(--primary)/0.6)] bg-primary/20",
          correct && "ring-4 ring-accent ring-offset-4 ring-offset-background scale-105 z-10 shadow-[0_0_30px_hsl(var(--accent)/0.6)] bg-accent/20",
          wrong && "ring-4 ring-destructive ring-offset-4 ring-offset-background scale-105 z-10 shadow-[0_0_30px_hsl(var(--destructive)/0.6)] bg-destructive/20",
        )}
      >
        <span className="absolute left-2 top-1 text-[11px] font-black opacity-70 uppercase tracking-tighter">{fixed}</span>
      </div>
    );
  }

  if (!map) {
    return (
      <div className={cn("key-cap h-14 rounded-xl border border-white/10 opacity-30", !w ? "w-[58px]" : "")} />
    );
  }

  const { base, shift, altgr } = map;

  return (
    <div 
      className={cn(
        "key-cap h-14 rounded-xl border border-white/10 text-white relative",
        w === "w2" && "w-[86px]",
        w === "w3" && "w-[114px]",
        w === "w4" && "w-[142px]",
        w === "w5" && "w-[200px]",
        !w && "w-[58px]",
        active && "ring-4 ring-primary ring-offset-2 ring-offset-background scale-110 z-20 shadow-[0_0_40px_hsl(var(--primary)/0.7)] bg-primary/30",
        correct && "ring-4 ring-accent ring-offset-2 ring-offset-background scale-110 z-20 shadow-[0_0_40px_hsl(var(--accent)/0.7)] bg-accent/30",
        wrong && "ring-4 ring-destructive ring-offset-2 ring-offset-background scale-110 z-20 shadow-[0_0_40px_hsl(var(--destructive)/0.7)] bg-destructive/30",
      )}
    >
      {/* SHIFT LAYER - Top Left */}
      <span className={cn(
        "absolute left-1.5 top-1 text-[11px] font-black transition-all",
        mod === "SHIFT" ? "text-primary scale-125 translate-x-1" : "text-slate-500 opacity-40",
        active && mod === "SHIFT" && "text-white opacity-100"
      )}>
        {shift}
      </span>

      {/* ALTGR LAYER - Top Right */}
      <span className={cn(
        "absolute right-1.5 top-1 text-[11px] font-black transition-all",
        mod === "ALTGR" ? "text-amber-400 scale-125 -translate-x-1" : "text-slate-500 opacity-40",
        active && mod === "ALTGR" && "text-white opacity-100"
      )}>
        {altgr}
      </span>

      {/* BASE LAYER - Center */}
      <span className={cn(
        "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-lg font-black font-khmer transition-all",
        mod === "BASE" ? "text-white scale-110" : "text-slate-400 opacity-30",
        active && mod === "BASE" && "text-white opacity-100"
      )}>
        {base}
      </span>

      {/* Physical Key ID */}
      <span className="absolute right-1 bottom-0.5 text-[8px] font-mono text-slate-700 font-bold uppercase">
        {code.replace(/Key|Digit/, "")}
      </span>
    </div>
  );
};

const KEY_ROWS = [
  // Row 1
  [
    { code:"Digit1" },{ code:"Digit2" },{ code:"Digit3" },{ code:"Digit4" },{ code:"Digit5" },
    { code:"Digit6" },{ code:"Digit7" },{ code:"Digit8" },{ code:"Digit9" },{ code:"Digit0" },
    { code:"Minus" },{ code:"Equal" },{ code:"Backspace", w:"w3", fixed:"⌫" }
  ],
  // Row 2
  [
    { code:"Tab", w:"w2", fixed:"Tab" },
    { code:"KeyQ" },{ code:"KeyW" },{ code:"KeyE" },{ code:"KeyR" },{ code:"KeyT" },{ code:"KeyY" },
    { code:"KeyU" },{ code:"KeyI" },{ code:"KeyO" },{ code:"KeyP" },
    { code:"BracketLeft" },{ code:"BracketRight" },
    { code:"Enter", w:"w3", fixed:"Enter" }
  ],
  // Row 3
  [
    { code:"CapsLock", w:"w3", fixed:"Caps" },
    { code:"KeyA" },{ code:"KeyS" },{ code:"KeyD" },{ code:"KeyF" },{ code:"KeyG" },{ code:"KeyH" },
    { code:"KeyJ" },{ code:"KeyK" },{ code:"KeyL" },
    { code:"Semicolon" },{ code:"Quote" }
  ],
  // Row 4
  [
    { code:"ShiftLeft", w:"w4", fixed:"Shift" },
    { code:"KeyZ" },{ code:"KeyX" },{ code:"KeyC" },{ code:"KeyV" },{ code:"KeyB" },{ code:"KeyN" },{ code:"KeyM" },
    { code:"Comma" },{ code:"Period" },{ code:"Slash" },
    { code:"ShiftRight", w:"w4", fixed:"Shift" }
  ],
  // Row 5
  [
    { code:"Space", w:"w5", fixed:"Space" }
  ]
];

interface KeyboardProps {
  activeCode: string | null;
  correct?: boolean;
  wrongCode?: string | null;
  className?: string;
  onModChange?: (mod: "BASE" | "SHIFT" | "ALTGR") => void;
}

export const Keyboard: React.FC<KeyboardProps> = ({ activeCode, correct, wrongCode, className, onModChange }) => {
  const [mod, setMod] = React.useState<"BASE" | "SHIFT" | "ALTGR">("BASE");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const altgr = e.getModifierState?.("AltGraph") || (e.ctrlKey && e.altKey);
      const shift = e.shiftKey;
      const newMod = altgr ? "ALTGR" : shift ? "SHIFT" : "BASE";
      setMod(newMod);
      onModChange?.(newMod);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const altgr = e.getModifierState?.("AltGraph") || (e.ctrlKey && e.altKey);
      const shift = e.shiftKey;
      const newMod = altgr ? "ALTGR" : shift ? "SHIFT" : "BASE";
      setMod(newMod);
      onModChange?.(newMod);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [onModChange]);

  const fingerName = useMemo(() => {
    if (!activeCode) return "—";
    const f = CODE_TO_FINGER[activeCode];
    return f ? FINGER[f] : "—";
  }, [activeCode]);

  return (
    <div className={cn("flex flex-col gap-4 p-4 rounded-3xl bg-black/20 border border-white/5 w-full max-w-[1000px] mx-auto backdrop-blur-sm", className)}>
      <div className="flex justify-between items-center text-sm">
        <div className="flex gap-4">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5">
            <span className="text-slate-400">State:</span>
            <span className="font-bold text-white w-12">{mod}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5">
            <span className="text-slate-400">Finger:</span>
            <span className="font-bold text-white text-primary">{fingerName}</span>
          </div>
        </div>
        <div className="text-xs text-slate-500 hidden sm:block">
           Tip: Use <b>Right Alt</b> (AltGr) for AltGr keys. Hold <b>Shift</b> for upper layer.
        </div>
      </div>

      <div className="flex flex-col gap-2 items-center">
        {KEY_ROWS.map((row, i) => (
          <div key={i} className="flex gap-2">
            {row.map(k => (
              <Key 
                key={k.code} 
                {...k} 
                mod={mod} 
                active={activeCode === k.code}
                correct={correct && activeCode === k.code}
                wrong={wrongCode === k.code}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
