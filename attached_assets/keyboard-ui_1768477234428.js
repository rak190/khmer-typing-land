import { NIDA_MAP } from "./nida-map.js";
import { CODE_TO_FINGER, FINGER } from "./fingers.js";

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

export class KeyboardUI {
  constructor(rootEl, statePillEl, fingerPillEl){
    this.root = rootEl;
    this.statePill = statePillEl;
    this.fingerPill = fingerPillEl;

    this.mod = "BASE"; // BASE | SHIFT | ALTGR
    this.keyEls = new Map(); // code -> element
    this.activeCode = null;
    this.requiredMod = null;

    this.render();
    this.setMod("BASE");
  }

  render(){
    this.root.innerHTML = "";
    for(const row of KEY_ROWS){
      const rowEl = document.createElement("div");
      rowEl.className = "kbRow";
      for(const k of row){
        const el = document.createElement("div");
        el.className = "key " + (k.w || "");
        el.dataset.code = k.code;

        const top = document.createElement("div");
        top.className = "labTop";
        const bottom = document.createElement("div");
        bottom.className = "labBottom";
        const codeSmall = document.createElement("div");
        codeSmall.className = "code";
        codeSmall.textContent = k.code.replace("Key","");

        el.appendChild(top);
        el.appendChild(bottom);
        el.appendChild(codeSmall);

        if(k.fixed){
          top.textContent = k.fixed;
          bottom.textContent = "";
        }else{
          top.textContent = "";
          bottom.textContent = "";
        }

        rowEl.appendChild(el);
        this.keyEls.set(k.code, el);
      }
      this.root.appendChild(rowEl);
    }
  }

  setMod(mod){
    this.mod = mod;
    this.statePill.textContent = mod;
    this.updateLabels();
  }

  updateLabels(){
    for(const [code, el] of this.keyEls.entries()){
      const m = NIDA_MAP[code];
      const fixed = el.querySelector(".labTop")?.textContent;

      // skip fixed keys like Shift/Tab
      if(!m) continue;

      const labTop = el.querySelector(".labTop");
      const labBottom = el.querySelector(".labBottom");

      const base = m.base ?? "";
      const shift = m.shift ?? "";
      const altgr = m.altgr ?? "";

      // Display rule:
      // - TOP: current layer output (BASE/SHIFT/ALTGR)
      // - BOTTOM: base output (so learners always see base)
      let current = base;
      if(this.mod === "SHIFT") current = shift || base;
      if(this.mod === "ALTGR") current = altgr || base;

      labTop.textContent = current || "";
      labBottom.textContent = base || "";
    }
  }

  clearActive(){
    for(const el of this.keyEls.values()){
      el.classList.remove("active","correctFlash","wrongFlash");
    }
    this.activeCode = null;
    this.requiredMod = null;
    this.fingerPill.textContent = "Finger: —";
  }

  setActiveTarget(code, requiredMod){
    this.clearActive();
    if(!code) return;

    const el = this.keyEls.get(code);
    if(!el) return;

    this.activeCode = code;
    this.requiredMod = requiredMod || "BASE";
    el.classList.add("active");

    const f = CODE_TO_FINGER[code] || null;
    const name = f ? FINGER[f] : "—";
    this.fingerPill.textContent = `Finger: ${name}`;
  }

  flashCorrect(){
    if(!this.activeCode) return;
    const el = this.keyEls.get(this.activeCode);
    if(!el) return;
    el.classList.add("correctFlash");
    setTimeout(()=>el.classList.remove("correctFlash"), 160);
  }

  flashWrong(code){
    const el = this.keyEls.get(code);
    if(!el) return;
    el.classList.add("wrongFlash");
    setTimeout(()=>el.classList.remove("wrongFlash"), 160);
  }
}
