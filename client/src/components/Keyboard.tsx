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

const Key: React.FC<KeyProps> = ({ code, w, fixed, active, correct, wrong, mod, className }) => {
  const map = NIDA_MAP[code];
  
  // Decide what to show
  let label = "";
  
  if (fixed) {
    label = fixed;
  } else if (map) {
    const { base, shift, altgr } = map;
    if (mod === "SHIFT") label = shift || base;
    else if (mod === "ALTGR") label = altgr || base;
    else label = base;
  }

  return (
    <div 
      className={cn(
        "key-cap h-11 rounded-lg border border-border text-foreground relative flex items-center justify-center transition-all duration-200",
        w === "w2" && "w-[68px]",
        w === "w3" && "w-[90px]",
        w === "w4" && "w-[112px]",
        w === "w5" && "w-[158px]",
        !w && "w-[46px]",
        active && "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110 z-20 shadow-lg bg-primary/10",
        correct && "ring-2 ring-accent ring-offset-2 ring-offset-background scale-110 z-20 shadow-lg bg-accent/10",
        wrong && "ring-2 ring-destructive ring-offset-2 ring-offset-background scale-110 z-20 shadow-lg bg-destructive/10",
        !map && !fixed && "opacity-50",
        className
      )}
    >
      <span className={cn("text-lg font-black transition-all font-khmer", active ? "text-primary scale-110" : "text-slate-600")}>
        {label}
      </span>
      
      <span className={cn("absolute right-1 bottom-0.5 text-[8px] font-mono transition-colors", active ? "text-primary/40" : "text-slate-400")}>
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
  target?: string;
}

const HandsOverlay: React.FC<{ activeFinger: string | null; target?: string }> = ({ activeFinger, target }) => {
  const needsShift = target && Object.values(NIDA_MAP).some(m => m.shift === target);
  const needsAltGr = target && Object.values(NIDA_MAP).some(m => m.altgr === target);

  return (
    <div className="absolute inset-0 pointer-events-none z-0">
      <div className="absolute inset-0 flex justify-between px-2 items-center overflow-hidden">
        {/* Left Hand */}
        <div className="relative flex gap-1.5 items-end opacity-20 translate-x-12">
          {['LP', 'LR', 'LM', 'LI', 'TH'].map((f) => {
            const isTarget = activeFinger === f;
            const isModifier = (f === 'LP' && needsShift);
            return (
              <div 
                key={f}
                className={cn(
                  "w-10 rounded-t-full transition-all duration-300 bg-slate-800/80",
                  f === 'TH' ? "h-14 origin-right rotate-[-30deg]" : 
                  f === 'LP' ? "h-24" :
                  f === 'LR' ? "h-28" :
                  f === 'LM' ? "h-32" : "h-28",
                  isTarget && "bg-primary opacity-100 h-36 shadow-[0_0_40px_hsl(var(--primary))]",
                  isModifier && "bg-amber-400 opacity-80 h-32 shadow-[0_0_30px_rgba(251,191,36,0.5)] animate-pulse"
                )}
              />
            );
          })}
        </div>
        {/* Right Hand */}
        <div className="relative flex gap-1.5 items-end opacity-20 -translate-x-12">
          {['TH', 'RI', 'RM', 'RR', 'RP'].map((f) => {
            const isTarget = activeFinger === f;
            const isModifier = (f === 'RP' && (needsShift || needsAltGr));
            return (
              <div 
                key={f}
                className={cn(
                  "w-10 rounded-t-full transition-all duration-300 bg-slate-800/80",
                  f === 'TH' ? "h-14 origin-left rotate-[30deg]" :
                  f === 'RP' ? "h-24" :
                  f === 'RR' ? "h-28" :
                  f === 'RM' ? "h-32" : "h-28",
                  isTarget && "bg-primary opacity-100 h-36 shadow-[0_0_40px_hsl(var(--primary))]",
                  isModifier && "bg-amber-400 opacity-80 h-32 shadow-[0_0_30px_rgba(251,191,36,0.5)] animate-pulse"
                )}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const Keyboard: React.FC<KeyboardProps> = ({ activeCode, correct, wrongCode, className, onModChange, target }) => {
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

  const activeFinger = useMemo(() => {
    if (!activeCode) return null;
    return CODE_TO_FINGER[activeCode] || null;
  }, [activeCode]);

  // Determine if modifiers are needed for the current target
  const targetMapEntry = useMemo(() => {
    if (!target) return null;
    const entry = Object.entries(NIDA_MAP).find(([_, m]) => m.shift === target || m.altgr === target || m.base === target);
    return entry || null;
  }, [target]);

  const needsShift = targetMapEntry ? (targetMapEntry[1] as any).shift === target : false;
  const needsAltGr = targetMapEntry ? (targetMapEntry[1] as any).altgr === target : false;

  const fingerName = useMemo(() => {
    if (!activeFinger) return "—";
    let name = FINGER[activeFinger as keyof typeof FINGER] || "—";
    if (needsShift) name = `Shift + ${name}`;
    if (needsAltGr) name = `AltGr + ${name}`;
    return name;
  }, [activeFinger, needsShift, needsAltGr]);

  return (
    <div className={cn("flex flex-col gap-4 p-4 rounded-3xl bg-card/50 border border-border w-full max-w-[1000px] mx-auto backdrop-blur-sm relative shadow-inner", className)}>
      <div className="flex justify-between items-center text-sm">
        <div className="flex gap-4">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-secondary border border-border">
            <span className="text-muted-foreground">State:</span>
            <span className="font-bold text-foreground w-12">{mod}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-secondary border border-border">
            <span className="text-muted-foreground">Finger:</span>
            <span className="font-bold text-primary">See Highlight</span>
          </div>
        </div>
        <div className="text-xs text-muted-foreground hidden sm:block italic">
           Follow the <b>Glow</b>: Amber for Modifiers, Blue for Characters.
        </div>
      </div>

      <div className="relative flex flex-col gap-1.5 items-center z-10">
        <div className="absolute inset-x-0 top-0 bottom-0 pointer-events-none opacity-40 z-0">
          <HandsOverlay activeFinger={activeFinger} target={target} />
        </div>

        {KEY_ROWS.map((row, i) => (
          <div key={i} className="flex gap-1.5 relative z-10">
            {row.map(k => {
              const isModifierNeeded = (needsShift && (k.code === "ShiftLeft" || k.code === "ShiftRight")) || 
                                       (needsAltGr && k.code === "AltRight");
              const isTargetKey = activeCode === k.code;
              
              return (
                <Key 
                  key={k.code} 
                  {...k} 
                  mod={mod} 
                  active={isTargetKey || isModifierNeeded}
                  correct={correct && isTargetKey}
                  wrong={wrongCode === k.code}
                  className={cn(
                    isTargetKey && "shadow-[0_0_20px_rgba(59,130,246,0.3)] border-primary ring-2 ring-primary/30",
                    isModifierNeeded && "shadow-[0_0_20px_rgba(251,191,36,0.3)] border-amber-500 ring-2 ring-amber-500/30 animate-pulse"
                  )}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
