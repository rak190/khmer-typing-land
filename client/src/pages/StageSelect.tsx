import React, { useEffect } from 'react';
import { useGameStore } from '@/lib/store';
import { buildWorlds } from '@/lib/curriculum';
import { Link, useRoute } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle2, Play, Sparkles, Star } from 'lucide-react';
import { HUD } from '@/components/HUD';
import { cn } from '@/lib/utils';
import { AdBanner } from '@/components/AdBanner';
import { WORLD_THEMES, applyTheme, getThemeById } from '@/lib/themes';

import { STORY_CHAPTERS } from '@/lib/story';

const WORLDS = buildWorlds();

export const StageSelect: React.FC = () => {
  const [, params] = useRoute("/world/:id");
  const { progress, profile } = useGameStore();
  
  const world = WORLDS.find(w => w.id === params?.id);
  const chapter = STORY_CHAPTERS.find(c => c.worldId === world?.id);
  const worldTheme = world ? WORLD_THEMES[world.id] : undefined;
  const accentColor = worldTheme?.colors.primary || "var(--primary)";
  const accentAltColor = worldTheme?.colors.accent || "var(--accent)";
  
  useEffect(() => {
    if (params?.id && WORLD_THEMES[params.id]) {
      applyTheme(WORLD_THEMES[params.id]);
    } else {
      const themeId = (profile as any).theme || "angkor-classic";
      const currentTheme = getThemeById(themeId);
      applyTheme(currentTheme);
    }
  }, [params?.id, (profile as any).theme]);
  
  if (!world) return <div className="text-white p-20">រកមិនឃើញពិភពនេះទេ</div>;

  return (
    <div className="min-h-screen bg-background pb-20 pt-20" data-world={world.id}>
      <HUD />

      <div className="container mx-auto px-4 mt-8 max-w-6xl">
        <div
          className="stage-world-hero"
          style={{
            ['--stage-accent' as string]: accentColor,
            ['--stage-accent-alt' as string]: accentAltColor,
          }}
        >
          <Button variant="secondary" size="icon" className="stage-back-button" onClick={() => window.history.back()}>
            <ArrowLeft size={18} />
          </Button>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-3xl font-black text-foreground font-display">{world.name}</h1>
              <span className="stage-chapter-pill">ជំពូក {world.id.replace('w','')}</span>
            </div>
            <h2 className="text-xl font-bold text-primary mb-3">បេសកកម្ម: {chapter?.title}</h2>
            <p className="text-muted-foreground italic text-lg leading-relaxed">"{chapter?.intro}"</p>
          </div>
          <div className="stage-monster-target">
            <div className="text-5xl mb-2 animate-pulse">{world.logo}</div>
            <div className="text-[10px] font-black uppercase text-red-600 tracking-tighter">គោលដៅត្រូវឈ្នះ</div>
            <div className="text-sm font-bold text-foreground">{chapter?.monsterName}</div>
          </div>
        </div>

        <AdBanner format="horizontal" className="mb-6" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {world.stages.map((stage, index) => {
            const stageKey = `${world.id}${stage.id}`;
            const stars = progress.starsByStage[stageKey] || 0;
            const bestWpm = progress.bestWpmByStage?.[stageKey] || 0;
            const accuracy = progress.bestAccuracyByStage?.[stageKey] || 0;
            const isComplete = stars > 0;
            const stageNo = index + 1;
            
            return (
              <div
                key={stage.id}
                className={cn("stage-card group", isComplete && "stage-card-complete")}
                style={{
                  ['--stage-accent' as string]: accentColor,
                  ['--stage-accent-alt' as string]: accentAltColor,
                }}
              >
                <div className="stage-card-glow" />
                <div className="stage-card-topline">
                  <div className="stage-level-badge">Level {stageNo}</div>
                  <div className="stage-status-badge">
                    {isComplete ? (
                      <>
                        <CheckCircle2 size={13} />
                        បានបញ្ចប់
                      </>
                    ) : (
                      <>
                        <Sparkles size={13} />
                        រួចរាល់
                      </>
                    )}
                  </div>
                </div>

                <div className="stage-stars" aria-label={`${stars} stars`}>
                  {[1, 2, 3].map(i => (
                    <Star
                      key={i}
                      size={25}
                      strokeWidth={2.5}
                      className={cn(
                        "stage-star",
                        i <= stars ? "stage-star-earned" : "stage-star-empty"
                      )}
                    />
                  ))}
                </div>

                <div className="stage-card-symbol" aria-hidden="true">
                  {stage.pool.slice(0, 3).map((item, poolIndex) => (
                    <span key={`${item}-${poolIndex}`}>{item === " " ? "␣" : item}</span>
                  ))}
                </div>
                
                <h3 className="stage-card-title">{stage.name}</h3>

                <div className="stage-card-meta">
                  <div>
                    <span>{stage.pool.length}</span>
                    targets
                  </div>
                  <div>
                    <span>{bestWpm || "-"}</span>
                    WPM
                  </div>
                  <div>
                    <span>{accuracy ? Math.round(accuracy) : "-"}</span>
                    ACC
                  </div>
                </div>

                <div className="stage-target-preview" aria-label="Stage targets">
                  {stage.pool.slice(0, 6).map((item, poolIndex) => (
                    <span key={`${item}-${poolIndex}`} className="stage-target-chip">
                      {item === " " ? "space" : item}
                    </span>
                  ))}
                </div>
                
                <Link href={`/play/${world.id}/${stage.id}`}>
                  <Button className="stage-play-button">
                    <Play size={17} fill="currentColor" />
                    លេង
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
