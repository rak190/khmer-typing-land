import React from 'react';
import { useGameStore } from '@/lib/store';
import { buildWorlds } from '@/lib/curriculum';
import { Link, useRoute } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Star } from 'lucide-react';
import { HUD } from '@/components/HUD';
import { cn } from '@/lib/utils';

const WORLDS = buildWorlds();

export const StageSelect: React.FC = () => {
  const [, params] = useRoute("/world/:id");
  const { progress } = useGameStore();
  
  const world = WORLDS.find(w => w.id === params?.id);
  
  if (!world) return <div className="text-white p-20">World not found</div>;

  return (
    <div className="min-h-screen bg-background pb-20 pt-20">
      <HUD />

      <div className="container mx-auto px-4 mt-8 max-w-5xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="secondary" size="icon" className="rounded-full">
              <ArrowLeft size={18} />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-black text-white">{world.name}</h1>
            <p className="text-slate-400">Select a stage to begin training</p>
          </div>
        </div>

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
                
                <h3 className="text-lg font-bold text-white mb-4 line-clamp-1">{stage.name}</h3>
                
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
