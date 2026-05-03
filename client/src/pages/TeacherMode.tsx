import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, ClipboardList, Clock, Gauge, Play, RotateCcw, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HUD } from "@/components/HUD";
import { Keyboard } from "@/components/Keyboard";
import { cn } from "@/lib/utils";

type ViewMode = "setup" | "typing" | "results";

const DEFAULT_TEXT =
  "ការហាត់ប្រាណធ្វើឱ្យការវាយអក្សររលូនជាងមុន។ អានឱ្យប្រុងប្រយ័ត្ន រក្សាចង្វាក់ ហើយផ្តោតលើភាពត្រឹមត្រូវជាមុន។";

export const TeacherMode: React.FC = () => {
  const [, navigate] = useLocation();
  const [viewMode, setViewMode] = useState<ViewMode>("setup");
  const [teacherName, setTeacherName] = useState("");
  const [studentName, setStudentName] = useState("");
  const [assignedText, setAssignedText] = useState(DEFAULT_TEXT);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [errors, setErrors] = useState(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  const accuracy = useMemo(() => {
    if (totalKeystrokes === 0) return 100;
    return Math.max(0, Math.round(((totalKeystrokes - errors) / totalKeystrokes) * 100));
  }, [errors, totalKeystrokes]);

  const wpm = useMemo(() => {
    if (!startTime || elapsedTime <= 0) return 0;
    return Math.round((currentIndex / 5) / (elapsedTime / 60));
  }, [currentIndex, elapsedTime, startTime]);

  const progress = assignedText.length > 0 ? Math.round((currentIndex / assignedText.length) * 100) : 0;

  const startAssignment = () => {
    if (!assignedText.trim()) {
      alert("សូមបញ្ចូលអត្ថបទសម្រាប់សិស្សវាយ។");
      return;
    }

    setCurrentIndex(0);
    setErrors(0);
    setTotalKeystrokes(0);
    setElapsedTime(0);
    setStartTime(Date.now());
    setViewMode("typing");
  };

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (viewMode !== "typing") return;
      if (event.key === "Shift" || event.key === "Control" || event.key === "Alt" || event.key === "Meta") {
        return;
      }
      if (event.key === " " || event.key === "Backspace" || event.key === "Tab") {
        event.preventDefault();
      }

      const targetChar = assignedText[currentIndex];
      setTotalKeystrokes((current) => current + 1);

      if (event.key === targetChar) {
        const nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex);
        if (nextIndex >= assignedText.length) {
          setViewMode("results");
        }
      } else {
        setErrors((current) => current + 1);
      }
    },
    [assignedText, currentIndex, viewMode],
  );

  useEffect(() => {
    if (viewMode !== "typing") return;
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown, viewMode]);

  useEffect(() => {
    if (viewMode !== "typing" || !startTime) return;
    const interval = window.setInterval(() => {
      setElapsedTime(Math.round((Date.now() - startTime) / 1000));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [startTime, viewMode]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const renderText = () => (
    <div className="text-2xl leading-loose tracking-wide p-6 bg-secondary/50 rounded-xl border border-border">
      {assignedText.split("").map((char, index) => (
        <span
          key={`${char}-${index}`}
          className={cn(
            "transition-colors",
            index < currentIndex && "text-green-500",
            index === currentIndex && "bg-primary text-primary-foreground px-0.5 rounded",
            index > currentIndex && "text-muted-foreground",
          )}
        >
          {char}
        </span>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-20 pt-20">
      <HUD />
      <div className="container mx-auto px-4 mt-8 max-w-5xl">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full"
            onClick={() => {
              if (viewMode === "setup") {
                navigate("/home");
              } else {
                setViewMode("setup");
              }
            }}
            data-testid="button-back"
          >
            <ArrowLeft size={18} />
          </Button>
          <div>
            <h1 className="text-3xl font-black text-foreground">របៀបគ្រូ</h1>
            <p className="text-muted-foreground">ការហាត់វាយអក្សរសម្រាប់ថ្នាក់រៀន ដែលអាចប្រើបានលើ Vercel និង Firebase Hosting។</p>
          </div>
        </div>

        {viewMode === "setup" && (
          <div className="glass-panel p-8 rounded-2xl max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <ClipboardList className="text-primary" size={28} />
              <h2 className="text-2xl font-bold text-foreground">បង្កើតកិច្ចការ</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">ឈ្មោះគ្រូ</label>
                <input
                  type="text"
                  value={teacherName}
                  onChange={(event) => setTeacherName(event.target.value)}
                  placeholder="ឈ្មោះគ្រូ"
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  data-testid="input-teacher-name"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">ឈ្មោះសិស្ស</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(event) => setStudentName(event.target.value)}
                  placeholder="ឈ្មោះសិស្ស"
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  data-testid="input-student-name"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">អត្ថបទសម្រាប់វាយ</label>
                <textarea
                  value={assignedText}
                  onChange={(event) => setAssignedText(event.target.value)}
                  rows={5}
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-lg resize-none"
                  data-testid="input-assigned-text"
                />
              </div>

              <Button onClick={startAssignment} className="w-full gap-2" size="lg" data-testid="button-start-assignment">
                <Play size={18} />
                ចាប់ផ្តើមកិច្ចការ
              </Button>
            </div>
          </div>
        )}

        {viewMode === "typing" && (
          <div className="space-y-6">
            <div className="glass-panel p-4 rounded-2xl">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="font-bold text-foreground">{studentName || "សិស្ស"}</div>
                  <div className="text-sm text-muted-foreground">កិច្ចការពី {teacherName || "គ្រូ"}</div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Gauge className="text-blue-500" size={20} />
                    <span className="font-bold text-foreground" data-testid="text-current-wpm">{wpm} WPM</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="text-amber-500" size={20} />
                    <span className="font-bold text-foreground" data-testid="text-current-accuracy">{accuracy}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="text-violet-500" size={20} />
                    <span className="font-bold text-foreground" data-testid="text-current-time">{formatTime(elapsedTime)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl">
              <h3 className="text-lg font-bold text-foreground mb-4">វាយកិច្ចការខាងក្រោម</h3>
              {renderText()}

              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">វឌ្ឍនភាព: {progress}%</div>
                <div className="w-full max-w-md mx-4 bg-secondary rounded-full h-2 overflow-hidden">
                  <div className="bg-primary h-full transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
                <div className="text-sm text-muted-foreground">{currentIndex}/{assignedText.length}</div>
              </div>
            </div>

            <Keyboard activeCode={null} className="mt-4" />
          </div>
        )}

        {viewMode === "results" && (
          <div className="glass-panel p-12 rounded-2xl text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-6">កិច្ចការបានបញ្ចប់</h2>
            <div className="flex justify-center gap-8 mb-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-500">{wpm}</div>
                <div className="text-sm text-muted-foreground">WPM</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-amber-500">{accuracy}%</div>
                <div className="text-sm text-muted-foreground">ភាពត្រឹមត្រូវ</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-violet-500">{formatTime(elapsedTime)}</div>
                <div className="text-sm text-muted-foreground">ពេលវេលា</div>
              </div>
            </div>
            <div className="flex gap-4">
              <Button onClick={startAssignment} className="flex-1 gap-2" data-testid="button-retry-assignment">
                <RotateCcw size={18} /> សាកម្តងទៀត
              </Button>
              <Button variant="outline" onClick={() => setViewMode("setup")} className="flex-1">
                កិច្ចការថ្មី
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
