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

  // WORLD 1: Cambodian culture (places/heritage)
  const CULTURE_WORDS = [
    "អង្គរ","អង្គរវត្ត","ប្រាសាទ","សៀមរាប","ភ្នំពេញ","កម្ពុជា","ទន្លេ","មេគង្គ","បឹង","ភូមិ","ផ្សារ","វត្ត",
    "បុរាណ","ប្រវត្តិសាស្ត្រ","វប្បធម៌","ជាតិ","ទង់ជាតិ","រាជធានី","ទេសចរណ៍","សិល្បៈ","របាំ","អប្សរា"
  ];
  const w1Stages = buildStagesFrom(
    "វប្បធម៌កម្ពុជា (Culture)",
    [...CULTURE_WORDS, " ", "។"],
    { 9:[" ", "។", "៖"] }
  );

  // WORLD 2: Nature & places (weather/landscape)
  const NATURE_WORDS = [
    "ភ្នំ","ព្រៃ","សមុទ្រ","ខ្សាច់","ទឹក","ភ្លៀង","ខ្យល់","ពពក","ព្រះអាទិត្យ","ព្រះច័ន្ទ","ផ្កាយ","ផ្កា",
    "ដើមឈើ","ស្លឹក","ទន្លេ","ជ្រោះ","វាល","ស្រែ","ទឹកធ្លាក់","រដូវ"
  ];
  const w2Stages = buildStagesFrom(
    "ធម្មជាតិ (Nature)",
    [...NATURE_WORDS, " ", "។", "?"],
    { 9:[" ", "។", "؟", "!"].filter(Boolean) as any }
  );

  // WORLD 3: Daily life (common phrases)
  const DAILY_PHRASES = [
    "សួស្តី","អរគុណ","សូម","ជួយ","ខ្ញុំ","អ្នក","ថ្ងៃនេះ","ស្អែក","សូមទោស","មិនអី","ជួបគ្នា","សុខសប្បាយ",
    "ទៅណា","មកពីណា","ចូលចិត្ត","ប៉ុន្មាន","សូមអញ្ជើញ","ល្អណាស់"
  ];
  const w3Stages = buildStagesFrom(
    "ជីវិតប្រចាំថ្ងៃ (Daily)",
    [...DAILY_PHRASES, " ", "។"],
    { 9:[" ", "។", "؟", "!"] as any }
  );

  // WORLD 4: Khmer script mastery (letters & marks)
  const w4Stages = buildStagesFrom(
    "អក្សរខ្មែរ (Script Mastery)",
    [...CONSONANTS, ...VOWELS_SIGNS, ...SUBSCRIPT, "់","៉","៊","ះ","ំ","៌","៍","៎", " ", "។"],
    { 9:[" ", "។", "៖", "៕"] }
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

  // WORLD 7: Phrases + punctuation (rhythm)
  const RHYTHM_PHRASES = [
    "សូមអរគុណ។","សូមទោស។","ខ្ញុំចូលចិត្ត។","ថ្ងៃនេះល្អណាស់!","អ្នកសុខសប្បាយទេ?","ជួបគ្នាស្អែក។",
    "សូមជួយខ្ញុំ។","ខ្ញុំទៅផ្សារ។","ខ្ញុំមកពីភ្នំពេញ។","សូមអញ្ជើញ!"
  ];
  const w7Stages = buildStagesFrom(
    "ឃ្លា និងសញ្ញាវាក្យ (Rhythm)",
    [...RHYTHM_PHRASES, ...PUNCT, " "],
    { 9:["៕","៖","?","!"] }
  );

  // WORLD 8: Numbers + money + time
  const NUMBER_WORDS = [
    "០","១","២","៣","៤","៥","៦","៧","៨","៩",
    "១០","២០","៣០","៥០","១០០","១,០០០",
    "រៀល","ដុល្លារ","ម៉ោង","នាទី","ថ្ងៃ","ខែ","ឆ្នាំ","តម្លៃ","ប៉ុន្មាន"
  ];
  const w8Stages = buildStagesFrom(
    "លេខ និងពេលវេលា (Numbers)",
    [...NUMBER_WORDS, " ", "។", "?"],
    { 9:["។","៕","?","!"] }
  );

  // WORLD 9: Mastery (sentences)
  const SENTENCES = [
    "ខ្ញុំចូលចិត្តអាហារខ្មែរ។",
    "ថ្ងៃនេះខ្ញុំទៅផ្សារជាមួយមិត្ត។",
    "ភ្លៀងធ្លាក់នៅល្ងាច។",
    "អង្គរវត្តជាប្រាសាទល្បី។",
    "សូមអរគុណចំពោះការជួយ។",
    "អ្នកសុខសប្បាយទេ?",
    "ខ្ញុំមកពីកម្ពុជា។",
    "ខ្ញុំចង់រៀនវាយអក្សរឲ្យលឿន។",
    "សូមអញ្ជើញចូលមក។"
  ];
  const w9Stages = buildStagesFrom(
    "ប្រយោគ (Mastery)",
    [...SENTENCES, " ", "។", "?", "!"],
    { 9:["៕","៖","?","!"] }
  );

  const worlds: World[] = [
    { 
      id:"w1", 
      name:"ពិភពទី ១: មូលដ្ឋាន",    
      unlockStars: unlock[0], 
      stages: w1Stages,
      theme: {
        id: "culture",
        title: "វប្បធម៌កម្ពុជា",
        description: "វាយពាក្យ និងទីកន្លែងល្បីៗរបស់កម្ពុជា ដើម្បីរៀនវាក្យសព្ទ។",
        emoji: "🛕",
        keywords: ["កម្ពុជា", "អង្គរ", "ប្រាសាទ", "វប្បធម៌"]
      }
    },
    { 
      id:"w2", 
      name:"ពិភពទី ២: ព្យញ្ជនៈ",
      unlockStars: unlock[1], 
      stages: w2Stages,
      theme: {
        id: "nature",
        title: "ធម្មជាតិ",
        description: "រៀនពាក្យធម្មជាតិ (ភ្នំ ព្រៃ ទឹក ភ្លៀង...) និងវាយឲ្យរលូន។",
        emoji: "🌿",
        keywords: ["ធម្មជាតិ", "ភ្នំ", "ព្រៃ", "ទឹក"]
      }
    },
    { 
      id:"w3", 
      name:"ពិភពទី ៣: ស្រៈ",    
      unlockStars: unlock[2], 
      stages: w3Stages,
      theme: {
        id: "culture",
        title: "ជីវិតប្រចាំថ្ងៃ",
        description: "វាយពាក្យសន្ទនា និងឃ្លាខ្លីៗ ដែលប្រើរៀងរាល់ថ្ងៃ។",
        emoji: "🗣️",
        keywords: ["សួស្តី", "អរគុណ", "សូម", "សូមទោស"]
      }
    },
    { 
      id:"w4", 
      name:"ពិភពទី ៤: សញ្ញា",     
      unlockStars: unlock[3], 
      stages: w4Stages,
      theme: {
        id: "skills",
        title: "អក្សរខ្មែរ",
        description: "ហ្វឹកហាត់អក្សរ ស្រៈ សញ្ញា និងអក្សរផ្សំ ដើម្បីឲ្យច្បាស់ និងត្រឹមត្រូវ។",
        emoji: "🔤",
        keywords: ["អក្សរខ្មែរ", "ស្រៈ", "សញ្ញា", "អក្សរផ្សំ"]
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
        title: "ឃ្លា និងសញ្ញាវាក្យ",
        description: "ហ្វឹកហាត់ឃ្លា និងសញ្ញាវាក្យ (។ ? ! ៖) ដើម្បីវាយបានមានចង្វាក់។",
        emoji: "🎶",
        keywords: ["ឃ្លា", "សញ្ញាវាក្យ", "ចង្វាក់", "វាក្យ"]
      }
    },
    { 
      id:"w8", 
      name:"ពិភពទី ៨: លេខ",   
      unlockStars: unlock[7], 
      stages: w8Stages,
      theme: {
        id: "culture",
        title: "លេខ និងពេលវេលា",
        description: "រៀនលេខ តម្លៃ ប្រាក់ និងពេលវេលា ដើម្បីប្រើក្នុងជីវិតប្រចាំថ្ងៃ។",
        emoji: "🕒",
        keywords: ["លេខ", "តម្លៃ", "ម៉ោង", "រៀល"]
      }
    },
    { 
      id:"w9", 
      name:"ពិភពទី ៩: ជំនាញខ្ពស់",   
      unlockStars: unlock[8], 
      stages: w9Stages,
      theme: {
        id: "skills",
        title: "ប្រយោគ",
        description: "វាយប្រយោគពេញៗ ដើម្បីបង្កើនល្បឿន និងភាពត្រឹមត្រូវ។",
        emoji: "📜",
        keywords: ["ប្រយោគ", "ល្បឿន", "ភាពត្រឹមត្រូវ"]
      }
    },
  ];

  return worlds;
}
