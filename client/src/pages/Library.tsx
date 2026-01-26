import React from 'react';
import { useGameStore } from '@/lib/store';
import { buildWorlds } from '@/lib/curriculum';
import { Button } from '@/components/ui/button';
import { HUD } from '@/components/HUD';
import { Award, Download, ArrowLeft, GraduationCap } from 'lucide-react';
import { Link } from 'wouter';

const WORLDS = buildWorlds();

export const Library: React.FC = () => {
  const { getTotalStars, players, currentPlayerId, profile } = useGameStore();
  const totalStars = getTotalStars();

  // Helper to check if a world is fully completed (3 stars in every stage)
  const isWorldCompleted = (worldId: string) => {
    const world = WORLDS.find(w => w.id === worldId);
    if (!world) return false;
    
    // In multi-player mode, we check current player's progress
    const currentPlayer = currentPlayerId ? players[currentPlayerId] : null;
    const progress = currentPlayer ? currentPlayer.progress : useGameStore.getState().progress;
    
    return world.stages.every(s => (progress.starsByStage[`${worldId}${s.id}`] || 0) === 3);
  };

  const handleDownload = (world: any) => {
    // In a real app, this would generate a PDF or redirect to the certificate page
    // For the mockup, we'll open the certificate page in a new tab with placeholder params
    const url = `/certificates/certificate.html?name=${encodeURIComponent(profile.name)}&world=${encodeURIComponent(world.name)}&worldNum=${world.id.replace('w','')}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-background pb-20 pt-20">
      <HUD />
      
      <div className="container mx-auto px-4 mt-8 max-w-5xl">
        <div className="flex items-center gap-4 mb-10">
          <Link href="/home">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft />
            </Button>
          </Link>
          <h1 className="text-4xl font-black text-foreground font-display flex items-center gap-3">
            <GraduationCap className="text-primary" size={40} />
            បណ្ណាល័យវិញ្ញាបនបត្រ <span className="text-muted-foreground text-2xl font-body">/ Certificate Library</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {WORLDS.map((world) => {
            const completed = isWorldCompleted(world.id);
            
            return (
              <div 
                key={world.id}
                className={`p-8 rounded-[2.5rem] border-4 transition-all ${
                  completed 
                    ? "bg-card border-primary/20 shadow-xl" 
                    : "bg-muted border-dashed border-muted-foreground/20 opacity-60"
                }`}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-4 rounded-2xl ${completed ? "bg-primary/10 text-primary" : "bg-muted-foreground/10 text-muted-foreground"}`}>
                    <Award size={48} />
                  </div>
                  {completed ? (
                    <span className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-black">សម្រេចបាន / COMPLETED</span>
                  ) : (
                    <span className="bg-slate-100 text-slate-500 px-4 py-1.5 rounded-full text-sm font-black">មិនទាន់រួចរាល់ / INCOMPLETE</span>
                  )}
                </div>

                <h3 className="text-2xl font-black mb-2 font-display">{world.name}</h3>
                <p className="text-muted-foreground mb-8 font-body">
                  {completed 
                    ? "អបអរសាទរ! អ្នកបានបញ្ចប់ពិភពនេះដោយជោគជ័យ។" 
                    : "បញ្ចប់គ្រប់វគ្គដោយទទួលបានផ្កាយ ៣ ដើម្បីទទួលបានវិញ្ញាបនបត្រ។"}
                </p>

                <Button
                  onClick={() => handleDownload(world)}
                  disabled={!completed}
                  className={`w-full h-16 rounded-2xl text-xl font-black gap-3 transition-all ${
                    completed 
                      ? "bg-primary hover:bg-primary/90 text-white shadow-lg border-b-4 border-primary-foreground/20" 
                      : "bg-slate-200 text-slate-400"
                  }`}
                >
                  <Download size={24} /> ទាញយកវិញ្ញាបនបត្រ
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
