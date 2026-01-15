// NiDA Khmer mapping for keydown by event.code
// base = no modifier, shift = Shift, altgr = RightAlt (AltGraph) or Ctrl+Alt

export interface KeyMap {
  base: string;
  shift: string;
  altgr: string;
}

export const NIDA_MAP: Record<string, KeyMap> = {
  // Number row
  Digit1: { base: "១", shift: "!", altgr: "" },
  Digit2: { base: "២", shift: "@", altgr: "" },
  Digit3: { base: "៣", shift: "\"", altgr: "" },
  Digit4: { base: "៤", shift: "$", altgr: "" },
  Digit5: { base: "៥", shift: "%", altgr: "" },
  Digit6: { base: "៦", shift: "^", altgr: "" },
  Digit7: { base: "៧", shift: "&", altgr: "" },
  Digit8: { base: "៨", shift: "*", altgr: "" },
  Digit9: { base: "៩", shift: "(", altgr: "" },
  Digit0: { base: "០", shift: ")", altgr: "" },

  Minus: { base: "ឥ", shift: "៌", altgr: "" },
  Equal: { base: "ឲ", shift: "=", altgr: "" },

  // Q row
  KeyQ: { base: "ឆ", shift: "ឈ", altgr: "" },
  KeyW: { base: "ឹ", shift: "ឺ", altgr: "" },
  KeyE: { base: "េ", shift: "ែ", altgr: "ឯ" },
  KeyR: { base: "រ", shift: "ឬ", altgr: "ឫ" },
  KeyT: { base: "ត", shift: "ទ", altgr: "" },
  KeyY: { base: "យ", shift: "ួ", altgr: "" },
  KeyU: { base: "ុ", shift: "ូ", altgr: "" },
  KeyI: { base: "ិ", shift: "ី", altgr: "ឦ" },
  KeyO: { base: "ោ", shift: "ៅ", altgr: "ឱ" },
  KeyP: { base: "ផ", shift: "ភ", altgr: "ឰ" },
  BracketLeft: { base: "ៀ", shift: "ឿ", altgr: "ឩ" },
  BracketRight:{ base: "ឪ", shift: "ឧ", altgr: "ឳ" },

  // A row
  KeyA: { base: "ា", shift: "ាំ", altgr: "" },
  KeyS: { base: "ស", shift: "ៃ", altgr: "" },
  KeyD: { base: "ដ", shift: "ឌ", altgr: "" },
  KeyF: { base: "ថ", shift: "ធ", altgr: "" },
  KeyG: { base: "ង", shift: "អ", altgr: "" },
  KeyH: { base: "ហ", shift: "ះ", altgr: "" },
  KeyJ: { base: "្", shift: "ញ", altgr: "" },
  KeyK: { base: "ក", shift: "គ", altgr: "" },
  KeyL: { base: "ល", shift: "ឡ", altgr: "" },
  Semicolon:{ base: "ើ", shift: "ោះ", altgr: "៖" },
  Quote: { base: "់", shift: "៉", altgr: "ៈ" },

  // Z row
  KeyZ: { base: "ឋ", shift: "ឍ", altgr: "" },
  KeyX: { base: "ខ", shift: "ឃ", altgr: "" },
  KeyC: { base: "ច", shift: "ជ", altgr: "" },
  KeyV: { base: "វ", shift: "េះ", altgr: "" },
  KeyB: { base: "ប", shift: "ព", altgr: "" },
  KeyN: { base: "ន", shift: "ណ", altgr: "" },
  KeyM: { base: "ម", shift: "ំ", altgr: "" },
  Comma: { base: "ុំ", shift: "ុះ", altgr: "," },
  Period:{ base: "។", shift: "៕", altgr: "." },
  Slash: { base: "៊", shift: "?", altgr: "/" },

  Space: { base: " ", shift: " ", altgr: " " }
};

export function nidaFromEvent(e: KeyboardEvent | React.KeyboardEvent): string | null {
  const m = NIDA_MAP[e.code];
  if(!m) return null;

  const altgr = e.getModifierState?.("AltGraph") || (e.ctrlKey && e.altKey);
  const shift = e.shiftKey;

  const out = altgr ? (m.altgr || "") : shift ? (m.shift || "") : (m.base || "");
  return out || null;
}

export function findKeyForTarget(target: string): { code: string, mod: "BASE" | "SHIFT" | "ALTGR" } | null {
  for(const [code, v] of Object.entries(NIDA_MAP)){
    if(v.base === target) return { code, mod:"BASE" };
    if(v.shift === target) return { code, mod:"SHIFT" };
    if(v.altgr === target) return { code, mod:"ALTGR" };
  }
  return null;
}
