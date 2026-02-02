import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { getAvatarSkill, getTrailGradient, type AvatarSkill } from '@/lib/avatar-skills';

interface AttackEffectProps {
  trigger: number;
  mascot: string;
  startX?: number;
  startY?: number;
  targetX?: number;
  targetY?: number;
  onComplete?: () => void;
}

interface Projectile {
  id: number;
  skill: AvatarSkill;
  x: number;
  y: number;
  active: boolean;
  impact: boolean;
}

export const AttackEffect: React.FC<AttackEffectProps> = ({
  trigger,
  mascot,
  startX = 20,
  startY = 50,
  targetX = 80,
  targetY = 50,
  onComplete
}) => {
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);

  useEffect(() => {
    if (trigger <= 0) return;

    const skill = getAvatarSkill(mascot);
    const newProjectile: Projectile = {
      id: Date.now(),
      skill,
      x: startX,
      y: startY,
      active: true,
      impact: false
    };

    setProjectiles(prev => [...prev, newProjectile]);

    const animationDuration = 300;
    const impactDuration = 400;

    setTimeout(() => {
      setProjectiles(prev =>
        prev.map(p => p.id === newProjectile.id ? { ...p, x: targetX, y: targetY } : p)
      );
    }, 50);

    setTimeout(() => {
      setProjectiles(prev =>
        prev.map(p => p.id === newProjectile.id ? { ...p, active: false, impact: true } : p)
      );
      onComplete?.();
    }, animationDuration);

    setTimeout(() => {
      setProjectiles(prev => prev.filter(p => p.id !== newProjectile.id));
    }, animationDuration + impactDuration);

  }, [trigger, mascot, startX, startY, targetX, targetY, onComplete]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
      {projectiles.map((proj) => (
        <div key={proj.id}>
          {proj.active && (
            <>
              <div
                className="absolute transition-all duration-300 ease-out"
                style={{
                  left: `${proj.x}%`,
                  top: `${proj.y}%`,
                  transform: 'translate(-50%, -50%)',
                  fontSize: '2rem',
                  filter: `drop-shadow(0 0 10px ${proj.skill.color})`,
                  zIndex: 40
                }}
              >
                {proj.skill.projectile}
              </div>
              <div
                className="absolute h-1 rounded-full transition-all duration-300"
                style={{
                  left: `${startX}%`,
                  top: `${proj.y}%`,
                  width: `${Math.abs(proj.x - startX)}%`,
                  background: getTrailGradient(proj.skill.color),
                  opacity: 0.6,
                  transform: 'translateY(-50%)'
                }}
              />
            </>
          )}

          {proj.impact && (
            <div
              className="absolute animate-ping"
              style={{
                left: `${targetX}%`,
                top: `${targetY}%`,
                transform: 'translate(-50%, -50%)',
                fontSize: '3rem',
                filter: `drop-shadow(0 0 20px ${proj.skill.color})`,
                zIndex: 50
              }}
            >
              {proj.skill.impact}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

interface SkillInfoProps {
  mascot: string;
  className?: string;
}

export const SkillInfo: React.FC<SkillInfoProps> = ({ mascot, className }) => {
  const skill = getAvatarSkill(mascot);

  return (
    <div className={cn("flex items-center gap-2 text-sm", className)}>
      <span className="text-xl">{skill.projectile}</span>
      <span className="font-bold" style={{ color: skill.color }}>{skill.name}</span>
    </div>
  );
};
