import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, Check, Palette, Languages, Volume2, Music, Play, Pause } from "lucide-react";
import { HUD } from "@/components/HUD";
import { Button } from "@/components/ui/button";
import { useGameStore } from "@/lib/store";
import { THEMES, getThemeById, applyTheme } from "@/lib/themes";
import { cn } from "@/lib/utils";
import { sounds, MUSIC_TRACKS } from "@/lib/sounds";

export const ThemeSelector: React.FC = () => {
  const { profile, immersionMode, setImmersionMode } = useGameStore();
  const [initialTheme] = useState(() => (profile as any).theme || "angkor-classic");
  const [initialMusic] = useState(() => localStorage.getItem('selectedMusicTrack') || 'main');
  
  const [selectedTheme, setSelectedTheme] = useState(initialTheme);
  const [soundEffects, setSoundEffects] = useState(true);
  const [selectedMusic, setSelectedMusic] = useState(initialMusic);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);

  const handleSelectTheme = (themeId: string) => {
    setSelectedTheme(themeId);
    const theme = getThemeById(themeId);
    applyTheme(theme);
  };

  const handleCancel = () => {
    // Revert theme
    const theme = getThemeById(initialTheme);
    applyTheme(theme);
    // Revert music
    sounds.changeTrack(initialMusic);
  };

  const savePreferences = async () => {
    try {
      // Update local store immediately
      const theme = getThemeById(selectedTheme);
      applyTheme(theme);
      useGameStore.getState().updateProfile({ theme: selectedTheme });

      // Persist selected music track
      localStorage.setItem('selectedMusicTrack', selectedMusic);
      localStorage.setItem('typingSoundEffects', String(soundEffects));
      sounds.setCurrentTrack(selectedMusic);

      alert("បានរក្សាទុកការកំណត់រួចរាល់!");
    } catch (error) {
      console.error("Error saving preferences:", error);
      alert("មិនអាចរក្សាទុកការកំណត់បានទេ");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 pt-20">
      <HUD />

      <div className="container mx-auto px-4 max-w-6xl mt-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/home" onClick={handleCancel}>
            <Button variant="ghost" size="icon" data-testid="button-back-home">
              <ArrowLeft />
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-black font-display text-foreground" data-testid="text-theme-title">
              ការកំណត់រូបរាង
            </h1>
            <p className="text-muted-foreground">កែសម្រួលបទពិសោធន៍វាយអក្សររបស់អ្នក</p>
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-8 border-border bg-card mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Palette className="text-primary" size={24} />
            <h2 className="text-2xl font-black text-foreground">ជ្រើសរើសរូបរាង</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => handleSelectTheme(theme.id)}
                className={cn(
                  "relative p-6 rounded-2xl border-2 transition-all duration-300 text-left group",
                  selectedTheme === theme.id
                    ? "border-primary bg-primary/10 shadow-lg scale-105"
                    : "border-border hover:border-primary/50 bg-card hover:shadow-md"
                )}
                data-testid={`button-theme-${theme.id}`}
              >
                {selectedTheme === theme.id && (
                  <div className="absolute -top-3 -right-3 w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg">
                    <Check className="text-primary-foreground" size={20} />
                  </div>
                )}

                <div className="text-5xl mb-4">{theme.icon}</div>
                <h3 className="text-xl font-black text-foreground mb-1">{theme.nameKh}</h3>
                <p className="text-xs text-muted-foreground mb-4">{theme.description}</p>

                <div className="flex gap-2">
                  {Object.entries(theme.colors).map(([key, color]) => (
                    <div
                      key={key}
                      className="w-8 h-8 rounded-lg border border-border shadow-sm"
                      style={{ backgroundColor: color }}
                      title={key}
                    />
                  ))}
                </div>
              </button>
            ))}
          </div>

          <div className="border-t border-border pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-foreground flex items-center gap-2">
                  <Volume2 size={20} className="text-primary" />
                  សំឡេងពេលវាយ
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  បើកសំឡេងក្ដារចុចពេលវាយអក្សរ
                </p>
              </div>
              <button
                onClick={() => setSoundEffects(!soundEffects)}
                className={cn(
                  "relative w-14 h-8 rounded-full transition-colors",
                  soundEffects ? "bg-primary" : "bg-muted"
                )}
                data-testid="toggle-sound-effects"
              >
                <div
                  className={cn(
                    "absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all",
                    soundEffects ? "left-7" : "left-1"
                  )}
                />
              </button>
            </div>
          </div>

          <div className="border-t border-border pt-6 mt-6">
            <div className="mb-4">
              <h3 className="text-lg font-black text-foreground flex items-center gap-2">
                <Music size={20} className="text-primary" />
                ចម្រៀងផ្ទៃខាងក្រោយ
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                ជ្រើសរើសចម្រៀងផ្ទៃខាងក្រោយដែលអ្នកចូលចិត្តពេលលេង
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MUSIC_TRACKS.map((track) => (
                <button
                  key={track.id}
                  onClick={() => {
                    setSelectedMusic(track.id);
                    sounds.changeTrack(track.id);
                  }}
                  className={cn(
                    "relative p-4 rounded-xl border-2 transition-all duration-300 text-left flex items-center gap-4 group",
                    selectedMusic === track.id
                      ? "border-primary bg-primary/10 shadow-md"
                      : "border-border hover:border-primary/50 bg-card hover:shadow-sm"
                  )}
                  data-testid={`button-music-${track.id}`}
                >
                  {selectedMusic === track.id && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-md">
                      <Check className="text-primary-foreground" size={14} />
                    </div>
                  )}
                  <div className="text-3xl">{track.icon}</div>
                  <div className="flex-1">
                    <p className="font-bold text-foreground">{track.name}</p>
                    <p className="text-sm text-muted-foreground">{track.nameKh}</p>
                  </div>
                  {selectedMusic === track.id && (
                    <div className="flex items-center gap-1 text-primary">
                      <div className="w-1 h-3 bg-primary rounded animate-pulse" />
                      <div className="w-1 h-4 bg-primary rounded animate-pulse" style={{ animationDelay: '0.1s' }} />
                      <div className="w-1 h-2 bg-primary rounded animate-pulse" style={{ animationDelay: '0.2s' }} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-6 mt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-foreground flex items-center gap-2">
                  <Languages size={20} className="text-primary" />
                  របៀបខ្មែរពេញ
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  លេងហ្គេមទាំងមូលជាភាសាខ្មែរ ជាមួយអត្ថបទ ការណែនាំ និងការប្រកួតទាំងអស់ជាភាសាខ្មែរ
                </p>
              </div>
              <button
                onClick={() => setImmersionMode(!immersionMode)}
                className={cn(
                  "relative w-14 h-8 rounded-full transition-colors",
                  immersionMode ? "bg-primary" : "bg-muted"
                )}
                data-testid="toggle-immersion-mode"
              >
                <div
                  className={cn(
                    "absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all",
                    immersionMode ? "left-7" : "left-1"
                  )}
                />
              </button>
            </div>
            {immersionMode && (
              <div className="mt-4 p-4 rounded-xl bg-primary/10 border border-primary/20">
                <p className="text-sm font-bold text-primary">
                  ✓ របៀបខ្មែរពេញបានបើក - អត្ថបទទាំងអស់នឹងបង្ហាញជាភាសាខ្មែរ
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  អត្ថបទទាំងអស់នឹងបង្ហាញជាភាសាខ្មែរ។
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-4">
          <Button
            onClick={savePreferences}
            className="flex-1 h-14 text-lg font-black bg-primary hover:bg-primary/90"
            data-testid="button-save-theme"
          >
            រក្សាទុកការកំណត់
          </Button>
          <Link href="/home" className="flex-1" onClick={handleCancel}>
            <Button variant="outline" className="w-full h-14 text-lg font-black">
              បោះបង់
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
