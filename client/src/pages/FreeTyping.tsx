import React, { useState, useRef, useEffect } from 'react';
import { useGameStore } from '@/lib/store';
import { HUD } from '@/components/HUD';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Upload, BookOpen, Keyboard, CheckCircle2 } from 'lucide-react';
import { Link } from 'wouter';
import { cn } from '@/lib/utils';

const DEFAULT_ARTICLES = [
  {
    title: "រឿងព្រេងខ្មែរ (Khmer Legend)",
    text: "កាលពីព្រេងនាយ មានបុរសម្នាក់ឈ្មោះថា ឆោត។ គាត់ជាមនុស្សស្លូតបូតណាស់។"
  },
  {
    title: "ធម្មជាតិ (Nature)",
    text: "ប្រទេសកម្ពុជាមានព្រៃឈើ និងភ្នំយ៉ាងស្រស់ស្អាត។ យើងត្រូវរួមគ្នាថែរក្សាការពារបរិស្ថាន។"
  }
];

export const FreeTyping: React.FC = () => {
  const [mode, setMode] = useState<'select' | 'typing'>('select');
  const [customText, setCustomText] = useState('');
  const [currentText, setCurrentText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [stats, setStats] = useState({ hits: 0, miss: 0, startTime: 0, wpm: 0 });
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const startTyping = (text: string) => {
    setCurrentText(text);
    setUserInput('');
    setStats({ hits: 0, miss: 0, startTime: Date.now(), wpm: 0 });
    setMode('typing');
  };

  useEffect(() => {
    if (mode === 'typing') {
      inputRef.current?.focus();
    }
  }, [mode]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const lastChar = val[val.length - 1];
    const targetChar = currentText[val.length - 1];

    if (val.length <= currentText.length) {
      if (lastChar === targetChar) {
        setStats(s => ({ ...s, hits: s.hits + 1 }));
      } else {
        setStats(s => ({ ...s, miss: s.miss + 1 }));
      }
      setUserInput(val);

      // Update WPM
      const timeElapsed = (Date.now() - stats.startTime) / 60000;
      if (timeElapsed > 0) {
        const wpm = Math.round((val.length / 5) / timeElapsed);
        setStats(s => ({ ...s, wpm }));
      }
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 pt-20">
      <HUD />
      
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/home">
            <Button variant="ghost" size="icon">
              <ArrowLeft />
            </Button>
          </Link>
          <h1 className="text-4xl font-black font-display text-foreground">សរសេរដោយសេរី / Free Typing</h1>
        </div>

        {mode === 'select' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-panel p-8 rounded-3xl border-primary/20 bg-primary/5">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Upload className="text-primary" /> បញ្ចូលអត្ថបទផ្ទាល់ខ្លួន
              </h2>
              <textarea
                className="w-full h-40 p-4 rounded-2xl bg-secondary border border-border focus:ring-2 focus:ring-primary/50 focus:outline-none mb-4 font-khmer"
                placeholder="សូមចម្លងអត្ថបទរបស់អ្នកនៅទីនេះ..."
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
              />
              <Button 
                className="w-full h-12 rounded-xl font-bold"
                disabled={!customText.trim()}
                onClick={() => startTyping(customText)}
              >
                ចាប់ផ្តើមសរសេរ
              </Button>
            </div>

            <div className="glass-panel p-8 rounded-3xl border-border bg-card">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <BookOpen className="text-blue-500" /> អត្ថបទគំរូ
              </h2>
              <div className="space-y-4">
                {DEFAULT_ARTICLES.map((article, i) => (
                  <div 
                    key={i}
                    className="p-4 rounded-xl border border-border hover:border-primary/50 cursor-pointer transition-all bg-muted/30"
                    onClick={() => startTyping(article.text)}
                  >
                    <h3 className="font-bold text-lg mb-1">{article.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 font-khmer">{article.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="glass-panel p-8 rounded-3xl border-border bg-card relative overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <div className="flex gap-8">
                  <div className="flex flex-col">
                    <span className="text-xs uppercase font-black text-muted-foreground">Speed</span>
                    <span className="text-3xl font-mono font-black text-primary">{stats.wpm} <small className="text-sm">WPM</small></span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs uppercase font-black text-muted-foreground">Accuracy</span>
                    <span className="text-3xl font-mono font-black text-foreground">
                      {userInput.length > 0 ? Math.round((stats.hits / userInput.length) * 100) : 100}%
                    </span>
                  </div>
                </div>
                <Button variant="outline" onClick={() => setMode('select')}>ប្តូរអត្ថបទ</Button>
              </div>

              <div className="text-2xl font-khmer leading-relaxed mb-8 p-6 bg-secondary/50 rounded-2xl border border-border min-h-[200px] whitespace-pre-wrap relative">
                {currentText.split('').map((char, i) => {
                  let color = "text-muted-foreground";
                  if (i < userInput.length) {
                    color = userInput[i] === char ? "text-emerald-500" : "text-red-500 bg-red-100";
                  }
                  return <span key={i} className={cn(color, i === userInput.length && "bg-primary/20 border-b-2 border-primary animate-pulse")}>{char}</span>;
                })}
              </div>

              <textarea
                ref={inputRef}
                value={userInput}
                onChange={handleInput}
                className="absolute opacity-0 pointer-events-none"
              />
              <div 
                className="cursor-text absolute inset-0 z-10" 
                onClick={() => inputRef.current?.focus()}
              />
              
              {userInput.length === currentText.length && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-20 p-8 text-center animate-in zoom-in-95">
                  <CheckCircle2 size={64} className="text-emerald-500 mb-4" />
                  <h2 className="text-3xl font-black mb-2">អស្ចារ្យណាស់!</h2>
                  <p className="text-muted-foreground mb-6">អ្នកបានបញ្ចប់ការសរសេរដោយជោគជ័យ។</p>
                  <div className="flex gap-4">
                    <Button size="lg" onClick={() => startTyping(currentText)}>សរសេរម្តងទៀត</Button>
                    <Button size="lg" variant="outline" onClick={() => setMode('select')}>ត្រឡប់ក្រោយ</Button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="text-center text-sm text-muted-foreground">
              ចុចលើអត្ថបទដើម្បីចាប់ផ្តើមសរសេរ។ ប្រព័ន្ធនឹងតាមដានល្បឿន និងភាពត្រឹមត្រូវរបស់អ្នក។
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
