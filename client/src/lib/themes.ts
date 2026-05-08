export interface Theme {
  id: string;
  name: string;
  nameKh: string;
  icon: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground?: string;
  };
  scene?: {
    label: string;
    landscape: string;
    sky: string;
    ground: string;
    pattern: string;
    mascot: string;
    accents: string[];
    backgroundImage: string;
    patternImage: string;
    patternSize: string;
  };
  description: string;
}

const SCENES = {
  angkor: {
    label: "Temple Quest",
    landscape: "Ancient temple path",
    sky: "hsl(199, 92%, 88%)",
    ground: "hsl(142, 42%, 78%)",
    pattern: "carved temple blocks",
    mascot: "🏛️",
    accents: ["🪷", "✨", "🌱"],
    backgroundImage:
      "linear-gradient(180deg, hsl(199 92% 95%) 0%, hsl(46 85% 96%) 48%, hsl(142 45% 92%) 100%), repeating-linear-gradient(90deg, transparent 0 34px, hsl(199 70% 85% / 0.24) 34px 36px)",
    patternImage:
      "repeating-linear-gradient(90deg, transparent 0 30px, color-mix(in srgb, var(--primary), transparent 86%) 30px 32px), repeating-linear-gradient(0deg, transparent 0 30px, color-mix(in srgb, var(--accent), transparent 90%) 30px 32px)",
    patternSize: "96px 96px",
  },
  lotus: {
    label: "Lotus Pond",
    landscape: "Floating lotus garden",
    sky: "hsl(330, 92%, 93%)",
    ground: "hsl(174, 50%, 83%)",
    pattern: "lotus petals and water",
    mascot: "🪷",
    accents: ["🌸", "💧", "✨"],
    backgroundImage:
      "linear-gradient(180deg, hsl(330 90% 97%) 0%, hsl(330 76% 95%) 45%, hsl(174 55% 91%) 100%), repeating-radial-gradient(ellipse at 50% 100%, hsl(330 80% 78% / 0.18) 0 8px, transparent 9px 34px)",
    patternImage:
      "repeating-radial-gradient(ellipse at 50% 70%, color-mix(in srgb, var(--primary), transparent 82%) 0 9px, transparent 10px 36px)",
    patternSize: "120px 72px",
  },
  krama: {
    label: "Krama Picnic",
    landscape: "Khmer scarf picnic mat",
    sky: "hsl(32, 92%, 92%)",
    ground: "hsl(12, 72%, 88%)",
    pattern: "krama check pattern",
    mascot: "🧣",
    accents: ["🍊", "⭐", "🏺"],
    backgroundImage:
      "linear-gradient(180deg, hsl(32 90% 97%) 0%, hsl(28 86% 94%) 100%), repeating-linear-gradient(90deg, hsl(0 80% 50% / 0.12) 0 10px, transparent 10px 24px), repeating-linear-gradient(0deg, hsl(0 80% 50% / 0.1) 0 10px, transparent 10px 24px)",
    patternImage:
      "repeating-linear-gradient(90deg, color-mix(in srgb, var(--primary), transparent 82%) 0 8px, transparent 8px 20px), repeating-linear-gradient(0deg, color-mix(in srgb, var(--primary), transparent 86%) 0 8px, transparent 8px 20px)",
    patternSize: "80px 80px",
  },
  forest: {
    label: "Forest Trail",
    landscape: "Emerald learning forest",
    sky: "hsl(155, 70%, 90%)",
    ground: "hsl(95, 58%, 78%)",
    pattern: "leaf trail",
    mascot: "🌳",
    accents: ["🌿", "🍃", "✨"],
    backgroundImage:
      "linear-gradient(180deg, hsl(155 74% 96%) 0%, hsl(126 55% 93%) 52%, hsl(86 52% 88%) 100%), repeating-linear-gradient(135deg, hsl(160 70% 40% / 0.13) 0 10px, transparent 10px 42px)",
    patternImage:
      "repeating-linear-gradient(135deg, color-mix(in srgb, var(--primary), transparent 84%) 0 9px, transparent 9px 38px)",
    patternSize: "110px 110px",
  },
  royal: {
    label: "Palace Stars",
    landscape: "Golden palace classroom",
    sky: "hsl(45, 100%, 90%)",
    ground: "hsl(31, 90%, 84%)",
    pattern: "gold star tiles",
    mascot: "👑",
    accents: ["⭐", "✨", "🏰"],
    backgroundImage:
      "linear-gradient(180deg, hsl(45 100% 96%) 0%, hsl(42 92% 91%) 55%, hsl(31 88% 90%) 100%), repeating-conic-gradient(from 45deg, hsl(45 100% 50% / 0.13) 0 12.5%, transparent 0 25%)",
    patternImage:
      "repeating-conic-gradient(from 45deg, color-mix(in srgb, var(--primary), transparent 82%) 0 12.5%, transparent 0 25%)",
    patternSize: "72px 72px",
  },
  ocean: {
    label: "Mekong Wave",
    landscape: "Blue river typing ride",
    sky: "hsl(200, 90%, 91%)",
    ground: "hsl(184, 62%, 84%)",
    pattern: "soft river waves",
    mascot: "🌊",
    accents: ["💧", "⛵", "✨"],
    backgroundImage:
      "linear-gradient(180deg, hsl(200 94% 96%) 0%, hsl(190 82% 93%) 50%, hsl(184 70% 90%) 100%), repeating-radial-gradient(ellipse at 0% 100%, hsl(200 90% 45% / 0.14) 0 10px, transparent 11px 38px)",
    patternImage:
      "repeating-radial-gradient(ellipse at 0% 100%, color-mix(in srgb, var(--primary), transparent 84%) 0 9px, transparent 10px 34px)",
    patternSize: "120px 80px",
  },
};

export const WORLD_THEMES: Record<string, Theme> = {
  "w1": {
    id: "world-1",
    name: "Ancient Angkor",
    nameKh: "អង្គរដ៏បុរាណ",
    icon: "🏛️",
    colors: {
      primary: "hsl(199, 92%, 45%)",
      secondary: "hsl(220, 20%, 92%)",
      accent: "hsl(142, 76%, 30%)",
      background: "hsl(220, 100%, 98%)",
    },
    scene: SCENES.angkor,
    description: "ពណ៌ខៀវ និងមាស បំផុសគំនិតពីអង្គរវត្ត",
  },
  "w2": {
    id: "world-2",
    name: "Emerald Jungle",
    nameKh: "ព្រៃមរកត",
    icon: "🌳",
    colors: {
      primary: "hsl(160, 70%, 40%)",
      secondary: "hsl(150, 20%, 92%)",
      accent: "hsl(80, 60%, 50%)",
      background: "hsl(140, 30%, 98%)",
    },
    scene: SCENES.forest,
    description: "ពណ៌បៃតងស្រស់ បំផុសគំនិតពីព្រៃខ្មែរ",
  },
  "w3": {
    id: "world-3",
    name: "Golden Palace",
    nameKh: "វាំងមាស",
    icon: "👑",
    colors: {
      primary: "hsl(45, 100%, 50%)",
      secondary: "hsl(45, 20%, 92%)",
      accent: "hsl(30, 100%, 45%)",
      background: "hsl(40, 40%, 98%)",
    },
    scene: SCENES.royal,
    description: "ពណ៌មាសប្រណិត សមស្របនឹងរចនាបថរាជវាំង",
  },
  "w4": {
    id: "world-4",
    name: "Lotus Pond",
    nameKh: "បឹងឈូក",
    icon: "🪷",
    colors: {
      primary: "hsl(330, 80%, 60%)",
      secondary: "hsl(330, 20%, 95%)",
      accent: "hsl(330, 100%, 70%)",
      background: "hsl(330, 40%, 98%)",
    },
    scene: SCENES.lotus,
    description: "ពណ៌ផ្កាឈូកស្រស់ស្អាត បំផុសគំនិតពីផ្កាឈូក",
  },
  "w5": {
    id: "world-5",
    name: "Krama Spirit",
    nameKh: "វិញ្ញាណក្រមា",
    icon: "🧣",
    colors: {
      primary: "hsl(0, 80%, 50%)",
      secondary: "hsl(0, 10%, 95%)",
      accent: "hsl(30, 100%, 50%)",
      background: "hsl(30, 30%, 98%)",
    },
    scene: SCENES.krama,
    description: "ពណ៌ក្រហមកក់ក្តៅ បំផុសគំនិតពីក្រមាខ្មែរ",
  },
  "w6": {
    id: "world-6",
    name: "Mekong River",
    nameKh: "ទន្លេមេគង្គ",
    icon: "🌊",
    colors: {
      primary: "hsl(200, 90%, 45%)",
      secondary: "hsl(200, 20%, 92%)",
      accent: "hsl(180, 70%, 40%)",
      background: "hsl(200, 40%, 98%)",
    },
    scene: SCENES.ocean,
    description: "ពណ៌ខៀវស្ងប់ស្ងាត់ សម្រាប់ការវាយអក្សរបែបស្រួលចិត្ត",
  },
  "w7": {
    id: "world-7",
    name: "Sunset Beach",
    nameKh: "ឆ្នេរថ្ងៃលិច",
    icon: "🏖️",
    colors: {
      primary: "hsl(25, 100%, 50%)",
      secondary: "hsl(25, 20%, 95%)",
      accent: "hsl(45, 100%, 50%)",
      background: "hsl(25, 40%, 98%)",
    },
    scene: SCENES.krama,
    description: "ពណ៌ទឹកក្រូច និងលឿងកក់ក្តៅ ដូចថ្ងៃលិចលើឆ្នេរ",
  },
  "w8": {
    id: "world-8",
    name: "Highland Mist",
    nameKh: "អ័ព្ទតំបន់ខ្ពង់រាប",
    icon: "☁️",
    colors: {
      primary: "hsl(280, 70%, 50%)",
      secondary: "hsl(280, 20%, 95%)",
      accent: "hsl(320, 80%, 60%)",
      background: "hsl(280, 30%, 98%)",
    },
    scene: SCENES.lotus,
    description: "ពណ៌ស្វាយ និងឡាវេនឌ័រ ដូចអ័ព្ទលើភ្នំ",
  },
  "w9": {
    id: "world-9",
    name: "Night Temple",
    nameKh: "ប្រាសាទពេលយប់",
    icon: "🌙",
    colors: {
      primary: "hsl(280, 70%, 50%)",
      secondary: "hsl(280, 20%, 95%)",
      accent: "hsl(320, 80%, 60%)",
      background: "hsl(280, 30%, 98%)",
    },
    scene: SCENES.royal,
    description: "ពណ៌ស្វាយ និងឡាវេនឌ័រ សម្រាប់ការប្រកួតចុងក្រោយ",
  },
};

export const THEMES: Theme[] = [
  {
    id: "angkor-classic",
    name: "Angkor Classic",
    nameKh: "អង្គរបុរាណ",
    icon: "🏛️",
    colors: {
      primary: "hsl(199, 92%, 45%)",
      secondary: "hsl(220, 20%, 92%)",
      accent: "hsl(142, 76%, 30%)",
      background: "hsl(220, 100%, 98%)",
    },
    scene: SCENES.angkor,
    description: "ដើរលេងលើផ្លូវប្រាសាទ មានពណ៌ខៀវ មាស និងបៃតងស្រស់",
  },
  {
    id: "lotus-pink",
    name: "Lotus Pink",
    nameKh: "បឹងផ្កាឈូក",
    icon: "🪷",
    colors: {
      primary: "hsl(330, 80%, 60%)",
      secondary: "hsl(330, 20%, 95%)",
      accent: "hsl(174, 70%, 42%)",
      background: "hsl(330, 40%, 98%)",
    },
    scene: SCENES.lotus,
    description: "ផ្កាឈូក ទឹកស្រទន់ និងពណ៌ផ្កាឈូកធ្វើឱ្យអារម្មណ៍ទន់ភ្លន់",
  },
  {
    id: "krama-red",
    name: "Krama Red",
    nameKh: "ក្រមារីករាយ",
    icon: "🧣",
    colors: {
      primary: "hsl(0, 80%, 50%)",
      secondary: "hsl(0, 10%, 95%)",
      accent: "hsl(30, 100%, 50%)",
      background: "hsl(30, 30%, 98%)",
    },
    scene: SCENES.krama,
    description: "លំនាំក្រមាខ្មែរ និងពណ៌កក់ក្តៅសម្រាប់ការរៀនបែបសប្បាយ",
  },
  {
    id: "emerald-forest",
    name: "Emerald Forest",
    nameKh: "ព្រៃមរកត",
    icon: "🌳",
    colors: {
      primary: "hsl(160, 70%, 40%)",
      secondary: "hsl(150, 20%, 92%)",
      accent: "hsl(80, 60%, 50%)",
      background: "hsl(140, 30%, 98%)",
    },
    scene: SCENES.forest,
    description: "ស្លឹកឈើ ពណ៌បៃតង និងផ្លូវរៀនដូចដំណើរផ្សងព្រេងតូចៗ",
  },
  {
    id: "royal-gold",
    name: "Royal Gold",
    nameKh: "រាជវាំងផ្កាយ",
    icon: "👑",
    colors: {
      primary: "hsl(45, 100%, 50%)",
      secondary: "hsl(45, 20%, 92%)",
      accent: "hsl(30, 100%, 45%)",
      background: "hsl(40, 40%, 98%)",
    },
    scene: SCENES.royal,
    description: "ផ្កាយមាស និងរាជវាំងភ្លឺៗ សម្រាប់កុមារដែលចូលចិត្តរង្វាន់",
  },
  {
    id: "ocean-blue",
    name: "Mekong Blue",
    nameKh: "រលកមេគង្គ",
    icon: "🌊",
    colors: {
      primary: "hsl(200, 90%, 45%)",
      secondary: "hsl(200, 20%, 92%)",
      accent: "hsl(180, 70%, 40%)",
      background: "hsl(200, 40%, 98%)",
    },
    scene: SCENES.ocean,
    description: "រលកទឹកខៀវ និងអារម្មណ៍ស្រស់ថ្លា ងាយផ្តោតលើការវាយអក្សរ",
  },
];

export function getThemeById(id: string): Theme {
  return THEMES.find((t) => t.id === id) || THEMES[0];
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement;

  root.style.setProperty("--primary", theme.colors.primary);
  root.style.setProperty("--secondary", theme.colors.secondary);
  root.style.setProperty("--accent", theme.colors.accent);
  root.style.setProperty("--bg", theme.colors.background);
  root.style.setProperty("--theme-sky", theme.scene?.sky || theme.colors.background);
  root.style.setProperty("--theme-ground", theme.scene?.ground || theme.colors.secondary);
  root.style.setProperty("--theme-pattern-image", theme.scene?.patternImage || "none");
  root.style.setProperty("--theme-pattern-size", theme.scene?.patternSize || "120px 120px");
  root.dataset.visualTheme = theme.id;
  
  if (theme.colors.foreground) {
    root.style.setProperty("--fg", theme.colors.foreground);
  } else {
    root.style.removeProperty("--fg");
  }
}
