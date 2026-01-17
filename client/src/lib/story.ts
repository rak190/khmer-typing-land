
export interface StoryChapter {
  id: string;
  worldId: string;
  title: string;
  intro: string;
  outro: string;
  monsterName: string;
  monsterEmoji: string;
}

export const STORY_CHAPTERS: StoryChapter[] = [
  {
    id: "ch1",
    worldId: "w1",
    title: "The Awakening",
    intro: "In the quiet village of Akshara, the ancient stones began to glow. You, a young scribe, must master the basic scripts to protect the light.",
    outro: "The first scripts are mastered. The village is safe, but a shadow moves in the distance.",
    monsterName: "Shadow Sprite",
    monsterEmoji: "👻"
  },
  {
    id: "ch2",
    worldId: "w2",
    title: "The Whispering Woods",
    intro: "The path leads into the Whispering Woods. To navigate the thicket, you must call upon the strength of the full consonants.",
    outro: "The woods part ways. You've earned the respect of the forest spirits.",
    monsterName: "Thorn Golem",
    monsterEmoji: "🌵"
  },
  {
    id: "ch3",
    worldId: "w3",
    title: "The Crystal Lake",
    intro: "Beside the Crystal Lake, the air is filled with floating vowels. Type with precision to keep your footing on the slippery stones.",
    outro: "The lake reflects your growing power. The water spirits grant you their blessing.",
    monsterName: "Mist Kraken",
    monsterEmoji: "🐙"
  },
  {
    id: "ch4",
    worldId: "w4",
    title: "The Mountain of Marks",
    intro: "High above, the Mountain of Marks is shrouded in storm. Only by mastering the accents can you weather the gale.",
    outro: "The storm breaks. From the summit, you see the entire kingdom of Khemara.",
    monsterName: "Storm Eagle",
    monsterEmoji: "🦅"
  },
  {
    id: "ch5",
    worldId: "w5",
    title: "The Ancient Library",
    intro: "Deep within the Ancient Library, complex combos hold the keys to forgotten lore. Decipher them to unlock the gate.",
    outro: "The secrets of the ancestors are yours. You are no longer just a scribe, but a Guardian.",
    monsterName: "Ink Stalker",
    monsterEmoji: "🐈‍⬛"
  },
  {
    id: "ch6",
    worldId: "w6",
    title: "The Desert of Chaos",
    intro: "The scripts are mixing in the heat of the Desert of Chaos. Stay focused as the sands shift beneath you.",
    outro: "The dunes settle. You have found order in the midst of chaos.",
    monsterName: "Sand Worm",
    monsterEmoji: "🪱"
  },
  {
    id: "ch7",
    worldId: "w7",
    title: "The Rhythm Falls",
    intro: "Listen to the beat of the Rhythm Falls. Your typing must match the pulse of the earth itself.",
    outro: "The music of the falls fills your soul. You have found your flow.",
    monsterName: "Echo Siren",
    monsterEmoji: "🧜"
  },
  {
    id: "ch8",
    worldId: "w8",
    title: "The Digital Forge",
    intro: "Numbers and symbols fly in the Digital Forge. Temper your skills in the heat of the mechanical heart.",
    outro: "The forge cools. You have crafted a weapon of pure knowledge.",
    monsterName: "Iron Titan",
    monsterEmoji: "🤖"
  },
  {
    id: "ch9",
    worldId: "w9",
    title: "The Void of Mastery",
    intro: "You have reached the Void. Here, everything you've learned will be tested. Become the Master of Akshara.",
    outro: "The Void is filled with light. You are the ultimate Master Scribe. The kingdom is saved.",
    monsterName: "The Silence",
    monsterEmoji: "🌑"
  }
];

export const RANDOM_EVENTS = [
  {
    id: "e1",
    name: "Golden Snitch",
    description: "A rare word appeared! Type it fast for double points!",
    reward: "Bonus Stars",
    chance: 0.1
  },
  {
    id: "e2",
    name: "Scribe's Fever",
    description: "Typing speed increased for 10 seconds!",
    reward: "Speed Boost",
    chance: 0.05
  },
  {
    id: "e3",
    name: "Hidden Scroll",
    description: "You found an ancient secret!",
    reward: "Rare Badge",
    chance: 0.02
  },
  {
    id: "e4",
    name: "Dragon's Challenge",
    description: "A legendary beast appeared! Defeat it for a hidden reward!",
    reward: "Secret Item",
    chance: 0.03
  }
];

export interface EasterEgg {
  id: string;
  triggerMilestone: number; // total stars
  name: string;
  description: string;
  secretWord: string;
  reward: string;
}

export const EASTER_EGGS: EasterEgg[] = [
  {
    id: "egg1",
    triggerMilestone: 20,
    name: "The First Scribe's Echo",
    description: "A secret message from the past has appeared in your journey.",
    secretWord: "អរគុណ", // Thank you in Khmer
    reward: "Ancient Ink Badge"
  },
  {
    id: "egg2",
    triggerMilestone: 50,
    name: "The Hidden Glyph",
    description: "You've unlocked a secret challenge in the void.",
    secretWord: "សន្តិភាព", // Peace in Khmer
    reward: "Peacekeeper Aura"
  }
];
