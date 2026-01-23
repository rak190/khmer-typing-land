import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Keyboard, Play, Trophy, Shield, Rocket } from 'lucide-react';
import { sounds } from '@/lib/sounds';

export const Landing: React.FC = () => {
  const handleStart = () => {
    sounds.playClick();
    // Music will start via HUD or user interaction on the next page
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-3xl animate-pulse delay-700" />
      
      <div className="container mx-auto px-4 text-center z-10">
        <div className="mb-8 flex justify-center">
          <div className="p-4 bg-primary/10 rounded-3xl border border-primary/20 shadow-xl animate-bounce">
            <Keyboard size={64} className="text-primary" />
          </div>
        </div>

        <h1 className="text-6xl md:text-8xl font-black text-foreground mb-4 tracking-tighter font-display">
          KHMER <span className="text-primary">TYPING</span> LAND
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
          Master the NiDA keyboard layout through an epic journey across mystical worlds. 
          The ultimate quest to become a Master Scribe begins here.
        </p>

        <div className="flex flex-col md:flex-row gap-6 justify-center items-center mb-16">
          <Link href="/home">
            <Button 
              onClick={handleStart}
              className="h-16 px-12 text-2xl font-black gap-3 rounded-2xl shadow-2xl hover:scale-105 transition-all bg-primary hover:bg-primary/90"
            >
              START JOURNEY <Play size={24} fill="currentColor" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="glass-panel p-6 rounded-2xl border border-primary/10">
            <div className="flex justify-center mb-4 text-primary"><Rocket size={32} /></div>
            <h3 className="font-bold text-lg mb-2">3 Game Modes</h3>
            <p className="text-sm text-muted-foreground">Platform, Runner, and Defender modes to keep you engaged.</p>
          </div>
          <div className="glass-panel p-6 rounded-2xl border border-primary/10">
            <div className="flex justify-center mb-4 text-primary"><Trophy size={32} /></div>
            <h3 className="font-bold text-lg mb-2">Badge Collection</h3>
            <p className="text-sm text-muted-foreground">Earn unique badges as you master complex Khmer characters.</p>
          </div>
          <div className="glass-panel p-6 rounded-2xl border border-primary/10">
            <div className="flex justify-center mb-4 text-primary"><Shield size={32} /></div>
            <h3 className="font-bold text-lg mb-2">Save Progress</h3>
            <p className="text-sm text-muted-foreground">Track your stars and unlocks across multiple mystical worlds.</p>
          </div>
        </div>

        <div className="mt-16 text-sm text-muted-foreground font-mono uppercase tracking-widest opacity-50">
          Built for the next generation of Khmer Scribes
        </div>
      </div>
    </div>
  );
};
