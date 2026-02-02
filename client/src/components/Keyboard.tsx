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
  className?: string;
  isModifierNeeded?: boolean;
  isTargetKey?: boolean;
}

const Key: React.FC<KeyProps> = ({ code, w, fixed, active, correct, wrong, mod, className, isModifierNeeded, isTargetKey }) => {
  const map = NIDA_MAP[code];
  
  // Decide what to show
  let label = "";
  let subLabel = "";
  
  if (fixed) {
    label = fixed;
  } else if (map) {
    const { base, shift, altgr } = map;
    if (mod === "SHIFT") {
      label = shift || base;
      subLabel = base;
    } else if (mod === "ALTGR") {
      label = altgr || base;
      subLabel = base;
    } else {
      label = base;
      subLabel = shift || "";
    }
  }

  const isShiftKey = code === "ShiftLeft" || code === "ShiftRight";
  const isCapsLock = code === "CapsLock";
  const isAltGrKey = code === "AltRight";
  const isModifierActive = (isShiftKey && mod === "SHIFT") || (isCapsLock && mod === "SHIFT") || (isAltGrKey && mod === "ALTGR");

  return (
    <div 
      className={cn(
        "key-cap h-11 rounded-lg border border-border text-foreground relative flex items-center justify-center transition-all duration-200",
        w === "w2" && "w-[68px]",
        w === "w3" && "w-[90px]",
        w === "w4" && "w-[112px]",
        w === "w5" && "w-[158px]",
        !w && "w-[46px]",
        active && "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110 z-20 shadow-lg",
        correct && "ring-2 ring-accent ring-offset-2 ring-offset-background scale-110 z-20 shadow-lg bg-accent/20",
        wrong && "ring-2 ring-destructive ring-offset-2 ring-offset-background scale-110 z-20 shadow-lg bg-destructive/20",
        isTargetKey && "bg-primary/20 border-primary/50 text-primary shadow-[0_0_15px_rgba(59,130,246,0.2)]",
        isModifierNeeded && "bg-amber-400/20 border-amber-500/50 text-amber-600 shadow-[0_0_15px_rgba(251,191,36,0.2)]",
        isModifierActive && mod === "SHIFT" && "bg-purple-500/30 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.5)] scale-105 z-10",
        isModifierActive && mod === "ALTGR" && "bg-amber-500/30 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.5)] scale-105 z-10",
        !map && !fixed && "opacity-50",
        className
      )}
    >
      <div className="flex flex-col items-center justify-center leading-tight">
        <span className={cn(
          "text-lg font-black transition-all font-khmer", 
          (isTargetKey || active || isModifierActive) ? "text-primary scale-110" : isModifierNeeded ? "text-amber-600" : "text-slate-600"
        )}>
          {label}
        </span>
        {subLabel && !fixed && (
          <span className={cn(
            "text-[10px] font-khmer font-bold transition-colors",
            mod === "BASE" ? "text-purple-500/60" : "text-slate-400/40"
          )}>
            {subLabel}
          </span>
        )}
      </div>
      
      <span className={cn("absolute right-1 bottom-0.5 text-[8px] font-mono transition-colors", (isTargetKey || active) ? "text-primary/40" : isModifierNeeded ? "text-amber-600/40" : "text-slate-400")}>
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
    { code:"Minus", fixed:"-" },{ code:"Equal", fixed:"=" },{ code:"Backspace", w:"w3", fixed:"⌫" }
  ],
  // Row 2
  [
    { code:"Tab", w:"w2", fixed:"⇥" },
    { code:"KeyQ" },{ code:"KeyW" },{ code:"KeyE" },{ code:"KeyR" },{ code:"KeyT" },{ code:"KeyY" },
    { code:"KeyU" },{ code:"KeyI" },{ code:"KeyO" },{ code:"KeyP" },
    { code:"BracketLeft", fixed:"[" },{ code:"BracketRight", fixed:"]" },
    { code:"Enter", w:"w3", fixed:"↵" }
  ],
  // Row 3
  [
    { code:"CapsLock", w:"w3", fixed:"⇪" },
    { code:"KeyA" },{ code:"KeyS" },{ code:"KeyD" },{ code:"KeyF" },{ code:"KeyG" },{ code:"KeyH" },
    { code:"KeyJ" },{ code:"KeyK" },{ code:"KeyL" },
    { code:"Semicolon", fixed:";" },{ code:"Quote", fixed:"'" }
  ],
  // Row 4
  [
    { code:"ShiftLeft", w:"w4", fixed:"⇧" },
    { code:"KeyZ" },{ code:"KeyX" },{ code:"KeyC" },{ code:"KeyV" },{ code:"KeyB" },{ code:"KeyN" },{ code:"KeyM" },
    { code:"Comma", fixed:"," },{ code:"Period", fixed:"." },{ code:"Slash", fixed:"/" },
    { code:"ShiftRight", w:"w4", fixed:"⇧" }
  ],
  // Row 5
  [
    { code:"Space", w:"w5", fixed:"␣" }
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
      const capsLock = e.getModifierState?.("CapsLock");
      const newMod = altgr ? "ALTGR" : (shift || capsLock) ? "SHIFT" : "BASE";
      setMod(newMod);
      onModChange?.(newMod);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const altgr = e.getModifierState?.("AltGraph") || (e.ctrlKey && e.altKey);
      const shift = e.shiftKey;
      const capsLock = e.getModifierState?.("CapsLock");
      const newMod = altgr ? "ALTGR" : (shift || capsLock) ? "SHIFT" : "BASE";
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
    const name = FINGER[activeFinger as keyof typeof FINGER] || "—";
    return name;
  }, [activeFinger]);

  return (
    <div className={cn(
      "flex flex-col gap-3 p-3 rounded-2xl bg-card/50 border-2 w-fit mx-auto backdrop-blur-sm relative shadow-inner transition-all duration-300",
      mod === "BASE" && "border-border",
      mod === "SHIFT" && "border-purple-500 shadow-[0_0_25px_rgba(168,85,247,0.3)] bg-purple-500/5",
      mod === "ALTGR" && "border-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.3)] bg-amber-500/5",
      className
    )}>
      <div className="flex justify-between items-center text-sm px-1">
        <div className="flex gap-2">
          <div className={cn(
            "flex items-center gap-2 px-2 py-0.5 rounded-full border transition-all duration-300 text-xs",
            mod === "BASE" && "bg-secondary border-border",
            mod === "SHIFT" && "bg-purple-500/20 border-purple-500/50",
            mod === "ALTGR" && "bg-amber-500/20 border-amber-500/50"
          )}>
            <span className={cn(
              "font-bold text-center transition-colors",
              mod === "BASE" && "text-foreground",
              mod === "SHIFT" && "text-purple-600",
              mod === "ALTGR" && "text-amber-600"
            )}>
              {mod === "BASE" ? "មូលដ្ឋាន" : mod === "SHIFT" ? "⬆️ Shift" : "⌥ Alt"}
            </span>
          </div>
          
          {mod !== "BASE" && (
            <div className={cn(
              "flex items-center gap-1 px-2 py-0.5 rounded-full animate-pulse text-xs",
              mod === "SHIFT" && "bg-purple-500/20 text-purple-600",
              mod === "ALTGR" && "bg-amber-500/20 text-amber-600"
            )}>
              <span className="font-bold">
                {mod === "SHIFT" ? "អក្សរ Shift" : "អក្សរ Alt"}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="relative flex flex-col gap-1 items-center z-10">
        {KEY_ROWS.map((row, i) => (
          <div key={i} className="flex gap-1 relative z-10">
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
                  isTargetKey={isTargetKey}
                  isModifierNeeded={isModifierNeeded}
                  className={cn(
                    isTargetKey && "ring-primary/30",
                    isModifierNeeded && "ring-amber-500/30 animate-pulse"
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
