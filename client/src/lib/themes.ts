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
  description: string;
}

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
    description: "ពណ៌មាសប្រណិត សមស្របនឹងរចនាបថរាជវង្ស",
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
    description: "ពណ៌ខៀវ និងមាស បំផុសគំនិតពីអង្គរវត្ត",
  },
  {
    id: "lotus-pink",
    name: "Lotus Pink",
    nameKh: "ផ្កាឈូក",
    icon: "🪷",
    colors: {
      primary: "hsl(330, 80%, 60%)",
      secondary: "hsl(330, 20%, 95%)",
      accent: "hsl(330, 100%, 70%)",
      background: "hsl(330, 40%, 98%)",
    },
    description: "ពណ៌ផ្កាឈូកស្រស់ស្អាត បំផុសគំនិតពីផ្កាឈូក",
  },
  {
    id: "krama-red",
    name: "Krama Red",
    nameKh: "ក្រមាក្រហម",
    icon: "🧣",
    colors: {
      primary: "hsl(0, 80%, 50%)",
      secondary: "hsl(0, 10%, 95%)",
      accent: "hsl(30, 100%, 50%)",
      background: "hsl(30, 30%, 98%)",
    },
    description: "ពណ៌ក្រហមកក់ក្តៅ បំផុសគំនិតពីក្រមាខ្មែរ",
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
    description: "ពណ៌បៃតងស្រស់ បំផុសគំនិតពីព្រៃខ្មែរ",
  },
  {
    id: "royal-gold",
    name: "Royal Gold",
    nameKh: "មាសសម្តេច",
    icon: "👑",
    colors: {
      primary: "hsl(45, 100%, 50%)",
      secondary: "hsl(45, 20%, 92%)",
      accent: "hsl(30, 100%, 45%)",
      background: "hsl(40, 40%, 98%)",
    },
    description: "ពណ៌មាសប្រណិត សមស្របនឹងរចនាបថរាជវង្ស",
  },
  {
    id: "ocean-blue",
    name: "Ocean Blue",
    nameKh: "សមុទ្រខៀវ",
    icon: "🌊",
    colors: {
      primary: "hsl(200, 90%, 45%)",
      secondary: "hsl(200, 20%, 92%)",
      accent: "hsl(180, 70%, 40%)",
      background: "hsl(200, 40%, 98%)",
    },
    description: "ពណ៌ខៀវស្ងប់ស្ងាត់ សម្រាប់ការវាយអក្សរបែបស្រួលចិត្ត",
  },
];

export function getThemeById(id: string): Theme {
  return THEMES.find((t) => t.id === id) || THEMES[0];
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  
  // Apply CSS variables
  root.style.setProperty("--primary", theme.colors.primary);
  root.style.setProperty("--secondary", theme.colors.secondary);
  root.style.setProperty("--accent", theme.colors.accent);
  root.style.setProperty("--bg", theme.colors.background);
  
  if (theme.colors.foreground) {
    root.style.setProperty("--fg", theme.colors.foreground);
  } else {
    // Reset to default if not specified
    root.style.removeProperty("--fg");
  }
}
