import React from 'react';
import { useGameStore } from '@/lib/store';
import { buildWorlds } from '@/lib/curriculum';
import { Link, useRoute } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Star } from 'lucide-react';
import { HUD } from '@/components/HUD';
import { cn } from '@/lib/utils';
import { AdBanner } from '@/components/AdBanner';

import { STORY_CHAPTERS } from '@/lib/story';

const WORLDS = buildWorlds();

export const StageSelect: React.FC = () => {
  const [, params] = useRoute("/world/:id");
  const { progress, getTotalStars } = useGameStore();
  
  const world = WORLDS.find(w => w.id === params?.id);
  const chapter = STORY_CHAPTERS.find(c => c.worldId === world?.id);
  
  if (!world) return <div className="text-white p-20">World not found</div>;

  return (
    <div className="min-h-screen bg-background pb-20 pt-20" data-world={world.id}>
      <HUD />

      <div className="container mx-auto px-4 mt-8 max-w-5xl">
        <div className="flex flex-col md:flex-row md:items-center gap-6 mb-12 glass-panel p-8 rounded-3xl border-primary/20">
          <Button variant="secondary" size="icon" className="rounded-full shrink-0" onClick={() => window.history.back()}>
            <ArrowLeft size={18} />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-black text-foreground">{world.name}</h1>
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">Chapter {world.id.replace('w','')}</span>
            </div>
            <h2 className="text-xl font-bold text-primary mb-3">Quest: {chapter?.title}</h2>
            <p className="text-muted-foreground italic text-lg leading-relaxed">"{chapter?.intro}"</p>
          </div>
          <div className="flex flex-col items-center justify-center p-6 bg-secondary rounded-2xl border border-border min-w-[150px]">
            <div className="text-5xl mb-2 animate-pulse">{world.logo}</div>
            <div className="text-[10px] font-black uppercase text-red-600 tracking-tighter">Bounty Target</div>
            <div className="text-sm font-bold text-foreground">{chapter?.monsterName}</div>
          </div>
        </div>

        {/* Ad Banner */}
        <AdBanner format="horizontal" className="mb-6" />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {world.stages.map((stage) => {
            const stageKey = `${world.id}${stage.id}`;
            const stars = progress.starsByStage[stageKey] || 0;
            
            return (
              <div key={stage.id} className="glass-panel p-5 rounded-2xl group hover:border-primary/50 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="font-mono text-xs text-primary/70 uppercase tracking-widest border border-primary/20 px-2 py-0.5 rounded">
                    {stage.id.toUpperCase()}
                  </div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3].map(i => (
                      <Star 
                        key={i} 
                        size={14} 
                        className={cn(
                          i <= stars ? "fill-yellow-400 text-yellow-400" : "text-slate-700"
                        )} 
                      />
                    ))}
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-foreground mb-4 line-clamp-1">{stage.name}</h3>
                
                <Link href={`/play/${world.id}/${stage.id}`}>
                  <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    Play
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
