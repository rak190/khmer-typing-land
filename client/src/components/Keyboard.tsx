import React, { useEffect, useMemo } from 'react';
import { findKeyForTarget, NIDA_MAP } from '@/lib/nida-map';
import { cn } from '@/lib/utils';

type KeyboardMod = "BASE" | "SHIFT" | "ALTGR";

interface KeyProps {
  code: string;
  span?: number;
  fixed?: string;
  active?: boolean;
  correct?: boolean;
  wrong?: boolean;
  mod: KeyboardMod;
  className?: string;
  isModifierNeeded?: boolean;
  isTargetKey?: boolean;
  needsShift?: boolean;
  compact?: boolean;
}

interface KeyDefinition {
  code: string;
  span?: number;
  fixed?: string;
}

const CODE_LABELS: Record<string, string> = {
  Backquote: "`",
  Digit1: "1",
  Digit2: "2",
  Digit3: "3",
  Digit4: "4",
  Digit5: "5",
  Digit6: "6",
  Digit7: "7",
  Digit8: "8",
  Digit9: "9",
  Digit0: "0",
  Minus: "-",
  Equal: "=",
  BracketLeft: "[",
  BracketRight: "]",
  Backslash: "\\",
  Semicolon: ";",
  Quote: "'",
  Comma: ",",
  Period: ".",
  Slash: "/",
};

const keyLabel = (code: string, fixed?: string) => {
  if (fixed) return fixed;
  return CODE_LABELS[code] || code.replace(/Key|Digit/, "");
};

const layerValue = (code: string, mod: KeyboardMod) => {
  const map = NIDA_MAP[code];
  if (!map) return "";
  if (mod === "SHIFT") return map.shift || map.base;
  if (mod === "ALTGR") return map.altgr || map.base;
  return map.base;
};

const Key: React.FC<KeyProps> = ({
  code,
  span = 4,
  fixed,
  active,
  correct,
  wrong,
  mod,
  className,
  isModifierNeeded,
  isTargetKey,
  needsShift,
  compact,
}) => {
  const map = NIDA_MAP[code];
  const label = keyLabel(code, fixed);
  const khmerUnicode = layerValue(code, mod);

  const isShiftKey = code === "ShiftLeft" || code === "ShiftRight";
  const isCapsLock = code === "CapsLock";
  const isAltGrKey = code === "AltRight";
  const isModifierActive =
    (isShiftKey && mod === "SHIFT") ||
    (isCapsLock && mod === "SHIFT") ||
    (isAltGrKey && mod === "ALTGR");

  const showShiftHint = isModifierNeeded && needsShift && mod === "BASE";
  const hasAltGr = Boolean(map?.altgr);
  const topHint = mod === "SHIFT" ? map?.base : map?.shift;
  const rightHint = mod === "ALTGR" ? map?.base : map?.altgr;
  const fillBackground = wrong
    ? "linear-gradient(180deg, rgba(239,68,68,0.9), rgba(185,28,28,0.92))"
    : correct
      ? "linear-gradient(180deg, rgba(34,197,94,0.9), rgba(21,128,61,0.92))"
      : isTargetKey
        ? "linear-gradient(180deg, color-mix(in srgb, var(--primary), white 24%), var(--primary))"
        : isModifierNeeded
          ? "linear-gradient(180deg, rgba(251,191,36,0.95), rgba(245,158,11,0.95))"
          : isModifierActive && mod === "SHIFT"
            ? "linear-gradient(180deg, rgba(168,85,247,0.9), rgba(126,34,206,0.92))"
            : isModifierActive && mod === "ALTGR"
              ? "linear-gradient(180deg, rgba(245,158,11,0.9), rgba(217,119,6,0.92))"
              : undefined;
  const fillShadow = wrong
    ? "0 4px 0 rgba(127,29,29,0.7), 0 0 20px rgba(239,68,68,0.35)"
    : correct
      ? "0 4px 0 rgba(20,83,45,0.7), 0 0 20px rgba(34,197,94,0.35)"
      : isTargetKey
        ? "0 4px 0 color-mix(in srgb, var(--primary), black 28%), 0 0 24px color-mix(in srgb, var(--primary), transparent 35%)"
        : isModifierNeeded || isModifierActive
          ? "0 4px 0 rgba(146,64,14,0.75), 0 0 22px rgba(245,158,11,0.35)"
          : undefined;
  const filledKey = Boolean(fillBackground);

  return (
    <div
      className={cn(
        "key-cap min-w-0 rounded-md border border-border text-foreground relative flex items-center justify-center overflow-visible transition-all duration-200",
        compact ? "h-8 sm:h-9 lg:h-9" : "h-11 sm:h-12 lg:h-14",
        active && "ring-2 ring-primary ring-offset-2 ring-offset-background z-20 shadow-lg",
        correct && "ring-2 ring-accent ring-offset-2 ring-offset-background z-20 shadow-lg border-accent text-white",
        wrong && "ring-2 ring-destructive ring-offset-2 ring-offset-background z-20 shadow-lg border-destructive text-white",
        isTargetKey && "border-primary text-white",
        isModifierNeeded && "border-amber-500 text-amber-950",
        isModifierActive && mod === "SHIFT" && "border-purple-500 text-white z-10",
        isModifierActive && mod === "ALTGR" && "border-amber-500 text-amber-950 z-10",
        !map && !fixed && "opacity-50",
        className
      )}
      style={{
        gridColumn: `span ${span}`,
        ...(fillBackground ? { background: fillBackground } : {}),
        ...(fillShadow ? { boxShadow: fillShadow } : {}),
      }}
    >
      {showShiftHint && (
        <div className="absolute -top-10 left-1/2 z-50 -translate-x-1/2 animate-bounce">
          <div className="rounded bg-purple-600 px-2 py-1 text-[10px] font-bold text-white shadow-lg whitespace-nowrap">
            Hold Shift
          </div>
        </div>
      )}

      {map && topHint && (
        <span className={cn(
          "absolute left-1 top-0.5 max-w-[42%] truncate font-khmer font-bold leading-none text-muted-foreground sm:left-1.5",
          compact ? "text-[7px] sm:top-0.5 sm:text-[8px]" : "text-[9px] sm:top-1 sm:text-[10px]"
        )}>
          {topHint}
        </span>
      )}

      {map && hasAltGr && rightHint && (
        <span className={cn(
          "absolute right-1 top-0.5 max-w-[42%] truncate font-khmer font-bold leading-none text-amber-600/80 sm:right-1.5",
          compact ? "text-[7px] sm:top-0.5 sm:text-[8px]" : "text-[9px] sm:top-1 sm:text-[10px]"
        )}>
          {rightHint}
        </span>
      )}

      <div className="flex min-w-0 flex-col items-center justify-center px-1 text-center leading-tight">
        <span
          className={cn(
            map
              ? compact ? "font-khmer text-base font-black sm:text-lg" : "font-khmer text-lg font-black sm:text-xl"
              : compact ? "text-[9px] font-black uppercase tracking-normal sm:text-[10px]" : "text-[11px] font-black uppercase tracking-normal sm:text-xs",
            filledKey
              ? wrong || correct || isTargetKey || (isModifierActive && mod === "SHIFT") ? "text-white" : "text-amber-950"
              : isModifierNeeded
                ? "text-amber-600"
                : "text-slate-600 dark:text-slate-200",
            needsShift && mod === "BASE" && !filledKey && "text-purple-500"
          )}
        >
          {map ? khmerUnicode || label : label}
        </span>
      </div>

      <span
        className={cn(
          "absolute bottom-0.5 right-1 font-mono leading-none transition-colors sm:right-1.5",
          compact ? "text-[7px]" : "text-[8px] sm:text-[9px]",
          filledKey ? "text-white/75" : isTargetKey || active ? "text-primary/50" : isModifierNeeded ? "text-amber-600/50" : "text-slate-400"
        )}
      >
        {label}
      </span>
    </div>
  );
};

const KEY_ROWS: KeyDefinition[][] = [
  [
    { code: "Backquote" },
    { code: "Digit1" },
    { code: "Digit2" },
    { code: "Digit3" },
    { code: "Digit4" },
    { code: "Digit5" },
    { code: "Digit6" },
    { code: "Digit7" },
    { code: "Digit8" },
    { code: "Digit9" },
    { code: "Digit0" },
    { code: "Minus" },
    { code: "Equal" },
    { code: "Backspace", span: 8, fixed: "Backspace" },
  ],
  [
    { code: "Tab", span: 6, fixed: "Tab" },
    { code: "KeyQ" },
    { code: "KeyW" },
    { code: "KeyE" },
    { code: "KeyR" },
    { code: "KeyT" },
    { code: "KeyY" },
    { code: "KeyU" },
    { code: "KeyI" },
    { code: "KeyO" },
    { code: "KeyP" },
    { code: "BracketLeft" },
    { code: "BracketRight" },
    { code: "Backslash", span: 6 },
  ],
  [
    { code: "CapsLock", span: 7, fixed: "Caps" },
    { code: "KeyA" },
    { code: "KeyS" },
    { code: "KeyD" },
    { code: "KeyF" },
    { code: "KeyG" },
    { code: "KeyH" },
    { code: "KeyJ" },
    { code: "KeyK" },
    { code: "KeyL" },
    { code: "Semicolon" },
    { code: "Quote" },
    { code: "Enter", span: 9, fixed: "Enter" },
  ],
  [
    { code: "ShiftLeft", span: 9, fixed: "Shift" },
    { code: "KeyZ" },
    { code: "KeyX" },
    { code: "KeyC" },
    { code: "KeyV" },
    { code: "KeyB" },
    { code: "KeyN" },
    { code: "KeyM" },
    { code: "Comma" },
    { code: "Period" },
    { code: "Slash" },
    { code: "ShiftRight", span: 11, fixed: "Shift" },
  ],
  [
    { code: "ControlLeft", span: 6, fixed: "Ctrl" },
    { code: "MetaLeft", span: 5, fixed: "Win" },
    { code: "AltLeft", span: 5, fixed: "Alt" },
    { code: "Space", span: 28, fixed: "Space" },
    { code: "AltRight", span: 6, fixed: "AltGr" },
    { code: "ContextMenu", span: 4, fixed: "Menu" },
    { code: "ControlRight", span: 6, fixed: "Ctrl" },
  ],
];

interface KeyboardProps {
  activeCode: string | null;
  correct?: boolean;
  wrongCode?: string | null;
  className?: string;
  onModChange?: (mod: KeyboardMod) => void;
  target?: string;
  compact?: boolean;
}

export const Keyboard: React.FC<KeyboardProps> = ({
  activeCode,
  correct,
  wrongCode,
  className,
  onModChange,
  target,
  compact,
}) => {
  const [mod, setMod] = React.useState<KeyboardMod>("BASE");

  useEffect(() => {
    const updateMod = (e: KeyboardEvent) => {
      const altgr = e.getModifierState?.("AltGraph") || (e.ctrlKey && e.altKey);
      const shift = e.shiftKey;
      const capsLock = e.getModifierState?.("CapsLock");
      const newMod = altgr ? "ALTGR" : (shift || capsLock) ? "SHIFT" : "BASE";
      setMod(newMod);
      onModChange?.(newMod);
    };

    window.addEventListener("keydown", updateMod);
    window.addEventListener("keyup", updateMod);
    return () => {
      window.removeEventListener("keydown", updateMod);
      window.removeEventListener("keyup", updateMod);
    };
  }, [onModChange]);

  const targetKey = useMemo(() => (target ? findKeyForTarget(target) : null), [target]);
  const needsShift = targetKey?.mod === "SHIFT";
  const needsAltGr = targetKey?.mod === "ALTGR";

  return (
    <div
      className={cn(
        "w-full rounded-2xl border border-slate-200 shadow-sm backdrop-blur-sm transition-all duration-300",
        compact ? "max-w-[960px] px-2 py-2 sm:px-3" : "max-w-[1120px] px-3 py-3 sm:px-5 sm:py-4",
        mod === "BASE" && "bg-slate-50/50",
        mod === "SHIFT" && "border-purple-500 bg-purple-500/10 shadow-[0_0_50px_rgba(168,85,247,0.4)]",
        mod === "ALTGR" && "border-amber-500 bg-amber-500/10 shadow-[0_0_50px_rgba(245,158,11,0.4)]",
        className
      )}
    >
      <div className={cn("flex items-center justify-between gap-3 px-1 text-sm", compact ? "mb-1" : "mb-2")}>
        <div
          className={cn(
            "rounded-full border text-xs font-black transition-all duration-300",
            compact ? "px-2 py-0.5" : "px-3 py-1 sm:text-sm",
            mod === "BASE" && "border-border bg-secondary text-foreground",
            mod === "SHIFT" && "border-purple-400 bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]",
            mod === "ALTGR" && "border-amber-400 bg-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.5)]"
          )}
        >
          {mod === "BASE" ? "Base layout" : mod === "SHIFT" ? "Shift layer" : "AltGr layer"}
        </div>

        {(needsShift || needsAltGr) && (
          <div
            className={cn(
              "rounded-full border text-xs font-bold",
              compact ? "px-2 py-0.5" : "px-3 py-1 sm:text-sm",
              needsShift && "border-purple-300 bg-purple-100 text-purple-700",
              needsAltGr && "border-amber-300 bg-amber-100 text-amber-700"
            )}
          >
            {needsShift ? "Use Shift" : "Use AltGr"}
          </div>
        )}
      </div>

      <div className="overflow-x-auto pb-1">
        <div
          className={cn(
            "mx-auto grid gap-1",
            compact ? "min-w-[680px] max-w-[900px]" : "min-w-[760px] max-w-[1040px] sm:gap-1.5"
          )}
          style={{ gridTemplateColumns: "repeat(60, minmax(0, 1fr))" }}
        >
          {KEY_ROWS.flatMap((row, rowIndex) =>
            row.map((key, keyIndex) => {
              const isModifierNeeded =
                (needsShift && (key.code === "ShiftLeft" || key.code === "ShiftRight")) ||
                (needsAltGr && key.code === "AltRight");
              const isTargetKey = activeCode === key.code;

              return (
                <React.Fragment key={`${rowIndex}-${key.code}`}>
                  {keyIndex === 0 && rowIndex > 0 && <div className="col-span-full h-0" />}
                  <Key
                    {...key}
                    mod={mod}
                    active={isTargetKey || isModifierNeeded}
                    correct={correct && isTargetKey}
                    wrong={wrongCode === key.code}
                    isTargetKey={isTargetKey}
                    isModifierNeeded={isModifierNeeded}
                    needsShift={needsShift && isTargetKey}
                    compact={compact}
                    className={cn(
                      isTargetKey && "ring-primary/30",
                      isModifierNeeded && "animate-pulse ring-amber-500/30"
                    )}
                  />
                </React.Fragment>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
