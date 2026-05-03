import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import {
  ArrowLeft,
  ClipboardList,
  Clock,
  Copy,
  Gauge,
  LogIn,
  Play,
  RotateCcw,
  School,
  Target,
  UserCheck,
  Users,
} from "lucide-react";
import { child, get, onValue, ref, remove, update } from "firebase/database";

import { Button } from "@/components/ui/button";
import { HUD } from "@/components/HUD";
import { Keyboard } from "@/components/Keyboard";
import { realtimeDatabaseUrl, realtimeDb, isFirebaseRealtimeReady } from "@/lib/firebase";
import { cn } from "@/lib/utils";

type Role = "teacher" | "student" | null;
type ViewMode = "choose" | "teacher-setup" | "teacher-room" | "student-join" | "student-typing" | "student-results";

interface ClassroomStudent {
  id: string;
  name: string;
  progress: number;
  currentIndex: number;
  wpm: number;
  accuracy: number;
  errors: number;
  elapsedTime: number;
  finished: boolean;
  joinedAt: number;
  completedAt?: number;
}

interface ClassroomRoom {
  code: string;
  teacherName: string;
  assignedText: string;
  createdAt: number;
  students?: Record<string, ClassroomStudent>;
}

const DEFAULT_TEXT =
  "ការហាត់ប្រាណធ្វើឱ្យការវាយអក្សររលូនជាងមុន។ អានឱ្យប្រុងប្រយ័ត្ន រក្សាចង្វាក់ ហើយផ្តោតលើភាពត្រឹមត្រូវជាមុន។";

const makeRoomCode = () => Math.random().toString(36).slice(2, 8).toUpperCase();

const makeStudentId = () => {
  const saved = window.localStorage.getItem("khmer-typing-classroom-student-id");
  if (saved) return saved;
  const next = `student-${Math.random().toString(36).slice(2, 10)}`;
  window.localStorage.setItem("khmer-typing-classroom-student-id", next);
  return next;
};

const getClassroomRef = (roomCode: string) => {
  if (!realtimeDb) throw new Error("Firebase Realtime Database is not configured.");
  return ref(realtimeDb, `classroomRooms/${roomCode}`);
};

const withFirebaseTimeout = async <T,>(task: Promise<T>, action: string) => {
  let timeoutId: number | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = window.setTimeout(() => reject(new Error(`${action} timed out`)), 8000);
  });

  try {
    return await Promise.race([task, timeout]);
  } finally {
    if (timeoutId) window.clearTimeout(timeoutId);
  }
};

const getRoomRestUrl = (roomCode: string) => {
  if (!realtimeDatabaseUrl) throw new Error("Firebase Realtime Database URL is not configured.");
  return `${realtimeDatabaseUrl.replace(/\/$/, "")}/classroomRooms/${roomCode}.json`;
};

const writeRoomWithRest = async (roomCode: string, nextRoom: ClassroomRoom) => {
  const response = await withFirebaseTimeout(
    fetch(getRoomRestUrl(roomCode), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nextRoom),
    }),
    "Create classroom room",
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${response.status}: ${text || response.statusText}`);
  }
};

const getFirebaseStatusMessage = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("timed out")) {
    return "Firebase ឆ្លើយតបយឺតពេក។ សូមពិនិត្យ VITE_FIREBASE_DATABASE_URL នៅ Vercel ឱ្យត្រូវនឹង URL ក្នុង Realtime Database។";
  }

  if (lowerMessage.includes("permission")) {
    return "Firebase Rules មិនអនុញ្ញាតឱ្យប្រើបន្ទប់គ្រូទេ។ សូមកំណត់ Rules សម្រាប់ classroomRooms ឱ្យអាច read/write បាន។";
  }

  if (lowerMessage.includes("network") || lowerMessage.includes("offline")) {
    return "មិនអាចភ្ជាប់ទៅ Firebase បានទេ។ សូមពិនិត្យអ៊ីនធឺណិត រួចសាកល្បងម្តងទៀត។";
  }

  return `មិនអាចប្រើបន្ទប់គ្រូបានទេ៖ ${message}`;
};

export const TeacherMode: React.FC = () => {
  const [, navigate] = useLocation();
  const [role, setRole] = useState<Role>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("choose");
  const [teacherName, setTeacherName] = useState("");
  const [studentName, setStudentName] = useState("");
  const [assignedText, setAssignedText] = useState(DEFAULT_TEXT);
  const [joinCode, setJoinCode] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [room, setRoom] = useState<ClassroomRoom | null>(null);
  const [statusText, setStatusText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [errors, setErrors] = useState(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [studentId] = useState(makeStudentId);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeText = room?.assignedText || assignedText;
  const students = useMemo(() => Object.values(room?.students || {}), [room]);

  const accuracy = useMemo(() => {
    if (totalKeystrokes === 0) return 100;
    return Math.max(0, Math.round(((totalKeystrokes - errors) / totalKeystrokes) * 100));
  }, [errors, totalKeystrokes]);

  const wpm = useMemo(() => {
    if (!startTime || elapsedTime <= 0) return 0;
    return Math.round(currentIndex / 5 / (elapsedTime / 60));
  }, [currentIndex, elapsedTime, startTime]);

  const progress = activeText.length > 0 ? Math.round((currentIndex / activeText.length) * 100) : 0;

  useEffect(() => {
    if (!roomCode || !realtimeDb) return;

    const unsubscribe = onValue(getClassroomRef(roomCode), (snapshot) => {
      const nextRoom = snapshot.val() as ClassroomRoom | null;
      setRoom(nextRoom);

      if (!nextRoom) {
        setStatusText("បន្ទប់នេះមិនមានទៀតទេ។");
        setRoomCode("");
        setViewMode(role === "teacher" ? "teacher-setup" : "student-join");
      }
    });

    return () => unsubscribe();
  }, [roomCode, role]);

  useEffect(() => {
    if (viewMode !== "student-typing" || !startTime) return;
    const interval = window.setInterval(() => {
      setElapsedTime(Math.round((Date.now() - startTime) / 1000));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [startTime, viewMode]);

  useEffect(() => {
    if ((viewMode !== "student-typing" && viewMode !== "student-results") || !roomCode || !realtimeDb || !room) return;

    update(child(getClassroomRef(roomCode), `students/${studentId}`), {
      currentIndex,
      progress,
      wpm,
      accuracy,
      errors,
      elapsedTime,
      finished: currentIndex >= activeText.length,
      completedAt: currentIndex >= activeText.length ? Date.now() : null,
    }).catch((error) => setStatusText(getFirebaseStatusMessage(error)));
  }, [accuracy, activeText.length, currentIndex, elapsedTime, errors, progress, room, roomCode, studentId, viewMode, wpm]);

  useEffect(() => {
    if (viewMode === "student-typing") {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [viewMode]);

  const resetStudentTyping = () => {
    setCurrentIndex(0);
    setTypedText("");
    setErrors(0);
    setTotalKeystrokes(0);
    setElapsedTime(0);
    setStartTime(Date.now());
  };

  const chooseRole = (nextRole: Role) => {
    setRole(nextRole);
    setStatusText("");
    setViewMode(nextRole === "teacher" ? "teacher-setup" : "student-join");
  };

  const createRoom = async () => {
    setStatusText("កំពុងបង្កើតបន្ទប់...");
    if (!assignedText.trim()) {
      setStatusText("សូមបញ្ចូលអត្ថបទសម្រាប់សិស្សវាយ។");
      return;
    }
    if (!isFirebaseRealtimeReady || !realtimeDb) {
      setStatusText("សូមកំណត់ VITE_FIREBASE_DATABASE_URL សិន ដើម្បីប្រើបន្ទប់គ្រូ។");
      return;
    }

    try {
      const code = makeRoomCode();
      const nextRoom: ClassroomRoom = {
        code,
        teacherName: teacherName.trim() || "គ្រូ",
        assignedText: assignedText.trim(),
        createdAt: Date.now(),
        students: {},
      };

      await writeRoomWithRest(code, nextRoom);
      setRoomCode(code);
      setRoom(nextRoom);
      setViewMode("teacher-room");
      setStatusText("");
    } catch (error) {
      setStatusText(getFirebaseStatusMessage(error));
    }
  };

  const joinRoom = async () => {
    setStatusText("កំពុងចូលបន្ទប់...");
    if (!isFirebaseRealtimeReady || !realtimeDb) {
      setStatusText("សូមកំណត់ VITE_FIREBASE_DATABASE_URL សិន ដើម្បីប្រើបន្ទប់គ្រូ។");
      return;
    }

    const code = joinCode.trim().toUpperCase();
    if (!code) {
      setStatusText("សូមបញ្ចូលលេខកូដបន្ទប់។");
      return;
    }
    if (!studentName.trim()) {
      setStatusText("សូមបញ្ចូលឈ្មោះសិស្ស។");
      return;
    }

    try {
      const snapshot = await withFirebaseTimeout(get(getClassroomRef(code)), "Join classroom room");
      const existingRoom = snapshot.val() as ClassroomRoom | null;
      if (!existingRoom) {
        setStatusText("រកមិនឃើញបន្ទប់នេះទេ។");
        return;
      }

      const nextStudent: ClassroomStudent = {
        id: studentId,
        name: studentName.trim(),
        progress: 0,
        currentIndex: 0,
        wpm: 0,
        accuracy: 100,
        errors: 0,
        elapsedTime: 0,
        finished: false,
        joinedAt: Date.now(),
      };

      await withFirebaseTimeout(update(getClassroomRef(code), { [`students/${studentId}`]: nextStudent }), "Join classroom room");
      setRoomCode(code);
      setRoom(existingRoom);
      resetStudentTyping();
      setViewMode("student-typing");
      setStatusText("");
    } catch (error) {
      setStatusText(getFirebaseStatusMessage(error));
    }
  };

  const copyRoomCode = async () => {
    if (!roomCode) return;
    await navigator.clipboard?.writeText(roomCode);
    setStatusText("បានចម្លងលេខកូដបន្ទប់។");
  };

  const closeRoom = async () => {
    if (roomCode && realtimeDb) {
      await remove(getClassroomRef(roomCode));
    }
    setRoom(null);
    setRoomCode("");
    setStatusText("");
    setViewMode("teacher-setup");
  };

  const leaveRoom = async () => {
    if (roomCode && realtimeDb) {
      await remove(child(getClassroomRef(roomCode), `students/${studentId}`));
    }
    setRoom(null);
    setRoomCode("");
    setJoinCode("");
    setStatusText("");
    setViewMode("student-join");
  };

  const handleTyping = (value: string) => {
    if (viewMode !== "student-typing") return;
    const nextValue = value.slice(0, activeText.length);
    let nextErrors = 0;

    for (let i = 0; i < nextValue.length; i++) {
      if (nextValue[i] !== activeText[i]) nextErrors++;
    }

    setTypedText(nextValue);
    setCurrentIndex(nextValue.length);
    setErrors(nextErrors);
    setTotalKeystrokes(nextValue.length);

    if (nextValue.length >= activeText.length) {
      setViewMode("student-results");
    }
  };

  const handleBack = () => {
    if (viewMode === "choose") {
      navigate("/home");
      return;
    }
    if (viewMode === "teacher-room") {
      setViewMode("teacher-setup");
      return;
    }
    if (viewMode === "student-typing" || viewMode === "student-results") {
      setViewMode("student-join");
      return;
    }
    setRole(null);
    setViewMode("choose");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const renderText = () => (
    <div className="text-2xl leading-loose tracking-wide p-6 bg-secondary/50 rounded-xl border border-border">
      {activeText.split("").map((char, index) => {
        const typed = typedText[index];
        const isTyped = index < typedText.length;
        const isCorrect = typed === char;
        const isCurrent = index === typedText.length;

        return (
          <span
            key={`${char}-${index}`}
            className={cn(
              "transition-colors",
              isTyped && (isCorrect ? "text-green-500" : "text-red-600 underline"),
              isCurrent && "bg-primary text-primary-foreground px-0.5 rounded",
              !isTyped && !isCurrent && "text-muted-foreground",
            )}
          >
            {char}
          </span>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-20 pt-20">
      <HUD />
      <div className="container mx-auto px-4 mt-8 max-w-6xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="secondary" size="icon" className="rounded-full" onClick={handleBack} data-testid="button-back">
            <ArrowLeft size={18} />
          </Button>
          <div>
            <h1 className="text-3xl font-black text-foreground">សម្រាប់គ្រូ</h1>
            <p className="text-muted-foreground">
              គ្រូអាចបង្កើតបន្ទប់ ផ្តល់លេខកូដឱ្យសិស្ស ហើយមើលទិន្នន័យពេលសិស្សកំពុងវាយ។
            </p>
          </div>
        </div>

        {viewMode === "choose" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <button
              onClick={() => chooseRole("teacher")}
              className="glass-panel p-8 rounded-2xl text-left border-border bg-card hover:border-primary/50 transition-all"
              data-testid="button-role-teacher"
            >
              <School className="text-primary mb-4" size={48} />
              <h2 className="text-2xl font-black text-foreground mb-2">ខ្ញុំជាគ្រូ</h2>
              <p className="text-muted-foreground">បង្កើតបន្ទប់ថ្មី សរសេរកិច្ចការ ហើយមើលលទ្ធផលសិស្ស។</p>
            </button>

            <button
              onClick={() => chooseRole("student")}
              className="glass-panel p-8 rounded-2xl text-left border-border bg-card hover:border-primary/50 transition-all"
              data-testid="button-role-student"
            >
              <UserCheck className="text-primary mb-4" size={48} />
              <h2 className="text-2xl font-black text-foreground mb-2">ខ្ញុំជាសិស្ស</h2>
              <p className="text-muted-foreground">បញ្ចូលលេខកូដពីគ្រូ ដើម្បីចូលវាយកិច្ចការ។</p>
            </button>
          </div>
        )}

        {viewMode === "teacher-setup" && (
          <div className="glass-panel p-8 rounded-2xl max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <ClipboardList className="text-primary" size={28} />
              <h2 className="text-2xl font-bold text-foreground">បង្កើតបន្ទប់គ្រូ</h2>
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
                <label className="text-sm font-medium text-muted-foreground mb-2 block">អត្ថបទសម្រាប់សិស្សវាយ</label>
                <textarea
                  value={assignedText}
                  onChange={(event) => setAssignedText(event.target.value)}
                  rows={5}
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-lg resize-none"
                  data-testid="input-assigned-text"
                />
              </div>

              <Button onClick={createRoom} className="w-full gap-2" size="lg" data-testid="button-create-classroom-room">
                <Users size={18} />
                បង្កើតលេខកូដបន្ទប់
              </Button>
              {statusText && <p className="text-sm font-bold text-primary">{statusText}</p>}
            </div>
          </div>
        )}

        {viewMode === "teacher-room" && room && (
          <div className="space-y-6">
            <div className="glass-panel p-8 rounded-2xl border-border bg-card">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                  <div className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">លេខកូដបន្ទប់សម្រាប់សិស្ស</div>
                  <div className="text-5xl font-mono font-black text-primary" data-testid="text-classroom-room-code">{roomCode}</div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button onClick={copyRoomCode} variant="secondary" className="h-12 font-black">
                    <Copy className="mr-2" size={18} /> ចម្លងកូដ
                  </Button>
                  <Button onClick={closeRoom} variant="outline" className="h-12 font-black">
                    បិទបន្ទប់
                  </Button>
                </div>
              </div>
              <p className="mt-4 text-muted-foreground">ផ្តល់លេខកូដនេះឱ្យសិស្ស។ ពេលសិស្សចូល និងវាយ អ្នកនឹងឃើញទិន្នន័យខាងក្រោម។</p>
              {statusText && <p className="mt-4 text-sm font-bold text-primary">{statusText}</p>}
            </div>

            <div className="glass-panel p-6 rounded-2xl border-border bg-card">
              <h2 className="text-xl font-black mb-4">ទិន្នន័យសិស្ស</h2>
              {students.length === 0 ? (
                <div className="rounded-xl bg-muted/40 p-6 text-center text-muted-foreground font-bold">
                  កំពុងរង់ចាំសិស្សចូលបន្ទប់...
                </div>
              ) : (
                <div className="space-y-3">
                  {students.map((student) => (
                    <div key={student.id} className="rounded-xl bg-secondary/50 p-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
                        <div>
                          <div className="font-black text-foreground">{student.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {student.finished ? "បានបញ្ចប់" : "កំពុងវាយ"} · {student.currentIndex}/{room.assignedText.length}
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-center min-w-[280px]">
                          <div>
                            <div className="text-lg font-mono font-black text-foreground">{student.wpm}</div>
                            <div className="text-[10px] text-muted-foreground font-bold">WPM</div>
                          </div>
                          <div>
                            <div className="text-lg font-mono font-black text-foreground">{student.accuracy}%</div>
                            <div className="text-[10px] text-muted-foreground font-bold">ត្រឹមត្រូវ</div>
                          </div>
                          <div>
                            <div className="text-lg font-mono font-black text-red-600">{student.errors}</div>
                            <div className="text-[10px] text-muted-foreground font-bold">កំហុស</div>
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                        <div className="bg-primary h-full transition-all duration-300" style={{ width: `${student.progress}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {viewMode === "student-join" && (
          <div className="glass-panel p-8 rounded-2xl max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <LogIn className="text-primary" size={28} />
              <h2 className="text-2xl font-bold text-foreground">ចូលបន្ទប់គ្រូ</h2>
            </div>

            <div className="space-y-6">
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
                <label className="text-sm font-medium text-muted-foreground mb-2 block">លេខកូដបន្ទប់</label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
                  placeholder="ឧ. ABC123"
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono uppercase"
                  data-testid="input-join-classroom-code"
                />
              </div>
              <Button onClick={joinRoom} className="w-full gap-2" size="lg" data-testid="button-join-classroom-room">
                <LogIn size={18} />
                ចូលបន្ទប់
              </Button>
              {statusText && <p className="text-sm font-bold text-primary">{statusText}</p>}
            </div>
          </div>
        )}

        {viewMode === "student-typing" && room && (
          <div className="space-y-6">
            <div className="glass-panel p-4 rounded-2xl">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="font-bold text-foreground">{studentName || "សិស្ស"}</div>
                  <div className="text-sm text-muted-foreground">កិច្ចការពី {room.teacherName || "គ្រូ"} · បន្ទប់ {roomCode}</div>
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

              <input
                ref={inputRef}
                value={typedText}
                onChange={(event) => handleTyping(event.target.value)}
                className="mt-4 w-full bg-secondary border border-border rounded-xl px-4 py-3 text-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="ចាប់ផ្តើមវាយនៅទីនេះ..."
                data-testid="input-classroom-typing"
                autoFocus
              />

              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">វឌ្ឍនភាព: {progress}%</div>
                <div className="w-full max-w-md mx-4 bg-secondary rounded-full h-2 overflow-hidden">
                  <div className="bg-primary h-full transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
                <div className="text-sm text-muted-foreground">{currentIndex}/{activeText.length}</div>
              </div>
            </div>

            <Keyboard activeCode={null} className="mt-4" />
            <Button onClick={leaveRoom} variant="outline" className="w-full h-12 font-black">
              ចាកចេញពីបន្ទប់
            </Button>
          </div>
        )}

        {viewMode === "student-results" && room && (
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
              <Button
                onClick={() => {
                  resetStudentTyping();
                  setViewMode("student-typing");
                }}
                className="flex-1 gap-2"
                data-testid="button-retry-assignment"
              >
                <RotateCcw size={18} /> សាកម្តងទៀត
              </Button>
              <Button variant="outline" onClick={leaveRoom} className="flex-1">
                ចាកចេញ
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
