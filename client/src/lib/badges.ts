export interface Badge {
  id: string;
  icon: string;
  name: string;
  unlock: 
    | { type: "stars"; value: number }
    | { type: "wpm"; value: number }
    | { type: "accuracy"; value: number };
}

const ICONS = [
  "🐯","🐲","🦁","🐼","🦊","🐵","🐸","🐰","🐶","🐱",
  "🦄","🐷","🦉","🐨","🦖","🦕","🐙","🦋","🐝","🐢",
  "🦜","🐬","🐳","🦈","🦓","🦒","🐘","鹿","🐅","🐺",
  "🐗","🐧","🦭","🦦","🦥","🐿️","🦩","🦚","🐊","🦂",
  "🕊️","🦇","🐍","🦀","🦞","🦐","🐟","🐞","🦗","🪲"
];

export function makeBadges(): Badge[] {
  const maxStars = 243;
  const totalBadges = 150;

  const badges: Badge[] = [];
  for(let i=1;i<=totalBadges;i++){
    const icon = ICONS[(i-1) % ICONS.length];
    const threshold = Math.max(1, Math.ceil((i * maxStars) / totalBadges));
    badges.push({
      id: `B${String(i).padStart(3,"0")}`,
      icon,
      name: `មេដាយ ${String(i).padStart(3,"0")}`,
      unlock: { type:"stars", value: threshold }
    });
  }
  
  // Custom Performance Badges
  badges.push({ id: "P001", icon: "⚡", name: "អ្នកវាយលឿន", unlock: { type: "wpm", value: 40 } });
  badges.push({ id: "P002", icon: "🏹", name: "អ្នកវាយត្រឹមត្រូវ", unlock: { type: "accuracy", value: 100 } });
  badges.push({ id: "P003", icon: "🌀", name: "ជើងឯកវ័យក្មេង", unlock: { type: "wpm", value: 60 } });

  // Make a few "special" looking ones at key milestones
  const specials = [
    { idx: 1,   name:"អ្នកចាប់ផ្តើម" },
    { idx: 10,  name:"វាយរហ័ស" },
    { idx: 25,  name:"កម្រិតប្រាក់" },
    { idx: 50,  name:"កម្រិតមាស" },
    { idx: 75,  name:"បេះដូងក្លាហាន" },
    { idx: 100, name:"អ្នកជំនាញ" },
    { idx: 125, name:"ស្លាបរឿងព្រេង" },
    { idx: 150, name:"ជើងឯកវាយអក្សរ" },
  ];
  for(const s of specials){
    if (badges[s.idx-1]) {
      badges[s.idx-1].name = s.name;
    }
  }
  return badges;
}

export function unlockBadges(
  badges: Badge[], 
  ownedIds: string[], 
  stats: { totalStars: number; maxWpm: number; maxAccuracy: number }
): string[] {
  const owned = new Set(ownedIds);
  const newly: string[] = [];

  for(const b of badges){
    if(owned.has(b.id)) continue;
    
    let canUnlock = false;
    if(b.unlock.type === "stars" && stats.totalStars >= b.unlock.value) canUnlock = true;
    if(b.unlock.type === "wpm" && stats.maxWpm >= b.unlock.value) canUnlock = true;
    if(b.unlock.type === "accuracy" && stats.maxAccuracy >= b.unlock.value) canUnlock = true;

    if(canUnlock) {
      owned.add(b.id);
      newly.push(b.id);
    }
  }
  return newly;
}
