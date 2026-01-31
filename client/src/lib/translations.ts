export interface TranslationSet {
  // Navigation
  home: string;
  back: string;
  start: string;
  continue: string;
  
  // Game modes
  platform: string;
  runner: string;
  defender: string;
  timedTest: string;
  freeTyping: string;
  accuracyMode: string;
  multiplayer: string;
  challenges: string;
  culturalChallenges: string;
  
  // Stats
  stats: string;
  wpm: string;
  accuracy: string;
  errors: string;
  streak: string;
  bestScore: string;
  totalStars: string;
  
  // Actions
  play: string;
  reset: string;
  finish: string;
  save: string;
  cancel: string;
  
  // Labels
  difficulty: string;
  beginner: string;
  intermediate: string;
  expert: string;
  duration: string;
  
  // Multiplayer
  createRoom: string;
  joinRoom: string;
  roomCode: string;
  waitingForPlayers: string;
  startRace: string;
  raceComplete: string;
  
  // Themes
  themeSettings: string;
  chooseTheme: string;
  fontStyle: string;
  
  // Cultural
  proverbs: string;
  history: string;
  dailyLife: string;
  greetings: string;
  nature: string;
  
  // Messages
  typeHere: string;
  pressStart: string;
  greatJob: string;
  keepPracticing: string;
  immersionMode: string;
  
  // Library
  library: string;
  badges: string;
  collection: string;
}

export const TRANSLATIONS: Record<"en" | "km", TranslationSet> = {
  en: {
    // Navigation
    home: "Home",
    back: "Back",
    start: "Start",
    continue: "Continue",
    
    // Game modes
    platform: "Platform",
    runner: "Runner",
    defender: "Defender",
    timedTest: "Timed Test",
    freeTyping: "Free Typing",
    accuracyMode: "Accuracy Mode",
    multiplayer: "Multiplayer",
    challenges: "Challenges",
    culturalChallenges: "Cultural Challenges",
    
    // Stats
    stats: "Stats",
    wpm: "WPM",
    accuracy: "Accuracy",
    errors: "Errors",
    streak: "Streak",
    bestScore: "Best Score",
    totalStars: "Total Stars",
    
    // Actions
    play: "Play",
    reset: "Reset",
    finish: "Finish",
    save: "Save",
    cancel: "Cancel",
    
    // Labels
    difficulty: "Difficulty",
    beginner: "Beginner",
    intermediate: "Intermediate",
    expert: "Expert",
    duration: "Duration",
    
    // Multiplayer
    createRoom: "Create Room",
    joinRoom: "Join Room",
    roomCode: "Room Code",
    waitingForPlayers: "Waiting for players...",
    startRace: "Start Race",
    raceComplete: "Race Complete!",
    
    // Themes
    themeSettings: "Theme Settings",
    chooseTheme: "Choose Your Theme",
    fontStyle: "Font Style",
    
    // Cultural
    proverbs: "Proverbs",
    history: "History",
    dailyLife: "Daily Life",
    greetings: "Greetings",
    nature: "Nature",
    
    // Messages
    typeHere: "Type here...",
    pressStart: "Press Start",
    greatJob: "Great job!",
    keepPracticing: "Keep practicing!",
    immersionMode: "Immersion Mode",
    
    // Library
    library: "Library",
    badges: "Badges",
    collection: "Collection",
  },
  km: {
    // Navigation
    home: "ទំព័រដើម",
    back: "ថយក្រោយ",
    start: "ចាប់ផ្តើម",
    continue: "បន្ត",
    
    // Game modes
    platform: "វេទិកា",
    runner: "រត់",
    defender: "ការពារ",
    timedTest: "ប្រឡងពេលវេលា",
    freeTyping: "សរសេរដោយសេរី",
    accuracyMode: "ភាពត្រឹមត្រូវ",
    multiplayer: "ប្រកួតផ្ទាល់",
    challenges: "ការប្រកួត",
    culturalChallenges: "បញ្ហាប្រឈមវប្បធម៌",
    
    // Stats
    stats: "ស្ថិតិ",
    wpm: "ពាក្យ/នាទី",
    accuracy: "ភាពត្រឹមត្រូវ",
    errors: "កំហុស",
    streak: "ខ្សែបន្ត",
    bestScore: "ពិន្ទុល្អបំផុត",
    totalStars: "ផ្កាយសរុប",
    
    // Actions
    play: "លេង",
    reset: "កំណត់ឡើងវិញ",
    finish: "បញ្ចប់",
    save: "រក្សាទុក",
    cancel: "បោះបង់",
    
    // Labels
    difficulty: "កម្រិត",
    beginner: "អ្នកចាប់ផ្តើម",
    intermediate: "កម្រិតមធ្យម",
    expert: "ជំនាញ",
    duration: "រយៈពេល",
    
    // Multiplayer
    createRoom: "បង្កើតបន្ទប់",
    joinRoom: "ចូលរួមបន្ទប់",
    roomCode: "លេខកូដបន្ទប់",
    waitingForPlayers: "រង់ចាំអ្នកលេង...",
    startRace: "ចាប់ផ្តើមប្រកួត",
    raceComplete: "ប្រកួតបញ្ចប់!",
    
    // Themes
    themeSettings: "ការកំណត់រូបរាង",
    chooseTheme: "ជ្រើសរើសរូបរាង",
    fontStyle: "រចនាអក្សរ",
    
    // Cultural
    proverbs: "សុភាសិត",
    history: "ប្រវត្តិសាស្ត្រ",
    dailyLife: "ជីវិតប្រចាំថ្ងៃ",
    greetings: "ការស្វាគមន៍",
    nature: "ធម្មជាតិ",
    
    // Messages
    typeHere: "សរសេរនៅទីនេះ...",
    pressStart: "ចុចចាប់ផ្តើម",
    greatJob: "ពូកែណាស់!",
    keepPracticing: "បន្តអនុវត្ត!",
    immersionMode: "របៀបខ្មែរពេញ",
    
    // Library
    library: "បណ្ណាល័យ",
    badges: "មេដាយ",
    collection: "ការប្រមូល",
  },
};

export function getTranslation(lang: "en" | "km"): TranslationSet {
  return TRANSLATIONS[lang];
}
