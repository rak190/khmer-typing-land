import React from 'react';
import { useGameStore } from '@/lib/store';
import { HUD } from '@/components/HUD';
import { Button } from '@/components/ui/button';
import { Trophy, Timer, Target, Users, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';

export const Challenges: React.FC = () => {
  const { profile } = useGameStore();

  const mockLeaderboard = [
    { name: "សុខា", wpm: 72, accuracy: 99, rank: 1 },
    { name: "ដារ៉ា", wpm: 68, accuracy: 98, rank: 2 },
    { name: "បុប្ផា", wpm: 65, accuracy: 100, rank: 3 },
    { name: profile.name, wpm: 45, accuracy: 92, rank: 12, isPlayer: true },
    { name: "ចាន់", wpm: 42, accuracy: 88, rank: 13 },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 pt-20">
      <HUD />
      
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" data-testid="button-back" onClick={() => window.history.back()}>
            <ArrowLeft />
          </Button>
          <h1 className="text-4xl font-black font-display text-foreground">ការប្រកួតប្រជែង</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Daily Challenge Card */}
          <div className="glass-panel p-8 rounded-3xl border-primary/20 bg-primary/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Timer size={120} />
            </div>
            <div className="relative z-10">
              <div className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-1 rounded w-fit mb-4 uppercase tracking-widest">
                ភារកិច្ចប្រចាំថ្ងៃ
              </div>
              <h2 className="text-2xl font-bold mb-2">ព្យញ្ជនៈមូលដ្ឋាន</h2>
              <p className="text-muted-foreground mb-6">វាយសំណុំព្យញ្ជនៈមូលដ្ឋានឱ្យបានលឿនបំផុត។</p>
              
              <div className="flex items-center gap-6 mb-8">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground uppercase">ពេលល្អបំផុត</span>
                  <span className="text-xl font-bold">0:42</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground uppercase">រង្វាន់</span>
                  <span className="text-xl font-bold text-amber-500">500 XP</span>
                </div>
              </div>

              <Button className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-xl" data-testid="button-play-daily">
                លេងឥឡូវនេះ
              </Button>
            </div>
          </div>

          {/* Weekly Challenge Card */}
          <div className="glass-panel p-8 rounded-3xl border-violet-200 bg-violet-50/50 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Trophy size={120} className="text-violet-600" />
            </div>
            <div className="relative z-10">
              <div className="bg-violet-600 text-white text-[10px] font-bold px-2 py-1 rounded w-fit mb-4 uppercase tracking-widest">
                ម៉ារ៉ាតុងប្រចាំសប្តាហ៍
              </div>
              <h2 className="text-2xl font-bold mb-2">អ្នកជំនាញពាក្យ ២០២៦</h2>
              <p className="text-muted-foreground mb-6">វាយប្រយោគពេញលេញដោយមានភាពត្រឹមត្រូវ ៩៥%។</p>
              
              <div className="flex items-center gap-6 mb-8">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground uppercase">បញ្ចប់នៅ</span>
                  <span className="text-xl font-bold">៤ ថ្ងៃ</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground uppercase">រង្វាន់</span>
                  <span className="text-xl font-bold text-violet-600">មេដាយជើងឯក</span>
                </div>
              </div>

              <Button variant="outline" className="w-full border-violet-200 text-violet-700 font-bold h-12 rounded-xl" disabled data-testid="button-play-weekly">
                នឹងមកដល់ឆាប់ៗ
              </Button>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="glass-panel rounded-3xl overflow-hidden border-border bg-card">
          <div className="p-6 border-b border-border bg-muted/30 flex justify-between items-center">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Users size={20} className="text-primary" />
              តារាងចំណាត់ថ្នាក់ (ថ្ងៃនេះ)
            </h3>
            <div className="text-xs font-mono text-muted-foreground uppercase tracking-tighter">បានធ្វើបច្ចុប្បន្នភាព ៥ នាទីមុន</div>
          </div>
          
          <div className="divide-y divide-border">
            {mockLeaderboard.map((user, idx) => (
              <div 
                key={idx} 
                className={`p-4 flex items-center gap-4 transition-colors ${user.isPlayer ? 'bg-primary/5' : 'hover:bg-muted/50'}`}
                data-testid={`row-leaderboard-${idx}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  user.rank === 1 ? 'bg-amber-100 text-amber-700' : 
                  user.rank === 2 ? 'bg-slate-100 text-slate-700' : 
                  user.rank === 3 ? 'bg-orange-100 text-orange-700' : 'text-muted-foreground'
                }`}>
                  {user.rank}
                </div>
                <div className="flex-1">
                  <div className="font-bold flex items-center gap-2">
                    {user.name}
                    {user.isPlayer && <span className="text-[10px] bg-primary text-white px-1.5 rounded uppercase">អ្នក</span>}
                  </div>
                </div>
                <div className="flex gap-8 text-right">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-muted-foreground uppercase flex items-center gap-1">
                      <Timer size={10} /> WPM
                    </span>
                    <span className="font-mono font-bold">{user.wpm}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-muted-foreground uppercase flex items-center gap-1">
                      <Target size={10} /> ភាពត្រឹមត្រូវ
                    </span>
                    <span className="font-mono font-bold text-green-600">{user.accuracy}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
