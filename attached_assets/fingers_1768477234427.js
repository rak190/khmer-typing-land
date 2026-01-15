// Very practical touch-typing finger hints by physical key.
// Used for finger highlight + label in UI.

export const FINGER = {
  LP: "Left Pinky",
  LR: "Left Ring",
  LM: "Left Middle",
  LI: "Left Index",
  RI: "Right Index",
  RM: "Right Middle",
  RR: "Right Ring",
  RP: "Right Pinky",
  TH: "Thumb"
};

export const CODE_TO_FINGER = {
  // Left pinky
  Backquote:"LP", Digit1:"LP", KeyQ:"LP", KeyA:"LP", KeyZ:"LP",
  Tab:"LP", CapsLock:"LP", ShiftLeft:"LP",

  // Left ring
  Digit2:"LR", KeyW:"LR", KeyS:"LR", KeyX:"LR",

  // Left middle
  Digit3:"LM", KeyE:"LM", KeyD:"LM", KeyC:"LM",

  // Left index
  Digit4:"LI", Digit5:"LI", KeyR:"LI", KeyT:"LI", KeyF:"LI", KeyG:"LI", KeyV:"LI", KeyB:"LI",

  // Right index
  Digit6:"RI", Digit7:"RI", KeyY:"RI", KeyU:"RI", KeyH:"RI", KeyJ:"RI", KeyN:"RI", KeyM:"RI",

  // Right middle
  Digit8:"RM", KeyI:"RM", KeyK:"RM", Comma:"RM",

  // Right ring
  Digit9:"RR", KeyO:"RR", KeyL:"RR", Period:"RR",

  // Right pinky
  Digit0:"RP", Minus:"RP", Equal:"RP", KeyP:"RP",
  BracketLeft:"RP", BracketRight:"RP",
  Semicolon:"RP", Quote:"RP", Slash:"RP",
  Backspace:"RP", Enter:"RP", ShiftRight:"RP",

  // Thumb
  Space:"TH"
};
