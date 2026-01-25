import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Keyboard, Play, Trophy, Shield, Rocket, UserPlus, Users, Trash2 } from 'lucide-react';
import { sounds } from '@/lib/sounds';
import { useGameStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import "@fontsource/moul";
import "@fontsource/kantumruy-pro/400.css";
import "@fontsource/kantumruy-pro/700.css";

export const Landing: React.FC = () => {
  const [, setLocation] = useLocation();
  const { players, currentPlayerId, addPlayer, switchPlayer, deletePlayer } = useGameStore();
  const [newPlayerName, setNewPlayerName] = useState("");
  const [showPlayerSelect, setShowPlayerSelect] = useState(false);

  useEffect(() => {
    sounds.startBackgroundMusic();
  }, []);

  const handleStart = () => {
    sounds.playClick();
    if (!currentPlayerId && Object.keys(players).length > 0) {
      setShowPlayerSelect(true);
    } else if (!currentPlayerId) {
      setShowPlayerSelect(true);
    } else {
      setLocation("/home");
    }
  };

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlayerName.trim()) {
      addPlayer(newPlayerName.trim());
      switchPlayer(newPlayerName.trim());
      setNewPlayerName("");
      setLocation("/home");
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F1E9] flex flex-col items-center justify-center relative overflow-hidden font-body text-[#3E2723]">
      {/* Texture: Krama / Sandstone */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')]" />
      
      {/* Angkor Watermark */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none flex items-center justify-center">
        <div className="w-[80%] h-[80%] bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Angkor_Wat_silhouette.svg/1024px-Angkor_Wat_silhouette.svg.png')] bg-no-repeat bg-center bg-contain" />
      </div>

      {/* Kbach Corner Ornaments */}
      <div className="absolute top-8 left-8 w-24 h-24 border-t-4 border-l-4 border-[#D4AF37]/40 rounded-tl-3xl opacity-50" />
      <div className="absolute top-8 right-8 w-24 h-24 border-t-4 border-r-4 border-[#D4AF37]/40 rounded-tr-3xl opacity-50" />
      <div className="absolute bottom-8 left-8 w-24 h-24 border-b-4 border-l-4 border-[#D4AF37]/40 rounded-bl-3xl opacity-50" />
      <div className="absolute bottom-8 right-8 w-24 h-24 border-b-4 border-r-4 border-[#D4AF37]/40 rounded-br-3xl opacity-50" />

      <div className="container mx-auto px-4 text-center z-10 max-w-4xl">
        {!showPlayerSelect ? (
          <>
            <div className="mb-10 flex justify-center">
              <div className="p-5 bg-gradient-to-br from-[#1A237E] to-[#0D47A1] rounded-[2rem] border-2 border-[#D4AF37] shadow-[0_0_30px_rgba(212,175,55,0.3)] animate-bounce-slow">
                <Keyboard size={64} className="text-[#D4AF37]" />
              </div>
            </div>

            <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-normal font-display text-[#1A237E] drop-shadow-sm">
              KHMER <span className="text-[#D4AF37]">TYPING</span> LAND
            </h1>
            
            <p className="text-xl md:text-2xl mb-14 max-w-2xl mx-auto font-medium leading-relaxed text-[#5D4037]">
              រៀនវាយអត្ថបទខ្មែរតាមរយៈការលេងហ្គេមដ៏ជក់ចិត្ត ក្នុងពិភពអច្ឆរិយ។
              ចាប់ផ្តើមដំណើររបស់អ្នកដើម្បីក្លាយជាកំពូលអ្នកសរសេរអក្សរខ្មែរនៅថ្ងៃនេះ!
            </p>

            <div className="flex flex-col md:flex-row gap-6 justify-center items-center mb-20">
              <Button 
                onClick={handleStart}
                className="h-20 px-16 text-3xl font-black gap-4 rounded-2xl shadow-[0_10px_40px_rgba(26,35,126,0.25)] hover:scale-105 transition-all bg-[#1A237E] hover:bg-[#0D47A1] text-white border-b-4 border-[#000051]"
              >
                {currentPlayerId ? 'បន្តដំណើរ' : 'ចាប់ផ្តើម'} <Play size={28} fill="currentColor" />
              </Button>
              
              {Object.keys(players).length > 0 && (
                <Button 
                  variant="outline"
                  onClick={() => setShowPlayerSelect(true)}
                  className="h-20 px-8 text-xl font-bold gap-3 rounded-2xl border-2 border-[#1A237E] text-[#1A237E] hover:bg-[#1A237E]/5 transition-all"
                >
                  <Users size={24} /> ប្តូរអ្នកលេង
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mx-auto">
              <div className="bg-white/60 backdrop-blur-sm p-8 rounded-3xl border border-[#D4AF37]/30 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all group">
                <div className="flex justify-center mb-6 text-[#1A237E] group-hover:scale-110 transition-transform"><Rocket size={40} /></div>
                <h3 className="font-display text-[#1A237E] text-2xl mb-3">របៀបលេង ៣ បែប</h3>
                <p className="text-base text-[#5D4037]">កម្មវិធីប្លែកៗគ្នាដែលជួយឱ្យការរៀនវាយអត្ថបទកាន់តែមានប្រសិទ្ធភាព និងមិនចេះជឿនណាយ។</p>
              </div>
              <div className="bg-white/60 backdrop-blur-sm p-8 rounded-3xl border border-[#D4AF37]/30 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all group">
                <div className="flex justify-center mb-6 text-[#1A237E] group-hover:scale-110 transition-transform"><Trophy size={40} /></div>
                <h3 className="font-display text-[#1A237E] text-2xl mb-3">ការប្រមូលមេដាយ</h3>
                <p className="text-base text-[#5D4037]">ទទួលបានមេដាយកិត្តិយស និងកម្រិតខ្ពស់នៅពេលអ្នកវាយអក្សរខ្មែរបានកាន់តែជំនាញ។</p>
              </div>
              <div className="bg-white/60 backdrop-blur-sm p-8 rounded-3xl border border-[#D4AF37]/30 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all group">
                <div className="flex justify-center mb-6 text-[#1A237E] group-hover:scale-110 transition-transform"><Shield size={40} /></div>
                <h3 className="font-display text-[#1A237E] text-2xl mb-3">រក្សាទុកការរីកចម្រើន</h3>
                <p className="text-base text-[#5D4037]">តាមដានការរីកចម្រើនរបស់អ្នក និងកម្រិតដែលអ្នកបានសម្រេចនៅគ្រប់ពិភពអច្ឆរិយ។</p>
              </div>
            </div>
          </>
        ) : (
          <div className="glass-panel p-10 rounded-[3rem] border-2 border-[#D4AF37]/30 max-w-2xl mx-auto shadow-2xl animate-in fade-in zoom-in duration-300">
            <h2 className="font-display text-4xl text-[#1A237E] mb-8">ជ្រើសរើសអ្នកលេង</h2>
            
            <div className="space-y-4 mb-10 max-h-[40vh] overflow-y-auto px-4 custom-scrollbar">
              {Object.keys(players).map(id => (
                <div key={id} className="flex gap-3 group">
                  <Button
                    onClick={() => {
                      switchPlayer(id);
                      setLocation("/home");
                    }}
                    variant={currentPlayerId === id ? "default" : "secondary"}
                    className={cn(
                      "flex-1 h-16 rounded-2xl text-xl font-bold justify-between px-6 transition-all",
                      currentPlayerId === id ? "bg-[#1A237E] shadow-lg scale-[1.02]" : "bg-white hover:bg-[#1A237E]/5 border border-[#D4AF37]/20"
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-2xl">👤</span> {players[id].name}
                    </span>
                    <span className="text-sm font-mono opacity-60">⭐ {Object.values(players[id].progress.starsByStage).reduce((a,b)=>a+b, 0)}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      if(confirm(`តើអ្នកប្រាកដជាចង់លុបអ្នកលេង "${players[id].name}"?`)) deletePlayer(id);
                    }}
                    className="h-16 w-16 rounded-2xl text-red-400 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={24} />
                  </Button>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddPlayer} className="flex gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  placeholder="ឈ្មោះអ្នកលេងថ្មី..."
                  className="w-full h-16 bg-white border-2 border-[#D4AF37]/20 rounded-2xl px-6 text-xl focus:outline-none focus:border-[#1A237E] transition-colors"
                />
                <UserPlus className="absolute right-5 top-1/2 -translate-y-1/2 text-[#D4AF37]/40" size={24} />
              </div>
              <Button 
                type="submit"
                disabled={!newPlayerName.trim()}
                className="h-16 px-8 rounded-2xl bg-[#D4AF37] hover:bg-[#B8962E] text-white font-black text-xl"
              >
                បន្ថែម
              </Button>
            </form>
            
            <Button 
              variant="ghost" 
              onClick={() => setShowPlayerSelect(false)}
              className="mt-8 text-[#5D4037] font-bold"
            >
              ត្រឡប់ក្រោយ
            </Button>
          </div>
        )}

        <div className="mt-20 text-sm text-[#1A237E]/60 font-medium uppercase tracking-[0.2em]">
          បង្កើតឡើងសម្រាប់អ្នកបន្តវេនអក្សរសាស្ត្រខ្មែរជំនាន់ក្រោយ
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .font-display { font-family: 'Moul', cursive; }
        .font-body { font-family: 'Kantumruy Pro', sans-serif; }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(-10%); }
          50% { transform: translateY(0); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s infinite ease-in-out;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(212, 175, 55, 0.2);
          border-radius: 10px;
        }
      `}} />
    </div>
  );
};
