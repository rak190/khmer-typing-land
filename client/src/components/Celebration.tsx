import React, { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  velocityX: number;
  velocityY: number;
  type: "confetti" | "star" | "sparkle";
}

const COLORS = [
  "#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4",
  "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F", "#BB8FCE",
  "#FF9FF3", "#54A0FF", "#5F27CD", "#00D2D3", "#FF9F43",
];

const SHAPES = {
  confetti: ["■", "●", "▲", "★", "◆", "♦"],
  star: ["★", "✦", "✧", "⭐"],
  sparkle: ["✨", "✦", "·", "•"],
};

interface CelebrationProps {
  type: "confetti" | "stars" | "fireworks" | "victory";
  duration?: number;
  intensity?: "low" | "medium" | "high";
  onComplete?: () => void;
}

export const Celebration: React.FC<CelebrationProps> = ({
  type,
  duration = 3000,
  intensity = "medium",
  onComplete,
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isActive, setIsActive] = useState(true);

  const particleCount = intensity === "low" ? 30 : intensity === "medium" ? 60 : 100;

  const createConfetti = useCallback(() => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: -10 - Math.random() * 20,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 8 + Math.random() * 12,
        rotation: Math.random() * 360,
        velocityX: (Math.random() - 0.5) * 4,
        velocityY: 2 + Math.random() * 3,
        type: "confetti",
      });
    }
    return newParticles;
  }, [particleCount]);

  const createStars = useCallback(() => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      newParticles.push({
        id: i,
        x: 50 + Math.cos(angle) * 5,
        y: 50 + Math.sin(angle) * 5,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 12 + Math.random() * 16,
        rotation: Math.random() * 360,
        velocityX: Math.cos(angle) * (3 + Math.random() * 2),
        velocityY: Math.sin(angle) * (3 + Math.random() * 2),
        type: "star",
      });
    }
    return newParticles;
  }, [particleCount]);

  const createFireworks = useCallback(() => {
    const newParticles: Particle[] = [];
    const burstPoints = [
      { x: 25, y: 30 },
      { x: 50, y: 20 },
      { x: 75, y: 35 },
    ];

    burstPoints.forEach((point, burstIndex) => {
      const burstColor = COLORS[Math.floor(Math.random() * COLORS.length)];
      for (let i = 0; i < particleCount / 3; i++) {
        const angle = (i / (particleCount / 3)) * Math.PI * 2;
        const speed = 2 + Math.random() * 3;
        newParticles.push({
          id: burstIndex * 100 + i,
          x: point.x,
          y: point.y,
          color: burstColor,
          size: 6 + Math.random() * 8,
          rotation: Math.random() * 360,
          velocityX: Math.cos(angle) * speed,
          velocityY: Math.sin(angle) * speed,
          type: "sparkle",
        });
      }
    });
    return newParticles;
  }, [particleCount]);

  const createVictory = useCallback(() => {
    const confetti = createConfetti();
    const stars = createStars();
    return [...confetti.slice(0, particleCount / 2), ...stars.slice(0, particleCount / 2)];
  }, [createConfetti, createStars, particleCount]);

  useEffect(() => {
    let newParticles: Particle[] = [];
    switch (type) {
      case "confetti":
        newParticles = createConfetti();
        break;
      case "stars":
        newParticles = createStars();
        break;
      case "fireworks":
        newParticles = createFireworks();
        break;
      case "victory":
        newParticles = createVictory();
        break;
    }
    setParticles(newParticles);

    const timer = setTimeout(() => {
      setIsActive(false);
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [type, duration, createConfetti, createStars, createFireworks, createVictory, onComplete]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-celebration"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            color: particle.color,
            fontSize: `${particle.size}px`,
            transform: `rotate(${particle.rotation}deg)`,
            animation: type === "confetti" 
              ? `confetti-fall ${2 + Math.random()}s ease-out forwards`
              : type === "stars" || type === "fireworks"
              ? `burst ${1.5 + Math.random() * 0.5}s ease-out forwards`
              : `celebration ${2 + Math.random()}s ease-out forwards`,
            "--vx": particle.velocityX,
            "--vy": particle.velocityY,
          } as React.CSSProperties}
        >
          {SHAPES[particle.type][Math.floor(Math.random() * SHAPES[particle.type].length)]}
        </div>
      ))}
    </div>
  );
};

export const StarBurst: React.FC<{ x?: number; y?: number }> = ({ x = 50, y = 50 }) => {
  const [stars, setStars] = useState<{ id: number; angle: number; delay: number }[]>([]);

  useEffect(() => {
    const newStars = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      angle: (i / 8) * 360,
      delay: i * 50,
    }));
    setStars(newStars);

    const timer = setTimeout(() => setStars([]), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className="fixed pointer-events-none z-50"
      style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}
    >
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute text-yellow-400 text-2xl"
          style={{
            animation: `star-burst 0.6s ease-out ${star.delay}ms forwards`,
            transform: `rotate(${star.angle}deg)`,
          }}
        >
          ★
        </div>
      ))}
    </div>
  );
};

export const StreakFlame: React.FC<{ streak: number }> = ({ streak }) => {
  if (streak < 3) return null;

  const intensity = Math.min(streak / 10, 1);
  const flames = Math.min(Math.floor(streak / 3), 5);

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: flames }).map((_, i) => (
        <span
          key={i}
          className="animate-pulse"
          style={{
            fontSize: `${16 + intensity * 8}px`,
            animationDelay: `${i * 100}ms`,
            filter: `hue-rotate(${-intensity * 30}deg)`,
          }}
        >
          🔥
        </span>
      ))}
      <span 
        className={cn(
          "font-black text-lg",
          streak >= 10 ? "text-orange-500" : streak >= 5 ? "text-yellow-500" : "text-amber-400"
        )}
      >
        ×{streak}
      </span>
    </div>
  );
};
