import React from 'react';
import { useGameStore } from '@/lib/store';
import { makeBadges } from '@/lib/badges';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Lock } from 'lucide-react';
import { HUD } from '@/components/HUD';
import { cn } from '@/lib/utils';

const ALL_BADGES = makeBadges();

export const Badges: React.FC = () => {
  const { badgesOwned, selectedBadgeId, selectBadge, getTotalStars } = useGameStore();
  const ownedSet = new Set(badgesOwned);

  return (
    <div className="min-h-screen bg-background pb-20 pt-20">
      <HUD />

      <div className="container mx-auto px-4 mt-8 max-w-5xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/home">
            <Button variant="secondary" size="icon" className="rounded-full">
              <ArrowLeft size={18} />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-black text-foreground">ការប្រមូល</h1>
            <p className="text-muted-foreground font-medium font-body">
              បានបើកសោ: <span className="text-primary font-bold">{badgesOwned.length}</span> / {ALL_BADGES.length}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {ALL_BADGES.map((badge) => {
            const isOwned = ownedSet.has(badge.id);
            const isSelected = selectedBadgeId === badge.id;
            
            return (
              <button
                key={badge.id}
                disabled={!isOwned}
                onClick={() => selectBadge(badge.id)}
                className={cn(
                  "relative p-4 rounded-2xl border flex flex-col items-center gap-3 transition-all duration-200 group text-left",
                  isOwned 
                    ? "bg-card border-border hover:border-primary/50 shadow-sm" 
                    : "bg-muted/50 border-border opacity-50 cursor-not-allowed",
                  isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background bg-primary/5 border-primary shadow-md"
                )}
              >
                <div className="text-4xl filter drop-shadow-lg group-hover:scale-110 transition-transform duration-200">
                  {badge.icon}
                </div>
                
                <div className="w-full text-center">
                  <div className={cn("text-xs font-bold truncate", isOwned ? "text-foreground" : "text-muted-foreground")}>
                    {badge.name}
                  </div>
                  {!isOwned && (
                    <div className="text-[10px] text-muted-foreground flex items-center justify-center gap-1 mt-1 font-medium font-body">
                      <Lock size={8} /> ត្រូវការ {badge.unlock.value} ⭐
                    </div>
                  )}
                  {isSelected && (
                    <div className="text-[10px] text-primary font-black uppercase tracking-widest mt-1 font-body">
                      កំពុងប្រើ
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
