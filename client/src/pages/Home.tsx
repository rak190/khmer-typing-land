import React, { useEffect, useState } from 'react';
import { useGameStore } from '@/lib/store';
import { buildWorlds } from '@/lib/curriculum';
import { cn } from '@/lib/utils';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Lock, Play, GraduationCap, BarChart3, Trophy, Timer, Keyboard, ShieldCheck, Users, Landmark, Heart, School } from 'lucide-react';
import { HUD } from '@/components/HUD';
import { useTranslation } from '@/lib/useTranslation';
import { AdBanner } from '@/components/AdBanner';
import { WORLD_THEMES, applyTheme, getThemeById } from "@/lib/themes";
import { DonationPopup } from '@/components/DonationPopup';

import { STORY_CHAPTERS } from '@/lib/story';

const WORLDS = buildWorlds();

export const Home: React.FC = () => {
  const { getTotalStars, profile, setProfileName, badgesOwned, resetProgress, difficulty, setDifficulty } = useGameStore();
  const { t, lang } = useTranslation();
  const totalStars = getTotalStars();
  const [showDonation, setShowDonation] = useState(false);

  // Show donation popup only once per session
  useEffect(() => {
    const sessionDonation = sessionStorage.getItem('hasSeenDonationSession');
    if (!sessionDonation) {
      setShowDonation(true);
      sessionStorage.setItem('hasSeenDonationSession', 'true');
    }
  }, []);

  const handleCloseDonation = () => {
    localStorage.setItem('hasSeenDonation', 'true');
    setShowDonation(false);
  };

  // Ensure default theme is applied on Home
  useEffect(() => {
    const themeId = (profile as any).theme || "angkor-classic";
    const currentTheme = getThemeById(themeId);
    applyTheme(currentTheme);
  }, [(profile as any).theme]);

  const currentTheme = getThemeById((profile as any).theme || "angkor-classic");

  return (
    <div 
      className="min-h-screen pb-20 pt-20 relative overflow-hidden font-body transition-colors duration-500"
      style={{ 
        backgroundColor: currentTheme.colors.background,
        backgroundImage: `linear-gradient(to bottom, ${currentTheme.colors.background}, ${currentTheme.colors.secondary}40, ${currentTheme.colors.background})`
      }}
    >
      {/* Concept-inspired background elements */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Soft clouds */}
        <div 
          className="absolute top-[5%] left-[10%] w-64 h-32 blur-3xl rounded-full animate-cloud-slow opacity-60" 
          style={{ backgroundColor: currentTheme.colors.primary }}
        />
        <div 
          className="absolute top-[15%] right-[15%] w-80 h-40 blur-3xl rounded-full animate-cloud-fast opacity-40" 
          style={{ backgroundColor: currentTheme.colors.accent }}
        />
        <div 
          className="absolute top-[40%] left-[60%] w-48 h-24 blur-2xl rounded-full animate-cloud-slow opacity-30" 
          style={{ animationDelay: '1s', backgroundColor: currentTheme.colors.primary }} 
        />
        
        {/* Soft watercolor splashes */}
        <div 
          className="absolute top-[40%] left-[-5%] w-[50%] h-[50%] blur-[120px] rounded-full opacity-20" 
          style={{ backgroundColor: currentTheme.colors.primary }}
        />
        <div 
          className="absolute bottom-[10%] right-[-5%] w-[40%] h-[40%] blur-[100px] rounded-full opacity-20" 
          style={{ backgroundColor: currentTheme.colors.accent }}
        />
        <div 
          className="absolute top-[20%] right-0 w-[30%] h-[30%] blur-[100px] rounded-full opacity-20" 
          style={{ backgroundColor: currentTheme.colors.primary }}
        />

        {/* Floating Icons from concept */}
        <div className="absolute top-[10%] left-[5%] text-6xl opacity-30 rotate-12 animate-float" style={{ color: currentTheme.colors.primary }}>🏮</div>
        <div className="absolute top-[25%] right-[8%] text-4xl opacity-20 -rotate-12 animate-float" style={{ animationDelay: '1s', color: currentTheme.colors.accent }}>✨</div>
        <div className="absolute bottom-[20%] left-[12%] text-5xl opacity-30 animate-float" style={{ animationDelay: '3s', color: currentTheme.colors.primary }}>🐘</div>
        <div className="absolute bottom-[15%] right-[20%] text-6xl opacity-35 animate-float" style={{ animationDelay: '2s', color: currentTheme.colors.accent }}>🪷</div>
        <div className="absolute top-[60%] left-[2%] text-4xl opacity-20 animate-float" style={{ animationDelay: '4s', color: currentTheme.colors.primary }}>🏯</div>
        <div className="absolute top-[45%] right-[5%] text-5xl opacity-25 animate-float" style={{ animationDelay: '1.5s', color: currentTheme.colors.accent }}>🛶</div>
        <div className="absolute bottom-[5%] left-[40%] text-4xl opacity-20 animate-float" style={{ animationDelay: '5s', color: currentTheme.colors.primary }}>🏺</div>

        {/* Animated Particles */}
        <div className="absolute top-[20%] left-[30%] w-2 h-2 rounded-full animate-ping opacity-40" style={{ backgroundColor: currentTheme.colors.primary }} />
        <div className="absolute top-[60%] right-[30%] w-2 h-2 rounded-full animate-ping opacity-40" style={{ animationDelay: '1s', backgroundColor: currentTheme.colors.accent }} />
        <div className="absolute top-[80%] left-[60%] w-2 h-2 rounded-full animate-ping opacity-40" style={{ animationDelay: '2s', backgroundColor: currentTheme.colors.primary }} />
      </div>
      <div className="relative z-10">
        <HUD />
        
        <div className="container mx-auto px-4 mt-8 max-w-5xl">
          {/* Welcome Card */}
          <div 
            className="glass-panel p-8 rounded-3xl mb-12 border-white/40 backdrop-blur-md shadow-xl transition-all duration-500"
            style={{ 
              backgroundColor: `${currentTheme.colors.background}80`,
              borderColor: `${currentTheme.colors.primary}40`
            }}
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h1 className="text-4xl font-black text-foreground mb-2 font-display">
                  <span className="text-primary">វគ្គទី {Math.min(9, Math.floor(totalStars / 12) + 1)}:</span> {STORY_CHAPTERS[Math.min(8, Math.floor(totalStars / 12))]?.title}
                </h1>
                <p className="text-muted-foreground max-w-2xl text-lg italic">
                  "{STORY_CHAPTERS[Math.min(8, Math.floor(totalStars / 12))]?.intro}"
                </p>
              </div>
              
              <div className="flex flex-col items-center gap-2">
                <div className="text-6xl animate-bounce">
                  {STORY_CHAPTERS[Math.min(8, Math.floor(totalStars / 12))]?.monsterEmoji}
                </div>
                <div className="text-xs font-bold text-red-400 uppercase tracking-widest">គោលដៅ: {STORY_CHAPTERS[Math.min(8, Math.floor(totalStars / 12))]?.monsterName}</div>
              </div>
            </div>
            
            <div className="mt-8 flex gap-4 items-center">
               <input 
                 value={profile.name}
                 onChange={(e) => setProfileName(e.target.value)}
                 className="bg-secondary border border-border rounded-xl px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 w-64 font-body"
                 placeholder="ឈ្មោះអ្នកសរសេរ..."
                 data-testid="input-profile-name"
               />
               <div className="flex gap-2 ml-auto flex-wrap justify-end">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/50 border border-amber-300 shadow-sm" data-testid="group-difficulty">
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-700">{t.difficulty}</span>
                  <select
                    value={difficulty || "beginner"}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="bg-transparent text-sm font-bold text-amber-900 focus:outline-none"
                    data-testid="select-difficulty"
                  >
                    <option value="beginner">{t.beginner}</option>
                    <option value="intermediate">{t.intermediate}</option>
                    <option value="expert">{t.expert}</option>
                  </select>
                </div>
                <Link href="/stats">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 bg-white/50 border-violet-300 text-violet-700 hover:bg-white hover:text-violet-800 transition-all shadow-sm font-body"
                    data-testid="link-stats"
                  >
                    <BarChart3 size={16} />
                    <span className="font-bold">{t.stats}</span>
                  </Button>
                </Link>
                <Link href="/challenges">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 bg-white/50 border-amber-300 text-amber-700 hover:bg-white hover:text-amber-800 transition-all shadow-sm font-body"
                    data-testid="link-challenges"
                  >
                    <Trophy size={16} />
                    <span className="font-bold">{t.challenges}</span>
                  </Button>
                </Link>
                <Link href="/multiplayer">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 bg-white/50 border-purple-300 text-purple-700 hover:bg-white hover:text-purple-800 transition-all shadow-sm font-body"
                    data-testid="link-multiplayer"
                  >
                    <Users size={16} />
                    <span className="font-bold">{t.multiplayer}</span>
                  </Button>
                </Link>
                <Link href="/timed">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 bg-white/50 border-emerald-300 text-emerald-700 hover:bg-white hover:text-emerald-800 transition-all shadow-sm font-body"
                    data-testid="link-timedtest"
                  >
                    <Timer size={16} />
                    <span className="font-bold">{t.timedTest}</span>
                  </Button>
                </Link>
                <Link href="/free">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 bg-white/50 border-cyan-300 text-cyan-700 hover:bg-white hover:text-cyan-800 transition-all shadow-sm font-body"
                    data-testid="link-freetyping"
                  >
                    <Keyboard size={16} />
                    <span className="font-bold">{t.freeTyping}</span>
                  </Button>
                </Link>
                <Link href="/cultural">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 bg-white/50 border-amber-300 text-amber-700 hover:bg-white hover:text-amber-800 transition-all shadow-sm font-body"
                    data-testid="link-cultural"
                  >
                    <Landmark size={16} />
                    <span className="font-bold">{t.culturalChallenges}</span>
                  </Button>
                </Link>
                <Link href="/library">
                  <Button variant="outline" size="sm" className="gap-2 bg-white/50 border-blue-300 text-blue-700 hover:bg-white hover:text-blue-800 transition-all shadow-sm font-body" data-testid="link-library">
                    <GraduationCap size={16} />
                    <span className="font-bold">{t.library}</span>
                  </Button>
                </Link>
                <Link href="/teacher">
                  <Button variant="outline" size="sm" className="gap-2 bg-white/50 border-rose-300 text-rose-700 hover:bg-white hover:text-rose-800 transition-all shadow-sm font-body" data-testid="link-teacher">
                    <School size={16} />
                    <span className="font-bold">សម្រាប់គ្រូ</span>
                  </Button>
                </Link>
                <Link href="/badges">
                  <Button variant="outline" size="sm" className="gap-2 bg-white/50 border-slate-300 text-slate-700 hover:bg-white hover:text-primary transition-all shadow-sm font-body" data-testid="link-badges">
                    <span className="font-bold">{t.collection}</span>
                    <span className="bg-slate-200 px-2 py-0.5 rounded text-xs font-mono" data-testid="text-badges-count">
                      {badgesOwned.length}
                    </span>
                  </Button>
                </Link>
                <Button variant="outline" size="sm" className="gap-2 bg-white/50 border-red-300 text-red-500 hover:bg-white hover:text-red-600 transition-all shadow-sm font-body text-xs font-bold" data-testid="button-reset-progress" onClick={() => {
                  if(confirm("លុបការរីកចម្រើនរបស់អ្នក?")) resetProgress();
                }}>
                  ចាប់ផ្តើមឡើងវិញ
                </Button>
                {totalStars >= WORLDS.reduce((acc, w) => acc + w.stages.length * 3, 0) ? (
                  <Button variant="outline" size="sm" className="gap-2 bg-white/50 border-blue-300 text-blue-500 font-bold hover:bg-white hover:text-blue-600 transition-all shadow-sm font-body text-xs" data-testid="button-general-mode" onClick={() => {
                    if(confirm("ត្រឡប់ទៅរបៀបធម្មតាវិញ? (General Mode)")) {
                      resetProgress();
                    }
                  }}>
                    របៀបធម្មតា (General Mode)
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" className="gap-2 bg-white/50 border-amber-300 text-amber-500 font-bold hover:bg-white hover:text-amber-600 transition-all shadow-sm font-body text-xs" data-testid="button-easy-mode" onClick={() => {
                    if(confirm("បើកគ្រប់វគ្គទាំងអស់? (Easy Mode)")) {
                      const { recordStageResult, setProfile } = useGameStore.getState();
                      setProfile({ name: "ប្រព័ន្ធ" });
                      WORLDS.forEach(w => {
                        w.stages.forEach(s => {
                          recordStageResult(w.id, s.id, 3);
                        });
                      });
                    }
                  }}>
                    បើកគ្រប់វគ្គ (Easy Mode)
                  </Button>
                )}
               </div>
            </div>
          </div>

          {/* Ad Banner - Top */}
          <AdBanner format="horizontal" className="mb-8" />

          {/* Worlds Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {WORLDS.map((world) => {
              const isUnlocked = totalStars >= world.unlockStars;
              const worldTheme = WORLD_THEMES[world.id];
              const accentColor = worldTheme?.colors.primary || "var(--primary)";
              const bgColor = worldTheme?.colors.background || "var(--card)";
              
              return (
                <div 
                  key={world.id}
                  className={cn(
                    "group relative p-6 rounded-2xl border transition-all duration-300 shadow-sm overflow-hidden",
                    isUnlocked 
                      ? "border-border hover:-translate-y-1 hover:shadow-xl" 
                      : "bg-muted border-border opacity-70 grayscale"
                  )}
                  style={isUnlocked ? { 
                    backgroundColor: bgColor,
                    borderColor: `${accentColor}40`
                  } : {}}
                >
                  {/* Decorative background logo */}
                  {isUnlocked && (
                    <div className="absolute -right-4 -bottom-4 text-8xl opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-500">
                      {world.logo}
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-4">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-2xl border transition-colors"
                      style={isUnlocked ? { 
                        backgroundColor: `${accentColor}15`,
                        borderColor: `${accentColor}30`,
                        color: accentColor
                      } : {}}
                    >
                      {isUnlocked ? world.logo : "🔒"}
                    </div>
                    {!isUnlocked && (
                      <div className="px-3 py-1 rounded-full bg-secondary border border-border text-xs font-mono text-muted-foreground" data-testid={`text-world-lock-${world.id}`}>
                        ត្រូវការ {world.unlockStars} ⭐
                      </div>
                    )}
                  </div>
                  
                  <h3 
                    className="text-xl font-bold mb-1 transition-colors font-display" 
                    data-testid={`text-world-name-${world.id}`}
                    style={isUnlocked ? { color: accentColor } : {}}
                  >
                    {world.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6 font-body" data-testid={`text-world-meta-${world.id}`}>
                    {world.stages.length} វគ្គ • ផ្តោតលើព្យញ្ជនៈមូលដ្ឋាន
                  </p>

                  <Link href={isUnlocked ? `/world/${world.id}` : "#"}>
                    <Button 
                      className="w-full gap-2 font-body" 
                      variant={isUnlocked ? "secondary" : "ghost"}
                      disabled={!isUnlocked}
                      data-testid={`button-enter-world-${world.id}`}
                      style={isUnlocked ? { 
                        backgroundColor: `${accentColor}20`,
                        color: accentColor,
                        border: `1px solid ${accentColor}40`
                      } : {}}
                    >
                      {isUnlocked ? (
                        <>ចូលទៅកាន់ពិភព <Play size={14} /></>
                      ) : (
                        <>ជាប់សោ <Lock size={14} /></>
                      )}
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Ad Banner - Bottom */}
          <AdBanner format="horizontal" className="mt-8" />
        </div>
      </div>
      {/* Donation Popup - shows on first visit */}
      {showDonation && <DonationPopup onClose={handleCloseDonation} />}
    </div>
  );
};
