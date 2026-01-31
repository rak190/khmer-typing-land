// 9 worlds × 9 stages (81 stages). Each stage has a "pool" of targets.

const CONSONANTS = [
  "ក","ខ","គ","ឃ","ង",
  "ច","ឆ","ជ","ឈ","ញ",
  "ដ","ឋ","ឌ","ឍ","ណ",
  "ត","ថ","ទ","ធ","ន",
  "ប","ផ","ព","ភ","ម",
  "យ","រ","ល","វ","ស",
  "ហ","ឡ","អ"
];

const VOWELS_SIGNS = ["ា","ិ","ី","ឹ","ឺ","ុ","ូ","េ","ែ","ៃ","ោ","ៅ","ំ","ះ","់","៉","៊","៌","៍","៎"];
const SUBSCRIPT = ["្"]; // Coeng
const COMMON_COMBOS = ["ុំ","ុះ","េះ","ោះ","ៀ","ឿ","ាំ"];
const PUNCT = ["។","៕","៖","ៈ","?","!","(",")",",",".","/"];
const KHMER_DIGITS = ["០","១","២","៣","៤","៥","៦","៧","៨","៩"];

export interface Stage {
  id: string;
  name: string;
  pool: string[];
}

export interface World {
  id: string;
  name: string;
  unlockStars: number;
  stages: Stage[];
  theme?: {
    id: "skills" | "culture" | "animals" | "food" | "nature";
    title: string;
    description: string;
    emoji: string;
    keywords: string[];
  };
}

function chunkInto<T>(arr: T[], n: number): T[][] {
  const out: T[][] = [];
  const size = Math.ceil(arr.length / n);
  for(let i=0;i<n;i++){
    out.push(arr.slice(i*size, (i+1)*size));
  }
  return out;
}

function buildStagesFrom(namePrefix: string, baseList: string[], extrasByStage: Record<number, string[]> = {}): Stage[] {
  const chunks = chunkInto(baseList, 9);
  return chunks.map((c, idx) => {
    const stageNo = idx + 1;
    const extra = extrasByStage[stageNo] || [];
    return {
      id: "s" + stageNo,
      name: `${namePrefix} — Stage ${stageNo}`,
      pool: [...c, ...extra].filter(Boolean)
    };
  });
}

export function buildWorlds(): World[] {
  const unlock = [0,12,24,36,48,60,72,84,96];

  // WORLD 1: Basic consonants (small sets)
  const w1Stages = buildStagesFrom(
    "Consonants (Basics)",
    CONSONANTS.slice(0, 27), 
    { 7:[" "], 8:[" "], 9:[" "] }
  );

  // WORLD 2: Full consonants + speed
  const w2Stages = buildStagesFrom(
    "Consonants (Full)",
    CONSONANTS,
    { 9:[" ", "។"] }
  );

  // WORLD 3: Vowels & vowel signs
  const w3Stages = buildStagesFrom(
    "Vowels & Signs",
    VOWELS_SIGNS,
    { 1:["ក","គ"], 2:["ត","ន"], 3:["ប","ម"], 9:[" "]}
  );

  // WORLD 4: Marks + Coeng practice
  const w4Stages = buildStagesFrom(
    "Marks + Subscript",
    [...SUBSCRIPT, "់","៉","៊","ះ","ំ","៌","៍","៎"],
    { 5:["ក","គ","ត","ន"], 6:["ប","ម","ស","ហ"], 9:[" "]}
  );

  // WORLD 5: Common combos + food vocab
  const FOOD_WORDS = ["បាយ","សម្ល","អាម៉ុក","នំបញ្ចុក","ត្រី","សាច់","ម្រេច","ស្ករ","ទឹក","បន្លែ","ផ្លែឈើ","មី","កាហ្វេ","តែ","ទឹកដោះគោ"]; 
  const w5Stages = buildStagesFrom(
    "អាហារខ្មែរ (Khmer Food)",
    [...COMMON_COMBOS, ...FOOD_WORDS],
    { 1:[" ","។"], 2:[" ","។"], 9:[" ", "។", "៖"] }
  );

  // WORLD 6: Mixed + animals vocab
  const ANIMALS = ["គោ","ក្របី","មាន់","ទា","ត្រី","ឆ្កែ","ឆ្មា","សត្វស្លាប","ដំរី","ខ្លា","ស្វា","ពស់","កង្កែប","កាំបិត","ខ្លាឃ្មុំ"]; 
  const w6Stages = buildStagesFrom(
    "សត្វ (Animals)",
    [...ANIMALS, " ", "។", "?", "!"],
    { 9:[" ", "។", "៖"] }
  );

  // WORLD 7: Rhythm
  const w7Stages = buildStagesFrom(
    "Punctuation + Rhythm",
    [...PUNCT, " "],
    { 4:[...CONSONANTS.slice(0,10)], 5:[...VOWELS_SIGNS.slice(0,10)], 9:["៕"] }
  );

  // WORLD 8: Numbers
  const w8Stages = buildStagesFrom(
    "Numbers + Mixed",
    [...KHMER_DIGITS, ...CONSONANTS.slice(0, 20), ...VOWELS_SIGNS.slice(0, 10), " "],
    { 9:["។","៕"] }
  );

  // WORLD 9: Mastery
  const MASTER_POOL = Array.from(new Set([
    ...CONSONANTS, ...VOWELS_SIGNS, ...COMMON_COMBOS, ...PUNCT, ...KHMER_DIGITS, " "
  ]));

  const w9Stages = buildStagesFrom(
    "Mastery (All)",
    MASTER_POOL,
    { 9:["៕","៖","ៈ"] }
  );

  const worlds: World[] = [
    { 
      id:"w1", 
      name:"ពិភពទី ១: មូលដ្ឋាន",    
      unlockStars: unlock[0], 
      stages: w1Stages,
      theme: {
        id: "skills",
        title: "មូលដ្ឋាន",
        description: "រៀនព្យញ្ជនៈមូលដ្ឋាន ដើម្បីចាប់ផ្តើមដំណើរជាអ្នកសរសេរ។",
        emoji: "🪶",
        keywords: ["អក្សរ", "មូលដ្ឋាន", "ព្យញ្ជនៈ"]
      }
    },
    { 
      id:"w2", 
      name:"ពិភពទី ២: ព្យញ្ជនៈ",
      unlockStars: unlock[1], 
      stages: w2Stages,
      theme: {
        id: "skills",
        title: "ព្យញ្ជនៈពេញ",
        description: "បង្កើនល្បឿន និងភាពម៉ត់ចត់ជាមួយព្យញ្ជនៈទាំងអស់។",
        emoji: "⚔️",
        keywords: ["ព្យញ្ជនៈ", "ល្បឿន", "ភាពម៉ត់ចត់"]
      }
    },
    { 
      id:"w3", 
      name:"ពិភពទី ៣: ស្រៈ",    
      unlockStars: unlock[2], 
      stages: w3Stages,
      theme: {
        id: "skills",
        title: "ស្រៈ និងសញ្ញាស្រៈ",
        description: "បន្ថែមស្រៈ ដើម្បីបង្កើតពាក្យបានល្អ។",
        emoji: "💧",
        keywords: ["ស្រៈ", "សញ្ញា", "ការផ្សំ"]
      }
    },
    { 
      id:"w4", 
      name:"ពិភពទី ៤: សញ្ញា",     
      unlockStars: unlock[3], 
      stages: w4Stages,
      theme: {
        id: "culture",
        title: "សញ្ញា និងអក្សរផ្សំ",
        description: "ស្គាល់សញ្ញាពិសេស និងការប្រើ “្” ដើម្បីសរសេរឲ្យត្រឹមត្រូវ។",
        emoji: "🗿",
        keywords: ["សញ្ញា", "អក្សរផ្សំ", "អក្សរខ្មែរ"]
      }
    },
    { 
      id:"w5", 
      name:"ពិភពទី ៥: ការផ្សំ",    
      unlockStars: unlock[4], 
      stages: w5Stages,
      theme: {
        id: "food",
        title: "ពាក្យពេញនិយម (អាហារ)",
        description: "វាយពាក្យអាហារខ្មែរ និងពាក្យពេញនិយមសម្រាប់សន្ទនា។",
        emoji: "🍚",
        keywords: ["អាហារ", "ពាក្យ", "វាក្យ"]
      }
    },
    { 
      id:"w6", 
      name:"ពិភពទី ៦: ចម្រុះ",     
      unlockStars: unlock[5], 
      stages: w6Stages,
      theme: {
        id: "animals",
        title: "សត្វ",
        description: "រៀនពាក្យសត្វ និងឃ្លាខ្លីៗ ដើម្បីអនុវត្តជាក់ស្តែង។",
        emoji: "🐘",
        keywords: ["សត្វ", "ពាក្យ", "ឃ្លា"]
      }
    },
    { 
      id:"w7", 
      name:"ពិភពទី ៧: ចង្វាក់",    
      unlockStars: unlock[6], 
      stages: w7Stages,
      theme: {
        id: "culture",
        title: "វប្បធម៌ និងសញ្ញាវាក្យ",
        description: "វាយឃ្លាខ្មែរ ឲ្យមានចង្វាក់ និងសញ្ញាវាក្យត្រឹមត្រូវ។",
        emoji: "🎭",
        keywords: ["វប្បធម៌", "សញ្ញាវាក្យ", "ចង្វាក់"]
      }
    },
    { 
      id:"w8", 
      name:"ពិភពទី ៨: លេខ",   
      unlockStars: unlock[7], 
      stages: w8Stages,
      theme: {
        id: "nature",
        title: "ធម្មជាតិ និងលេខ",
        description: "បន្ថែមលេខខ្មែរ និងពាក្យធម្មជាតិ ដើម្បីបង្កើនភាពរលូន។",
        emoji: "🌾",
        keywords: ["ធម្មជាតិ", "លេខ", "ការអនុវត្ត"]
      }
    },
    { 
      id:"w9", 
      name:"ពិភពទី ៩: ជំនាញខ្ពស់",   
      unlockStars: unlock[8], 
      stages: w9Stages,
      theme: {
        id: "skills",
        title: "ជំនាញខ្ពស់",
        description: "ប្រឡងចុងក្រោយ៖ ពាក្យ ចង្វាក់ និងគ្រប់អ្វីដែលបានរៀន។",
        emoji: "👑",
        keywords: ["ជំនាញ", "ចុងក្រោយ", "ម៉ាស្ទ័រ"]
      }
    },
  ];

  return worlds;
}
