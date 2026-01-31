import React, { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Check, Palette } from "lucide-react";
import { HUD } from "@/components/HUD";
import { Button } from "@/components/ui/button";
import { useGameStore } from "@/lib/store";
import { THEMES, getThemeById, applyTheme } from "@/lib/themes";
import { cn } from "@/lib/utils";

export const ThemeSelector: React.FC = () => {
  const { profile } = useGameStore();
  const [selectedTheme, setSelectedTheme] = useState("angkor-classic");
  const [fontStyle, setFontStyle] = useState("battambang");

  const handleSelectTheme = (themeId: string) => {
    setSelectedTheme(themeId);
    const theme = getThemeById(themeId);
    applyTheme(theme);
  };

  const savePreferences = async () => {
    try {
      await fetch("/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId: profile.name, // Using name as temp ID
          theme: selectedTheme,
          fontStyle,
        }),
      });
      alert("Theme saved successfully!");
    } catch (error) {
      console.error("Error saving preferences:", error);
      alert("Failed to save theme");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 pt-20">
      <HUD />

      <div className="container mx-auto px-4 max-w-6xl mt-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/home">
            <Button variant="ghost" size="icon" data-testid="button-back-home">
              <ArrowLeft />
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-black font-display text-foreground" data-testid="text-theme-title">
              ការកំណត់រូបរាង / Theme Settings
            </h1>
            <p className="text-muted-foreground">Customize your typing experience</p>
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-8 border-border bg-card mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Palette className="text-primary" size={24} />
            <h2 className="text-2xl font-black text-foreground">Choose Your Theme</h2>
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
                <h3 className="text-xl font-black text-foreground mb-1">{theme.name}</h3>
                <p className="text-sm font-bold text-muted-foreground mb-3">{theme.nameKh}</p>
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
            <h3 className="text-lg font-black text-foreground mb-4">Font Style</h3>
            <div className="flex gap-4">
              <Button
                variant={fontStyle === "battambang" ? "default" : "outline"}
                onClick={() => setFontStyle("battambang")}
                className="font-khmer"
                data-testid="button-font-battambang"
              >
                Battambang (Default)
              </Button>
              <Button
                variant={fontStyle === "kantumruy" ? "default" : "outline"}
                onClick={() => setFontStyle("kantumruy")}
                className="font-body"
                data-testid="button-font-kantumruy"
              >
                Kantumruy Pro
              </Button>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Button
            onClick={savePreferences}
            className="flex-1 h-14 text-lg font-black bg-primary hover:bg-primary/90"
            data-testid="button-save-theme"
          >
            រក្សាទុក / Save Changes
          </Button>
          <Link href="/home" className="flex-1">
            <Button variant="outline" className="w-full h-14 text-lg font-black">
              ត្រឡប់ក្រោយ / Cancel
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
