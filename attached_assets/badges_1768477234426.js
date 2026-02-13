// js/badges.js
// 150 badges unlocked by total stars.
// Max stars = 243. We spread 150 unlock points across 1..243.

const ICONS = [
  "🐯","🐲","🦁","🐼","🦊","🐵","🐸","🐰","🐶","🐱",
  "🦄","🐷","🦉","🐨","🦖","🦕","🐙","🦋","🐝","🐢",
  "🦜","🐬","🐳","🦈","🦓","🦒","🐘","🦌","🐅","🐺",
  "🐗","🐧","🦭","🦦","🦥","🐿️","🦩","🦚","🐊","🦂",
  "🕊️","🦇","🐍","🦀","🦞","🦐","🐟","🐞","🦗","🪲"
];

export function makeBadges(){
  const maxStars = 243;
  const totalBadges = 150;

  const badges = [];
  for(let i=1;i<=totalBadges;i++){
    const icon = ICONS[(i-1) % ICONS.length];
    const threshold = Math.max(1, Math.ceil((i * maxStars) / totalBadges));
    badges.push({
      id: `B${String(i).padStart(3,"0")}`,
      icon,
      name: `Badge ${String(i).padStart(3,"0")}`,
      unlock: { type:"stars", value: threshold }
    });
  }
  // Make a few "special" looking ones at key milestones (same unlock type, nicer name)
  const specials = [
    { idx: 1,   name:"Starter Paw" },
    { idx: 10,  name:"Quick Claws" },
    { idx: 25,  name:"Silver Tail" },
    { idx: 50,  name:"Golden Mane" },
    { idx: 75,  name:"Dragon Heart" },
    { idx: 100, name:"Master Fang" },
    { idx: 125, name:"Mythic Wing" },
    { idx: 150, name:"Typing Legend" },
  ];
  for(const s of specials){
    badges[s.idx-1].name = s.name;
  }
  return badges;
}

// return newly unlocked badges (ids)
export function unlockBadgesByStars(badges, ownedIds, totalStars){
  const owned = new Set(ownedIds);
  const newly = [];

  for(const b of badges){
    if(owned.has(b.id)) continue;
    if(b.unlock.type === "stars" && totalStars >= b.unlock.value){
      owned.add(b.id);
      newly.push(b.id);
    }
  }
  return newly;
}
