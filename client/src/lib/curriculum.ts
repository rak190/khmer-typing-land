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
    const khmerNumbers = ["១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩"];
    return {
      id: "s" + stageNo,
      name: `${namePrefix} — វគ្គទី ${khmerNumbers[idx]}`,
      pool: [...c, ...extra].filter(Boolean)
    };
  });
}

export function buildWorlds(): World[] {
  const unlock = [0,12,24,36,48,60,72,84,96];

  // WORLD 1: Basic consonants (small sets)
  const w1Stages = buildStagesFrom(
    "ព្យញ្ជនៈ (មូលដ្ឋាន)",
    CONSONANTS.slice(0, 27), 
    { 7:[" "], 8:[" "], 9:[" "] }
  );

  // WORLD 2: Full consonants + speed
  const w2Stages = buildStagesFrom(
    "ព្យញ្ជនៈ (ពេញលេញ)",
    CONSONANTS,
    { 9:[" ", "។"] }
  );

  // WORLD 3: Vowels & vowel signs
  const w3Stages = buildStagesFrom(
    "ស្រៈ និង សញ្ញាស្រៈ",
    VOWELS_SIGNS,
    { 1:["ក","គ"], 2:["ត","ន"], 3:["ប","ម"], 9:[" "]}
  );

  // WORLD 4: Marks + Coeng practice
  const w4Stages = buildStagesFrom(
    "សញ្ញា និង ជើងអក្សរ",
    [...SUBSCRIPT, "់","៉","៊","ះ","ំ","៌","៍","៎"],
    { 5:["ក","គ","ត","ន"], 6:["ប","ម","ស","ហ"], 9:[" "]}
  );

  // WORLD 5: Common combos
  const w5Stages = buildStagesFrom(
    "ការផ្សំពេញនិយម",
    COMMON_COMBOS,
    { 1:["ក","គ","ត","ន"], 2:["ប","ម","ស","ហ"], 9:[" ", "។"] }
  );

  // WORLD 6: Mixed
  const w6Stages = buildStagesFrom(
    "ការអនុវត្តចម្រុះ",
    [...CONSONANTS.slice(0, 20), ...VOWELS_SIGNS.slice(0, 12), ...COMMON_COMBOS],
    { 9:[" ", "។", "៖"] }
  );

  // WORLD 7: Rhythm
  const w7Stages = buildStagesFrom(
    "សញ្ញាវណ្ណយុត្តិ និង ចង្វាក់",
    [...PUNCT, " "],
    { 4:[...CONSONANTS.slice(0,10)], 5:[...VOWELS_SIGNS.slice(0,10)], 9:["៕"] }
  );

  // WORLD 8: Numbers
  const w8Stages = buildStagesFrom(
    "លេខ និង ការលាយបញ្ចូលគ្នា",
    [...KHMER_DIGITS, ...CONSONANTS.slice(0, 20), ...VOWELS_SIGNS.slice(0, 10), " "],
    { 9:["។","៕"] }
  );

  // WORLD 9: Mastery
  const MASTER_POOL = Array.from(new Set([
    ...CONSONANTS, ...VOWELS_SIGNS, ...COMMON_COMBOS, ...PUNCT, ...KHMER_DIGITS, " "
  ]));

  const w9Stages = buildStagesFrom(
    "ជំនាញខ្ពស់ (ទាំងអស់)",
    MASTER_POOL,
    { 9:["៕","៖","ៈ"] }
  );

  const worlds: World[] = [
    { id:"w1", name:"ពិភពទី ១: មូលដ្ឋាន",    unlockStars: unlock[0], stages: w1Stages },
    { id:"w2", name:"ពិភពទី ២: ព្យញ្ជនៈ",unlockStars: unlock[1], stages: w2Stages },
    { id:"w3", name:"ពិភពទី ៣: ស្រៈ",    unlockStars: unlock[2], stages: w3Stages },
    { id:"w4", name:"ពិភពទី ៤: សញ្ញា",     unlockStars: unlock[3], stages: w4Stages },
    { id:"w5", name:"ពិភពទី ៥: ការផ្សំ",    unlockStars: unlock[4], stages: w5Stages },
    { id:"w6", name:"ពិភពទី ៦: ចម្រុះ",     unlockStars: unlock[5], stages: w6Stages },
    { id:"w7", name:"ពិភពទី ៧: ចង្វាក់",    unlockStars: unlock[6], stages: w7Stages },
    { id:"w8", name:"ពិភពទី ៨: លេខ",   unlockStars: unlock[7], stages: w8Stages },
    { id:"w9", name:"ពិភពទី ៩: ជំនាញខ្ពស់",   unlockStars: unlock[8], stages: w9Stages },
  ];

  return worlds;
}
