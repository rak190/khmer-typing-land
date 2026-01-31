export interface CulturalText {
  id: string;
  text: string;
  transliteration?: string;
  translation: string;
  category: "proverb" | "history" | "daily" | "greeting" | "nature";
  difficulty: "beginner" | "intermediate" | "expert";
}

export const KHMER_PROVERBS: CulturalText[] = [
  {
    id: "proverb-1",
    text: "ចេះដើរតាមក្បួន ចេះច្បាប់តាមក្រម",
    translation: "Know how to walk the path, know the laws by heart",
    category: "proverb",
    difficulty: "intermediate",
  },
  {
    id: "proverb-2",
    text: "សុភមង្គលផុត ទុក្ខវេទនាចាប់",
    translation: "When happiness ends, suffering begins",
    category: "proverb",
    difficulty: "intermediate",
  },
  {
    id: "proverb-3",
    text: "ទឹកជ្រោះមិនអាចហូរឡើងភ្នំ",
    translation: "A waterfall cannot flow uphill",
    category: "proverb",
    difficulty: "intermediate",
  },
  {
    id: "proverb-4",
    text: "ដើមឈើខ្ពស់ រងខ្យល់ខ្លាំង",
    translation: "Tall trees face strong winds",
    category: "proverb",
    difficulty: "beginner",
  },
  {
    id: "proverb-5",
    text: "ស្រីល្អមើលច្រើនដង បុរសល្អមើលម្តង",
    translation: "A beautiful woman is looked at many times, a good man once",
    category: "proverb",
    difficulty: "expert",
  },
  {
    id: "proverb-6",
    text: "មាត់មិនសមនឹងចិត្ត",
    translation: "The mouth does not match the heart",
    category: "proverb",
    difficulty: "beginner",
  },
  {
    id: "proverb-7",
    text: "ទឹកឡើងត្រីស៊ីស្រមោច ទឹកស្រក់ស្រមោចស៊ីត្រី",
    translation: "When water rises, fish eat ants; when water falls, ants eat fish",
    category: "proverb",
    difficulty: "expert",
  },
  {
    id: "proverb-8",
    text: "ដំរីស្រស់ដោយភ្លៀង មនុស្សស្រស់ដោយពាក្យ",
    translation: "Elephants thrive with rain, people thrive with words",
    category: "proverb",
    difficulty: "intermediate",
  },
];

export const KHMER_HISTORY: CulturalText[] = [
  {
    id: "history-1",
    text: "អង្គរវត្តជាប្រាសាទដ៏ធំបំផុតក្នុងពិភពលោក",
    translation: "Angkor Wat is the largest temple in the world",
    category: "history",
    difficulty: "beginner",
  },
  {
    id: "history-2",
    text: "ព្រះរាជាណាចក្រកម្ពុជាមានប្រវត្តិសាស្ត្រជាង២០០០ឆ្នាំ",
    translation: "The Kingdom of Cambodia has a history of over 2000 years",
    category: "history",
    difficulty: "intermediate",
  },
  {
    id: "history-3",
    text: "អក្សរខ្មែរត្រូវបានបង្កើតនៅសតវត្សរ៍ទី៧",
    translation: "The Khmer script was created in the 7th century",
    category: "history",
    difficulty: "intermediate",
  },
  {
    id: "history-4",
    text: "បាយ័នជាប្រាសាទដែលមានមុខច្រើនជាងគេ",
    translation: "Bayon is the temple with the most faces",
    category: "history",
    difficulty: "beginner",
  },
  {
    id: "history-5",
    text: "ព្រះបាទជ័យវរ្ម័នទី៧បានសាងសង់ប្រាសាទបាយ័ន",
    translation: "King Jayavarman VII built the Bayon temple",
    category: "history",
    difficulty: "expert",
  },
  {
    id: "history-6",
    text: "សមុទ្រសាបជាបឹងធំជាងគេនៅអាស៊ីអាគ្នេយ៍",
    translation: "Tonle Sap is the largest lake in Southeast Asia",
    category: "history",
    difficulty: "intermediate",
  },
  {
    id: "history-7",
    text: "រាំអប្សរាជារបាំប្រពៃណីខ្មែរ",
    translation: "Apsara dance is a traditional Khmer dance",
    category: "history",
    difficulty: "beginner",
  },
  {
    id: "history-8",
    text: "ព្រះបាទសូរ្យវរ្ម័នទី២បានសាងសង់អង្គរវត្ត",
    translation: "King Suryavarman II built Angkor Wat",
    category: "history",
    difficulty: "expert",
  },
];

export const KHMER_DAILY: CulturalText[] = [
  {
    id: "daily-1",
    text: "ខ្ញុំឈ្មោះ សុភា។ រីករាយដែលបានជួប។",
    translation: "My name is Sopha. Nice to meet you.",
    category: "daily",
    difficulty: "beginner",
  },
  {
    id: "daily-2",
    text: "សូមអរគុណច្រើន។ មានទឹកចិត្តល្អណាស់។",
    translation: "Thank you very much. You are very kind.",
    category: "daily",
    difficulty: "beginner",
  },
  {
    id: "daily-3",
    text: "ថ្ងៃនេះអាកាសធាតុល្អណាស់។",
    translation: "The weather is very nice today.",
    category: "daily",
    difficulty: "beginner",
  },
  {
    id: "daily-4",
    text: "ខ្ញុំចង់ទៅផ្សារទិញបន្លែ។",
    translation: "I want to go to the market to buy vegetables.",
    category: "daily",
    difficulty: "intermediate",
  },
  {
    id: "daily-5",
    text: "តើអ្នកញ៉ាំបាយហើយឬនៅ?",
    translation: "Have you eaten rice yet?",
    category: "daily",
    difficulty: "beginner",
  },
  {
    id: "daily-6",
    text: "សូមជួយខ្ញុំបន្តិចបានទេ?",
    translation: "Can you help me a little?",
    category: "daily",
    difficulty: "beginner",
  },
  {
    id: "daily-7",
    text: "ខ្ញុំរៀនភាសាខ្មែរព្រោះខ្ញុំស្រលាញ់កម្ពុជា។",
    translation: "I learn Khmer because I love Cambodia.",
    category: "daily",
    difficulty: "intermediate",
  },
  {
    id: "daily-8",
    text: "គ្រួសារខ្ញុំមានប៉ាម៉ាក់ និងបងប្អូនពីរនាក់។",
    translation: "My family has parents and two siblings.",
    category: "daily",
    difficulty: "intermediate",
  },
];

export const KHMER_GREETINGS: CulturalText[] = [
  {
    id: "greeting-1",
    text: "សួស្តី",
    translation: "Hello",
    category: "greeting",
    difficulty: "beginner",
  },
  {
    id: "greeting-2",
    text: "អរុណសួស្តី",
    translation: "Good morning",
    category: "greeting",
    difficulty: "beginner",
  },
  {
    id: "greeting-3",
    text: "សាយ័ណ្ហសួស្តី",
    translation: "Good afternoon",
    category: "greeting",
    difficulty: "beginner",
  },
  {
    id: "greeting-4",
    text: "រាត្រីសួស្តី",
    translation: "Good night",
    category: "greeting",
    difficulty: "beginner",
  },
  {
    id: "greeting-5",
    text: "សូមអរគុណ",
    translation: "Thank you",
    category: "greeting",
    difficulty: "beginner",
  },
  {
    id: "greeting-6",
    text: "អត់ទេ អត់អី​ទេ",
    translation: "No, it's nothing / You're welcome",
    category: "greeting",
    difficulty: "beginner",
  },
  {
    id: "greeting-7",
    text: "សុខសប្បាយជាទេ?",
    translation: "How are you?",
    category: "greeting",
    difficulty: "beginner",
  },
  {
    id: "greeting-8",
    text: "ខ្ញុំសុខសប្បាយ សូមអរគុណ។",
    translation: "I am fine, thank you.",
    category: "greeting",
    difficulty: "beginner",
  },
];

export const KHMER_NATURE: CulturalText[] = [
  {
    id: "nature-1",
    text: "ព្រៃឈើខ្មែរមានសត្វព្រៃជាច្រើនប្រភេទ។",
    translation: "Cambodian forests have many types of wildlife.",
    category: "nature",
    difficulty: "intermediate",
  },
  {
    id: "nature-2",
    text: "ផ្កាឈូកជាផ្កាជាតិកម្ពុជា។",
    translation: "The lotus flower is Cambodia's national flower.",
    category: "nature",
    difficulty: "beginner",
  },
  {
    id: "nature-3",
    text: "ទន្លេមេគង្គហូរកាត់កម្ពុជា។",
    translation: "The Mekong River flows through Cambodia.",
    category: "nature",
    difficulty: "beginner",
  },
  {
    id: "nature-4",
    text: "រដូវវស្សាមានភ្លៀងច្រើន រដូវប្រាំងមានកម្តៅ។",
    translation: "The rainy season has much rain, the dry season is hot.",
    category: "nature",
    difficulty: "intermediate",
  },
  {
    id: "nature-5",
    text: "ដំរីជាសត្វធំបំផុតនៅកម្ពុជា។",
    translation: "The elephant is the largest animal in Cambodia.",
    category: "nature",
    difficulty: "beginner",
  },
  {
    id: "nature-6",
    text: "ស្រែខ្មែរពេញដោយស្រូវបៃតង។",
    translation: "Khmer rice fields are full of green rice.",
    category: "nature",
    difficulty: "beginner",
  },
];

export const ALL_CULTURAL_CONTENT: CulturalText[] = [
  ...KHMER_PROVERBS,
  ...KHMER_HISTORY,
  ...KHMER_DAILY,
  ...KHMER_GREETINGS,
  ...KHMER_NATURE,
];

export function getContentByCategory(category: CulturalText["category"]): CulturalText[] {
  return ALL_CULTURAL_CONTENT.filter((c) => c.category === category);
}

export function getContentByDifficulty(difficulty: CulturalText["difficulty"]): CulturalText[] {
  return ALL_CULTURAL_CONTENT.filter((c) => c.difficulty === difficulty);
}

export function getRandomContent(count: number = 5, category?: CulturalText["category"]): CulturalText[] {
  const pool = category ? getContentByCategory(category) : ALL_CULTURAL_CONTENT;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
