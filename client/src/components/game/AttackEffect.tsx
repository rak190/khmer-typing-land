import React, { useEffect, useState, useRef } from 'react';
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
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  targetX: number;
  targetY: number;
  phase: 'flying' | 'impact' | 'done';
  rotation: number;
}

export const AttackEffect: React.FC<AttackEffectProps> = ({
  trigger,
  mascot,
  startX = 15,
  startY = 60,
  targetX = 85,
  targetY = 60,
  onComplete
}) => {
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (trigger <= 0) return;

    const skill = getAvatarSkill(mascot);
    const id = Date.now() + Math.random();
    
    const newProjectile: Projectile = {
      id,
      skill,
      startX,
      startY,
      currentX: startX,
      currentY: startY,
      targetX,
      targetY,
      phase: 'flying',
      rotation: 0
    };

    setProjectiles(prev => [...prev, newProjectile]);

    let frame = 0;
    const totalFrames = 15;
    
    const animate = () => {
      frame++;
      const progress = Math.min(frame / totalFrames, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      setProjectiles(prev => prev.map(p => {
        if (p.id !== id) return p;
        return {
          ...p,
          currentX: startX + (targetX - startX) * easeOut,
          currentY: startY + (targetY - startY) * easeOut - Math.sin(progress * Math.PI) * 15,
          rotation: p.rotation + 15
        };
      }));

      if (frame < totalFrames) {
        requestAnimationFrame(animate);
      } else {
        setProjectiles(prev => prev.map(p => 
          p.id === id ? { ...p, phase: 'impact' } : p
        ));
        onComplete?.();
        
        setTimeout(() => {
          setProjectiles(prev => prev.filter(p => p.id !== id));
        }, 500);
      }
    };

    requestAnimationFrame(animate);
  }, [trigger, mascot, startX, startY, targetX, targetY, onComplete]);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none overflow-hidden z-40">
      {projectiles.map((proj) => (
        <div key={proj.id}>
          {proj.phase === 'flying' && (
            <>
              <div
                className="absolute text-4xl transition-none will-change-transform"
                style={{
                  left: `${proj.currentX}%`,
                  top: `${proj.currentY}%`,
                  transform: `translate(-50%, -50%) rotate(${proj.rotation}deg) scale(1.2)`,
                  filter: `drop-shadow(0 0 15px ${proj.skill.color}) drop-shadow(0 0 25px ${proj.skill.color})`,
                  zIndex: 50
                }}
              >
                {proj.skill.projectile}
              </div>
              
              <div
                className="absolute h-2 rounded-full opacity-80"
                style={{
                  left: `${proj.startX}%`,
                  top: `${proj.currentY}%`,
                  width: `${Math.max(0, proj.currentX - proj.startX)}%`,
                  background: getTrailGradient(proj.skill.color),
                  transform: 'translateY(-50%)',
                  boxShadow: `0 0 10px ${proj.skill.color}, 0 0 20px ${proj.skill.color}`,
                  zIndex: 45
                }}
              />
              
              {[...Array(5)].map((_, i) => {
                const delay = i * 0.15;
                const particleX = proj.startX + (proj.currentX - proj.startX) * (1 - delay);
                return (
                  <div
                    key={`particle-${proj.id}-${i}`}
                    className="absolute w-2 h-2 rounded-full animate-pulse"
                    style={{
                      left: `${particleX}%`,
                      top: `${proj.currentY + (Math.random() - 0.5) * 10}%`,
                      background: proj.skill.color,
                      opacity: 0.6 - i * 0.1,
                      boxShadow: `0 0 5px ${proj.skill.color}`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  />
                );
              })}
            </>
          )}

          {proj.phase === 'impact' && (
            <div
              className="absolute"
              style={{
                left: `${proj.targetX}%`,
                top: `${proj.targetY}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: 60
              }}
            >
              <div 
                className="text-6xl animate-ping"
                style={{
                  filter: `drop-shadow(0 0 30px ${proj.skill.color})`,
                }}
              >
                {proj.skill.impact}
              </div>
              
              <div 
                className="absolute inset-0 flex items-center justify-center"
              >
                <div 
                  className="w-24 h-24 rounded-full animate-ping opacity-50"
                  style={{
                    background: `radial-gradient(circle, ${proj.skill.color} 0%, transparent 70%)`
                  }}
                />
              </div>
              
              {[...Array(8)].map((_, i) => {
                const angle = (i / 8) * Math.PI * 2;
                return (
                  <div
                    key={`burst-${proj.id}-${i}`}
                    className="absolute w-3 h-3 rounded-full animate-ping"
                    style={{
                      left: `${50 + Math.cos(angle) * 40}%`,
                      top: `${50 + Math.sin(angle) * 40}%`,
                      background: proj.skill.color,
                      animationDelay: `${i * 50}ms`,
                      boxShadow: `0 0 10px ${proj.skill.color}`
                    }}
                  />
                );
              })}
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
      <span 
        className="text-xl"
        style={{ filter: `drop-shadow(0 0 5px ${skill.color})` }}
      >
        {skill.projectile}
      </span>
      <span 
        className="font-bold text-xs uppercase tracking-wider" 
        style={{ color: skill.color }}
      >
        {skill.name}
      </span>
    </div>
  );
};

interface AvatarWithSkillProps {
  mascot: string;
  size?: 'sm' | 'md' | 'lg';
  showSkill?: boolean;
  isAttacking?: boolean;
  className?: string;
}

export const AvatarWithSkill: React.FC<AvatarWithSkillProps> = ({
  mascot,
  size = 'md',
  showSkill = true,
  isAttacking = false,
  className
}) => {
  const skill = getAvatarSkill(mascot);
  const sizeClasses = {
    sm: 'w-12 h-12 text-2xl',
    md: 'w-16 h-16 text-3xl',
    lg: 'w-20 h-20 text-4xl'
  };

  return (
    <div className={cn("relative flex flex-col items-center gap-1", className)}>
      <div 
        className={cn(
          "rounded-2xl flex items-center justify-center border-2 transition-all duration-200",
          sizeClasses[size],
          isAttacking && "scale-110 animate-pulse"
        )}
        style={{
          borderColor: skill.color,
          backgroundColor: `${skill.color}20`,
          boxShadow: isAttacking ? `0 0 30px ${skill.color}` : `0 0 15px ${skill.color}40`
        }}
      >
        {mascot}
        
        {isAttacking && (
          <div 
            className="absolute -right-2 -top-2 text-xl animate-bounce"
            style={{ filter: `drop-shadow(0 0 5px ${skill.color})` }}
          >
            {skill.projectile}
          </div>
        )}
      </div>
      
      {showSkill && (
        <div 
          className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
          style={{ 
            color: skill.color,
            backgroundColor: `${skill.color}20`
          }}
        >
          {skill.name}
        </div>
      )}
    </div>
  );
};
