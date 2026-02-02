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
    description: "Traditional blue and gold inspired by Angkor Wat",
  },
  {
    id: "night-temple",
    name: "Night Temple",
    nameKh: "ប្រាសាទរាត្រី",
    icon: "🌙",
    colors: {
      primary: "hsl(280, 100%, 80%)",
      secondary: "hsl(240, 25%, 20%)",
      accent: "hsl(280, 100%, 75%)",
      background: "hsl(240, 35%, 10%)",
      foreground: "hsl(0, 0%, 100%)",
    },
    description: "Deep purple night theme with mystical accents",
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
    description: "Warm red tones inspired by traditional Cambodian scarves",
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
    description: "Fresh green theme inspired by Cambodian forests",
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
    description: "Luxurious gold theme fit for royalty",
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
    description: "Calm ocean blues for peaceful typing",
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
