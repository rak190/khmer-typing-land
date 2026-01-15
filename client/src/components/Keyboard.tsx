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
  
  // Decide what to show
  let topLabel = "";
  let botLabel = "";
  
  if (fixed) {
    topLabel = fixed;
  } else if (map) {
    const { base, shift, altgr } = map;
    botLabel = base; // Always show base at bottom
    
    if (mod === "SHIFT") topLabel = shift || base;
    else if (mod === "ALTGR") topLabel = altgr || base;
    else topLabel = base;
  }

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
        !map && !fixed && "opacity-50"
      )}
    >
      <span className={cn("absolute left-2 top-1 text-base font-black transition-colors", active ? "text-white" : "text-blue-100")}>
        {topLabel}
      </span>
      {botLabel && botLabel !== topLabel && (
        <span className={cn("absolute left-2 bottom-1 text-[11px] font-bold transition-colors", active ? "text-white/80" : "text-slate-400")}>
          {botLabel}
        </span>
      )}
      <span className={cn("absolute right-2 bottom-1 text-[9px] font-mono transition-colors", active ? "text-white/40" : "text-slate-600")}>
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
