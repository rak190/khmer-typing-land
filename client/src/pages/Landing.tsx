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
    <div className="min-h-screen bg-[#FDFCF0] flex flex-col items-center justify-center relative overflow-hidden font-body text-[#3E2723]">
      {/* Playful Floating Elements */}
      <div className="absolute top-10 left-10 text-4xl animate-bounce-slow opacity-20">⌨️</div>
      <div className="absolute top-20 right-20 text-4xl animate-bounce-slow opacity-20 delay-700">⭐</div>
      <div className="absolute bottom-10 left-20 text-4xl animate-bounce-slow opacity-20 delay-1000">🎮</div>
      <div className="absolute bottom-20 right-10 text-4xl animate-bounce-slow opacity-20 delay-300">🏆</div>

      {/* Texture: Krama / Sandstone */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cloud-fun.png')]" />
      
      {/* Angkor Watermark */}
      <div className="absolute inset-0 opacity-[0.08] pointer-events-none flex items-center justify-center">
        <div className="w-[85%] h-[85%] bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Angkor_Wat_silhouette.svg/1024px-Angkor_Wat_silhouette.svg.png')] bg-no-repeat bg-center bg-contain" />
      </div>

      {/* Kbach Corner Ornaments */}
      <div className="absolute top-8 left-8 w-32 h-32 border-t-8 border-l-8 border-[#D4AF37]/30 rounded-tl-[3rem] opacity-40" />
      <div className="absolute top-8 right-8 w-32 h-32 border-t-8 border-r-8 border-[#D4AF37]/30 rounded-tr-[3rem] opacity-40" />
      <div className="absolute bottom-8 left-8 w-32 h-32 border-b-8 border-l-8 border-[#D4AF37]/30 rounded-bl-[3rem] opacity-40" />
      <div className="absolute bottom-8 right-8 w-32 h-32 border-b-8 border-r-8 border-[#D4AF37]/30 rounded-br-[3rem] opacity-40" />

      <div className="container mx-auto px-4 text-center z-10 max-w-5xl">
        {!showPlayerSelect ? (
          <>
            <div className="mb-8 flex justify-center">
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-[#D4AF37] via-[#FFD700] to-[#D4AF37] rounded-[2.5rem] blur-xl opacity-40 group-hover:opacity-60 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                <div className="relative p-6 bg-gradient-to-br from-[#1A237E] to-[#0D47A1] rounded-[2.5rem] border-4 border-[#D4AF37] shadow-[0_0_40px_rgba(212,175,55,0.4)] transform hover:scale-105 transition-transform duration-500">
                  <Keyboard size={80} className="text-[#D4AF37] drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)]" />
                </div>
              </div>
            </div>

            <div className="relative inline-block mb-8">
              <h1 className="text-7xl md:text-9xl font-black tracking-tighter font-display text-[#1A237E] drop-shadow-[0_8px_0_rgba(212,175,55,0.3)]">
                KHMER <span className="text-[#D4AF37] drop-shadow-[0_8px_0_rgba(26,35,126,0.3)]">TYPING</span> LAND
              </h1>
              <div className="absolute -top-6 -right-12 bg-[#FFD700] text-[#1A237E] text-xs font-black px-4 py-1.5 rounded-full rotate-12 shadow-lg border-2 border-[#1A237E] animate-pulse">
                FUN & EDUCATIONAL!
              </div>
            </div>
            
            <p className="text-2xl md:text-3xl mb-16 max-w-3xl mx-auto font-bold leading-relaxed text-[#5D4037] drop-shadow-sm px-4">
              <span className="bg-[#D4AF37]/10 px-2 rounded-lg">រៀនវាយអត្ថបទខ្មែរ</span> តាមរយៈការលេងហ្គេមដ៏ជក់ចិត្ត ក្នុងពិភពអច្ឆរិយ។
              ចាប់ផ្តើមដំណើររបស់អ្នកដើម្បីក្លាយជា <span className="text-[#1A237E] underline decoration-[#D4AF37] decoration-4 underline-offset-8">កំពូលអ្នកសរសេរអក្សរខ្មែរ</span> នៅថ្ងៃនេះ!
            </p>

            <div className="flex flex-col md:flex-row gap-8 justify-center items-center mb-24">
              <Button 
                onClick={handleStart}
                className="h-24 px-20 text-4xl font-black gap-6 rounded-[2rem] shadow-[0_15px_50px_rgba(26,35,126,0.3)] hover:scale-110 active:scale-95 transition-all bg-[#1A237E] hover:bg-[#0D47A1] text-white border-b-[10px] border-[#000051] relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                {currentPlayerId ? 'បន្តដំណើរ' : 'ចាប់ផ្តើម'} <Play size={36} fill="currentColor" className="drop-shadow-sm" />
              </Button>
              
              {Object.keys(players).length > 0 && (
                <Button 
                  variant="outline"
                  onClick={() => setShowPlayerSelect(true)}
                  className="h-24 px-10 text-2xl font-black gap-4 rounded-[2rem] border-4 border-[#1A237E] text-[#1A237E] hover:bg-[#1A237E] hover:text-white transition-all shadow-[0_10px_0_#1A237E] hover:translate-y-1 hover:shadow-none active:translate-y-2"
                >
                  <Users size={32} /> ប្តូរអ្នកលេង
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mx-auto max-w-6xl pb-10">
              <div className="bg-white p-10 rounded-[3rem] border-4 border-[#D4AF37]/20 shadow-[0_20px_0_rgba(212,175,55,0.1)] hover:shadow-[0_30px_0_rgba(212,175,55,0.15)] hover:-translate-y-4 transition-all group relative">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#1A237E] text-white p-4 rounded-2xl shadow-lg group-hover:scale-125 transition-transform duration-500"><Rocket size={32} /></div>
                <h3 className="font-display text-[#1A237E] text-3xl mb-4 mt-4">របៀបលេង ៣ បែប</h3>
                <p className="text-lg font-bold text-[#5D4037]/80 leading-snug">កម្មវិធីប្លែកៗគ្នាដែលជួយឱ្យការរៀនវាយអត្ថបទកាន់តែមានប្រសិទ្ធភាព និងមិនចេះជឿនណាយ។</p>
              </div>
              <div className="bg-white p-10 rounded-[3rem] border-4 border-[#1A237E]/10 shadow-[0_20px_0_rgba(26,35,126,0.05)] hover:shadow-[0_30px_0_rgba(26,35,126,0.1)] hover:-translate-y-4 transition-all group relative">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#D4AF37] text-white p-4 rounded-2xl shadow-lg group-hover:scale-125 transition-transform duration-500"><Trophy size={32} /></div>
                <h3 className="font-display text-[#1A237E] text-3xl mb-4 mt-4">ការប្រមូលមេដាយ</h3>
                <p className="text-lg font-bold text-[#5D4037]/80 leading-snug">ទទួលបានមេដាយកិត្តិយស និងកម្រិតខ្ពស់នៅពេលអ្នកវាយអក្សរខ្មែរបានកាន់តែជំនាញ។</p>
              </div>
              <div className="bg-white p-10 rounded-[3rem] border-4 border-[#D4AF37]/20 shadow-[0_20px_0_rgba(212,175,55,0.1)] hover:shadow-[0_30px_0_rgba(212,175,55,0.15)] hover:-translate-y-4 transition-all group relative">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#1A237E] text-white p-4 rounded-2xl shadow-lg group-hover:scale-125 transition-transform duration-500"><Shield size={32} /></div>
                <h3 className="font-display text-[#1A237E] text-3xl mb-4 mt-4">រក្សាទុកការរីកចម្រើន</h3>
                <p className="text-lg font-bold text-[#5D4037]/80 leading-snug">តាមដានការរីកចម្រើនរបស់អ្នក និងកម្រិតដែលអ្នកបានសម្រេចនៅគ្រប់ពិភពអច្ឆរិយ។</p>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white p-12 rounded-[4rem] border-4 border-[#D4AF37] max-w-2xl mx-auto shadow-[0_30px_60px_rgba(0,0,0,0.12)] animate-in fade-in zoom-in duration-500 relative">
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#FFD700] rounded-full flex items-center justify-center text-4xl shadow-xl border-4 border-white animate-bounce-slow">✨</div>
            <h2 className="font-display text-5xl text-[#1A237E] mb-10 tracking-tight">ជ្រើសរើសអ្នកលេង</h2>
            
            <div className="space-y-6 mb-12 max-h-[45vh] overflow-y-auto px-6 custom-scrollbar py-2">
              {Object.keys(players).map(id => (
                <div key={id} className="flex gap-4 group">
                  <Button
                    onClick={() => {
                      switchPlayer(id);
                      setLocation("/home");
                    }}
                    variant={currentPlayerId === id ? "default" : "secondary"}
                    className={cn(
                      "flex-1 h-20 rounded-[1.5rem] text-2xl font-black justify-between px-8 transition-all border-b-[6px]",
                      currentPlayerId === id 
                        ? "bg-[#1A237E] border-[#000051] text-white shadow-xl scale-[1.02]" 
                        : "bg-[#F5F1E9] border-[#D7CCC8] hover:bg-[#EFEBE9] text-[#1A237E]"
                    )}
                  >
                    <span className="flex items-center gap-4">
                      <span className="bg-white/20 p-2 rounded-xl text-3xl">👤</span> {players[id].name}
                    </span>
                    <span className="bg-white/10 px-4 py-1 rounded-full text-sm font-black">⭐ {Object.values(players[id].progress.starsByStage).reduce((a,b)=>a+b, 0)}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      if(confirm(`តើអ្នកប្រាកដជាចង់លុបអ្នកលេង "${players[id].name}"?`)) deletePlayer(id);
                    }}
                    className="h-20 w-20 rounded-[1.5rem] text-red-400 hover:text-red-600 hover:bg-red-50 border-2 border-transparent hover:border-red-100"
                  >
                    <Trash2 size={32} />
                  </Button>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddPlayer} className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  placeholder="ឈ្មោះអ្នកលេងថ្មី..."
                  className="w-full h-20 bg-[#F5F1E9] border-4 border-[#D4AF37]/20 rounded-[1.5rem] px-8 text-2xl font-bold focus:outline-none focus:border-[#1A237E] transition-colors placeholder:text-[#5D4037]/40"
                />
                <UserPlus className="absolute right-6 top-1/2 -translate-y-1/2 text-[#D4AF37]/40" size={32} />
              </div>
              <Button 
                type="submit"
                disabled={!newPlayerName.trim()}
                className="h-20 px-10 rounded-[1.5rem] bg-[#D4AF37] hover:bg-[#B8962E] text-white font-black text-2xl border-b-[6px] border-[#8C6D1F] active:border-b-0 active:translate-y-1 transition-all shadow-lg"
              >
                បន្ថែម
              </Button>
            </form>
            
            <Button 
              variant="ghost" 
              onClick={() => setShowPlayerSelect(false)}
              className="mt-10 text-[#5D4037] font-black text-lg hover:bg-transparent hover:text-[#1A237E] transition-colors underline underline-offset-4"
            >
              ត្រឡប់ក្រោយវិញ
            </Button>
          </div>
        )}

        <div className="mt-24 text-sm text-[#1A237E]/40 font-black uppercase tracking-[0.4em]">
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
        @keyframes tilt {
          0%, 50%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(0.5deg); }
          75% { transform: rotate(-0.5deg); }
        }
        .animate-tilt {
          animation: tilt 10s infinite linear;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #F5F1E9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #D4AF37;
          border-radius: 10px;
          border: 2px solid #F5F1E9;
        }
      `}} />
    </div>
  );
};
