export interface AvatarSkill {
  id: string;
  name: string;
  projectile: string;
  trail: string;
  impact: string;
  color: string;
  sound?: string;
}

export const AVATAR_SKILLS: Record<string, AvatarSkill> = {
  "🐯": { id: "tiger", name: "Tiger Claw", projectile: "🔥", trail: "orange", impact: "💥", color: "#f97316" },
  "🐲": { id: "dragon", name: "Dragon Fire", projectile: "🔥", trail: "red", impact: "💥", color: "#ef4444" },
  "🦁": { id: "lion", name: "Lion Roar", projectile: "💨", trail: "yellow", impact: "✨", color: "#eab308" },
  "🐼": { id: "panda", name: "Bamboo Strike", projectile: "🎋", trail: "green", impact: "🌿", color: "#22c55e" },
  "🦊": { id: "fox", name: "Fox Magic", projectile: "✨", trail: "purple", impact: "💫", color: "#a855f7" },
  "🐵": { id: "monkey", name: "Banana Throw", projectile: "🍌", trail: "yellow", impact: "💥", color: "#fbbf24" },
  "🐸": { id: "frog", name: "Tongue Lash", projectile: "💚", trail: "green", impact: "💦", color: "#4ade80" },
  "🐰": { id: "rabbit", name: "Carrot Shot", projectile: "🥕", trail: "orange", impact: "✨", color: "#fb923c" },
  "🐶": { id: "dog", name: "Bark Attack", projectile: "💨", trail: "brown", impact: "💥", color: "#a16207" },
  "🐱": { id: "cat", name: "Scratch Fury", projectile: "✨", trail: "pink", impact: "💫", color: "#ec4899" },
  "🦄": { id: "unicorn", name: "Rainbow Blast", projectile: "🌈", trail: "rainbow", impact: "✨", color: "#8b5cf6" },
  "🐷": { id: "pig", name: "Mud Splash", projectile: "💨", trail: "brown", impact: "💥", color: "#92400e" },
  "🦉": { id: "owl", name: "Night Vision", projectile: "👁️", trail: "purple", impact: "✨", color: "#7c3aed" },
  "🐨": { id: "koala", name: "Eucalyptus Throw", projectile: "🍃", trail: "green", impact: "🌿", color: "#16a34a" },
  "🦖": { id: "trex", name: "Dino Bite", projectile: "🦴", trail: "white", impact: "💥", color: "#78716c" },
  "🦕": { id: "brachiosaurus", name: "Stomp", projectile: "💨", trail: "brown", impact: "🌋", color: "#b45309" },
  "🐙": { id: "octopus", name: "Ink Spray", projectile: "💜", trail: "purple", impact: "💦", color: "#9333ea" },
  "🦋": { id: "butterfly", name: "Wing Dust", projectile: "✨", trail: "pink", impact: "💫", color: "#f472b6" },
  "🐝": { id: "bee", name: "Stinger Shot", projectile: "🔶", trail: "yellow", impact: "⚡", color: "#facc15" },
  "🐢": { id: "turtle", name: "Shell Spin", projectile: "💚", trail: "green", impact: "💥", color: "#15803d" },
  "🦜": { id: "parrot", name: "Feather Storm", projectile: "🪶", trail: "rainbow", impact: "✨", color: "#dc2626" },
  "🐬": { id: "dolphin", name: "Water Jet", projectile: "💧", trail: "blue", impact: "💦", color: "#0ea5e9" },
  "🐳": { id: "whale", name: "Water Spout", projectile: "💨", trail: "blue", impact: "🌊", color: "#0284c7" },
  "🦈": { id: "shark", name: "Fin Slash", projectile: "🔵", trail: "blue", impact: "💥", color: "#1e40af" },
  "🦓": { id: "zebra", name: "Stripe Strike", projectile: "⚡", trail: "white", impact: "💫", color: "#171717" },
  "🦒": { id: "giraffe", name: "Neck Swing", projectile: "🟤", trail: "yellow", impact: "💥", color: "#ca8a04" },
  "🐘": { id: "elephant", name: "Trunk Spray", projectile: "💧", trail: "gray", impact: "💦", color: "#6b7280" },
  "🐅": { id: "tiger2", name: "Pounce", projectile: "🧡", trail: "orange", impact: "💥", color: "#ea580c" },
  "🐺": { id: "wolf", name: "Howl Wave", projectile: "💨", trail: "gray", impact: "🌙", color: "#4b5563" },
  "🐗": { id: "boar", name: "Tusk Charge", projectile: "💨", trail: "brown", impact: "💥", color: "#78350f" },
  "🐧": { id: "penguin", name: "Ice Slide", projectile: "❄️", trail: "cyan", impact: "💎", color: "#22d3d8" },
  "🦭": { id: "seal", name: "Ball Bounce", projectile: "🔵", trail: "blue", impact: "✨", color: "#3b82f6" },
  "🦦": { id: "otter", name: "Rock Throw", projectile: "🪨", trail: "gray", impact: "💥", color: "#737373" },
  "🦥": { id: "sloth", name: "Lazy Swipe", projectile: "💤", trail: "purple", impact: "😴", color: "#a78bfa" },
  "🐿️": { id: "squirrel", name: "Acorn Throw", projectile: "🌰", trail: "brown", impact: "💥", color: "#a16207" },
  "🦩": { id: "flamingo", name: "Pink Flash", projectile: "💗", trail: "pink", impact: "✨", color: "#f472b6" },
  "🦚": { id: "peacock", name: "Feather Fan", projectile: "💙", trail: "teal", impact: "💫", color: "#14b8a6" },
  "🐊": { id: "crocodile", name: "Jaw Snap", projectile: "🟢", trail: "green", impact: "💥", color: "#166534" },
  "🦂": { id: "scorpion", name: "Venom Sting", projectile: "💜", trail: "purple", impact: "☠️", color: "#7e22ce" },
  "🕊️": { id: "dove", name: "Peace Wave", projectile: "🤍", trail: "white", impact: "✨", color: "#f5f5f5" },
  "🦇": { id: "bat", name: "Sonic Scream", projectile: "💜", trail: "purple", impact: "🔊", color: "#581c87" },
  "🐍": { id: "snake", name: "Poison Spit", projectile: "💚", trail: "green", impact: "☠️", color: "#15803d" },
  "🦀": { id: "crab", name: "Pincer Snap", projectile: "🔴", trail: "red", impact: "💥", color: "#b91c1c" },
  "🦞": { id: "lobster", name: "Claw Crush", projectile: "🔴", trail: "red", impact: "💥", color: "#dc2626" },
  "🦐": { id: "shrimp", name: "Quick Dash", projectile: "💨", trail: "pink", impact: "✨", color: "#fda4af" },
  "🐟": { id: "fish", name: "Bubble Shot", projectile: "🔵", trail: "blue", impact: "💧", color: "#60a5fa" },
  "🐞": { id: "ladybug", name: "Spot Blast", projectile: "🔴", trail: "red", impact: "✨", color: "#ef4444" },
  "🦗": { id: "cricket", name: "Jump Kick", projectile: "💚", trail: "green", impact: "💥", color: "#4ade80" },
  "🪲": { id: "beetle", name: "Shell Bash", projectile: "🟤", trail: "brown", impact: "💥", color: "#78350f" },
  "⚡": { id: "lightning", name: "Speed Bolt", projectile: "⚡", trail: "yellow", impact: "💥", color: "#fbbf24" },
  "🏹": { id: "archer", name: "Arrow Shot", projectile: "🏹", trail: "brown", impact: "🎯", color: "#a16207" },
  "🌀": { id: "whirlwind", name: "Whiz Spin", projectile: "🌀", trail: "cyan", impact: "💨", color: "#06b6d4" },
};

export function getAvatarSkill(icon: string): AvatarSkill {
  return AVATAR_SKILLS[icon] || {
    id: "default",
    name: "Energy Blast",
    projectile: "⚡",
    trail: "blue",
    impact: "💥",
    color: "#3b82f6"
  };
}

export function getTrailGradient(color: string): string {
  if (color === "rainbow") {
    return "linear-gradient(90deg, #ef4444, #f97316, #eab308, #22c55e, #3b82f6, #8b5cf6)";
  }
  return `linear-gradient(90deg, ${color}, transparent)`;
}
