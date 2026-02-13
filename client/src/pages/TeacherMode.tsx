import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { HUD } from '@/components/HUD';
import { Keyboard } from '@/components/Keyboard';
import { ArrowLeft, Users, Play, Copy, Check, Clock, Target, Gauge, Trophy, UserCheck } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { useTranslation } from '@/lib/useTranslation';
import { cn } from '@/lib/utils';
import { STATIC_MODE } from '@/lib/static-mode';
import type { TeacherRoom, StudentResult } from '@shared/schema';

type ViewMode = 'select' | 'create' | 'join' | 'teacher-dashboard' | 'student-typing';

export const TeacherMode: React.FC = () => {
  return (
    <div className="min-h-screen bg-background pb-20 pt-20 flex flex-col items-center justify-center p-4 text-center">
      <HUD />
      <div className="glass-panel p-12 rounded-[2.5rem] max-w-xl">
        <BookOpen size={64} className="text-primary mx-auto mb-6" />
        <h1 className="text-3xl font-black mb-4 font-display">របៀបគ្រូបង្រៀន / Teacher Mode</h1>
        <p className="text-muted-foreground mb-8">
          មុខងារនេះតម្រូវឱ្យមានម៉ាស៊ីនបម្រើ (Server) ដើម្បីដំណើរការ។ នៅក្នុងកំណែ static នេះ មុខងារនេះត្រូវបានបិទជាបណ្តោះអាសន្ន។
        </p>
        <Link href="/home">
          <Button size="lg" className="w-full">ត្រឡប់ទៅទំព័រដើម</Button>
        </Link>
      </div>
    </div>
  );
};

const _OldTeacherMode: React.FC = () => {
  if (STATIC_MODE) {
    return (
      <div className="min-h-screen bg-background pb-20 pt-20">
        <HUD />
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/home">
              <Button variant="ghost" size="icon"><ArrowLeft /></Button>
            </Link>
            <h1 className="text-3xl font-black font-display text-foreground">សម្រាប់គ្រូ / Teacher Mode</h1>
          </div>
          <div className="glass-panel p-12 rounded-3xl text-center">
            <Users size={64} className="mx-auto text-muted-foreground mb-6" />
            <h2 className="text-2xl font-bold mb-4">មុខងារនេះត្រូវការ Server</h2>
            <p className="text-muted-foreground mb-6">មុខងារ Teacher Mode ត្រូវការ server ដើម្បីដំណើរការ។ សូមប្រើគេហទំព័រ online version ដើម្បីប្រើមុខងារគ្រូបង្រៀន។</p>
            <Link href="/home">
              <Button size="lg">ត្រឡប់ទំព័រដើម</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const [viewMode, setViewMode] = useState<ViewMode>('select');
  const [socket, setSocket] = useState<Socket | null>(null);
  
  // Create room state
  const [teacherName, setTeacherName] = useState('');
  const [assignedText, setAssignedText] = useState('');
  const [createdRoom, setCreatedRoom] = useState<TeacherRoom | null>(null);
  const [copied, setCopied] = useState(false);
  
  // Join room state
  const [studentName, setStudentName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [joinedRoom, setJoinedRoom] = useState<TeacherRoom | null>(null);
  const [studentId, setStudentId] = useState<string | null>(null);
  
  // Students list
  const [students, setStudents] = useState<StudentResult[]>([]);
  
  // Typing state (for students)
  const [currentIndex, setCurrentIndex] = useState(0);
  const [errors, setErrors] = useState(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [finished, setFinished] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [sessionStarted, setSessionStarted] = useState(false);

  // Initialize socket
  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);

    newSocket.on("teacher_room_joined", ({ room, students: roomStudents }) => {
      setCreatedRoom(room);
      setStudents(roomStudents);
    });

    newSocket.on("teacher_room_updated", ({ room, students: roomStudents }) => {
      setCreatedRoom(room);
      setStudents(roomStudents);
    });

    newSocket.on("student_joined", ({ student, room }) => {
      setStudentId(student.id);
      setJoinedRoom(room);
      setViewMode('student-typing');
      // If room is already active, start the session for late joiners
      if (room.status === 'active') {
        setSessionStarted(true);
      }
    });

    newSocket.on("session_started", ({ room, students: roomStudents }) => {
      setCreatedRoom(room);
      setJoinedRoom(room);
      setStudents(roomStudents);
      setSessionStarted(true);
    });

    newSocket.on("error", ({ message }) => {
      alert(message);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Generate room code
  const generateRoomCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  };

  // Create room
  const handleCreateRoom = async () => {
    if (!teacherName.trim() || !assignedText.trim()) {
      alert('Please enter your name and the text for students to type');
      return;
    }

    const newRoomCode = generateRoomCode();
    
    try {
      const response = await fetch('/api/teacher-rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode: newRoomCode,
          teacherName: teacherName.trim(),
          assignedText: assignedText.trim(),
          status: 'waiting',
        }),
      });

      if (!response.ok) throw new Error('Failed to create room');
      
      const room = await response.json();
      setCreatedRoom(room);
      
      // Join as teacher
      socket?.emit("teacher_join_room", { roomCode: newRoomCode });
      setViewMode('teacher-dashboard');
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Failed to create room');
    }
  };

  // Join room as student
  const handleJoinRoom = () => {
    if (!studentName.trim() || !roomCode.trim()) {
      alert('Please enter your name and room code');
      return;
    }

    socket?.emit("student_join_room", { 
      roomCode: roomCode.trim().toUpperCase(), 
      studentName: studentName.trim() 
    });
  };

  // Start session (teacher)
  const handleStartSession = () => {
    if (createdRoom) {
      socket?.emit("teacher_start_session", { roomCode: createdRoom.roomCode });
    }
  };

  // Copy room code
  const copyRoomCode = () => {
    if (createdRoom) {
      navigator.clipboard.writeText(createdRoom.roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Handle typing (student)
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!joinedRoom || !sessionStarted || finished) return;
    
    // Prevent default behavior for keys that might scroll or affect the UI
    if (e.key === ' ' || e.key === 'Backspace' || e.key === 'Tab') {
      e.preventDefault();
    }

    const text = joinedRoom.assignedText;
    const targetChar = text[currentIndex];
    
    if (e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt' || e.key === 'Meta') {
      return;
    }

    if (!isTyping) {
      setIsTyping(true);
      setStartTime(Date.now());
    }

    setTotalKeystrokes(prev => prev + 1);

    if (e.key === targetChar) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);

      // Calculate stats using local variables for immediate update
      const now = Date.now();
      const actualStartTime = startTime || now;
      const elapsedMs = now - actualStartTime;
      const elapsedMins = elapsedMs / 1000 / 60;
      const wordsTyped = newIndex / 5;
      const currentWpm = elapsedMins > 0 ? Math.round(wordsTyped / elapsedMins) : 0;
      
      // Use the updated totalKeystrokes count (prev + 1)
      const currentTotalKeystrokes = totalKeystrokes + 1;
      const currentAccuracy = currentTotalKeystrokes > 0 ? Math.round(((currentTotalKeystrokes - errors) / currentTotalKeystrokes) * 100) : 100;
      const timeSeconds = Math.round(elapsedMs / 1000);

      setWpm(currentWpm);
      setAccuracy(currentAccuracy);
      setElapsedTime(timeSeconds);

      // Update progress via socket
      socket?.emit("student_update_progress", {
        studentId,
        roomCode: joinedRoom.roomCode,
        progress: Math.round((newIndex / text.length) * 100),
        wpm: currentWpm,
        accuracy: currentAccuracy,
        timeSeconds,
      });

      if (newIndex >= text.length) {
        setFinished(true);
        socket?.emit("student_finish", {
          studentId,
          roomCode: joinedRoom.roomCode,
          wpm: currentWpm,
          accuracy: currentAccuracy,
          timeSeconds,
        });
      }
    } else {
      setErrors(prev => prev + 1);
    }
  }, [joinedRoom, sessionStarted, finished, currentIndex, isTyping, startTime, totalKeystrokes, errors, studentId, socket]);

  useEffect(() => {
    if (viewMode === 'student-typing' && sessionStarted) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [viewMode, sessionStarted, handleKeyDown]);

  // Update elapsed time
  useEffect(() => {
    if (isTyping && !finished && startTime) {
      const interval = setInterval(() => {
        setElapsedTime(Math.round((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isTyping, finished, startTime]);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Render text with highlighting
  const renderText = () => {
    if (!joinedRoom) return null;
    const text = joinedRoom.assignedText;
    
    return (
      <div className="font-khmer text-2xl leading-loose tracking-wide p-6 bg-secondary/50 rounded-xl border border-border">
        {text.split('').map((char, i) => (
          <span
            key={i}
            className={cn(
              "transition-colors",
              i < currentIndex && "text-green-500",
              i === currentIndex && "bg-primary text-primary-foreground px-0.5 rounded",
              i > currentIndex && "text-muted-foreground"
            )}
          >
            {char}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-20 pt-20">
      <HUD />
      <div className="container mx-auto px-4 mt-8 max-w-5xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="secondary" size="icon" className="rounded-full" onClick={() => {
            if (viewMode === 'select') {
              navigate('/home');
            } else {
              setViewMode('select');
            }
          }} data-testid="button-back">
            <ArrowLeft size={18} />
          </Button>
          <h1 className="text-3xl font-black text-foreground">សម្រាប់គ្រូ</h1>
        </div>

        {/* Selection Mode */}
        {viewMode === 'select' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div 
              onClick={() => setViewMode('create')}
              className="glass-panel p-8 rounded-2xl cursor-pointer hover:border-primary/50 transition-all group"
              data-testid="card-teacher"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Users className="text-primary" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">ខ្ញុំគឺជាគ្រូបង្រៀន</h2>
              <p className="text-muted-foreground">បង្កើតបន្ទប់រៀន និងដាក់អត្ថបទឱ្យសិស្សអនុវត្ត</p>
            </div>

            <div 
              onClick={() => setViewMode('join')}
              className="glass-panel p-8 rounded-2xl cursor-pointer hover:border-primary/50 transition-all group"
              data-testid="card-student"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors">
                <UserCheck className="text-emerald-500" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">ខ្ញុំគឺជាសិស្ស</h2>
              <p className="text-muted-foreground">ចូលរួមបន្ទប់រៀនដោយប្រើលេខកូដពីគ្រូរបស់អ្នក</p>
            </div>
          </div>
        )}

        {/* Create Room Mode */}
        {viewMode === 'create' && (
          <div className="glass-panel p-8 rounded-2xl max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-6">បង្កើតបន្ទប់រៀន</h2>
            
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">ឈ្មោះរបស់អ្នក</label>
                <input
                  type="text"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  placeholder="បញ្ចូលឈ្មោះរបស់អ្នក..."
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  data-testid="input-teacher-name"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">អត្ថបទសម្រាប់សិស្ស (ភាសាខ្មែរ)</label>
                <textarea
                  value={assignedText}
                  onChange={(e) => setAssignedText(e.target.value)}
                  placeholder="ស្រុកខ្មែរយើង..."
                  rows={5}
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-khmer text-lg resize-none"
                  data-testid="input-assigned-text"
                />
              </div>

              <Button onClick={handleCreateRoom} className="w-full gap-2" size="lg" data-testid="button-create-room">
                <Play size={18} />
                បង្កើតបន្ទប់
              </Button>
            </div>
          </div>
        )}

        {/* Join Room Mode */}
        {viewMode === 'join' && (
          <div className="glass-panel p-8 rounded-2xl max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-6">ចូលរួមបន្ទប់រៀន</h2>
            
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">ឈ្មោះរបស់អ្នក</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="បញ្ចូលឈ្មោះរបស់អ្នក..."
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  data-testid="input-student-name"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">លេខកូដបន្ទប់</label>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="លេខកូដ..."
                  maxLength={6}
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-center font-mono text-2xl tracking-widest uppercase"
                  data-testid="input-room-code"
                />
              </div>

              <Button onClick={handleJoinRoom} className="w-full gap-2" size="lg" data-testid="button-join-room">
                <UserCheck size={18} />
                ចូលរួមបន្ទប់
              </Button>
            </div>
          </div>
        )}

        {/* Teacher Dashboard */}
        {viewMode === 'teacher-dashboard' && createdRoom && (
          <div className="space-y-6">
            {/* Room Info */}
            <div className="glass-panel p-6 rounded-2xl">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-1">លេខកូដបន្ទប់</h2>
                  <div className="flex items-center gap-3">
                    <span className="text-4xl font-mono font-black text-primary tracking-widest" data-testid="text-room-code">
                      {createdRoom.roomCode}
                    </span>
                    <Button variant="outline" size="sm" onClick={copyRoomCode} className="gap-2" data-testid="button-copy-code">
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                      {copied ? 'បានចម្លង!' : 'ចម្លង'}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground" data-testid="text-student-count">{students.length}</div>
                    <div className="text-xs text-muted-foreground">សិស្ស</div>
                  </div>
                  
                  {createdRoom.status === 'waiting' && (
                    <Button onClick={handleStartSession} className="gap-2" disabled={students.length === 0} data-testid="button-start-session">
                      <Play size={18} />
                      ចាប់ផ្ដើមមេរៀន
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Assigned Text */}
            <div className="glass-panel p-6 rounded-2xl">
              <h3 className="text-lg font-bold text-foreground mb-3">អត្ថបទដែលបានដាក់</h3>
              <div className="bg-secondary/50 rounded-xl p-4 font-khmer text-lg leading-relaxed" data-testid="text-assigned">
                {createdRoom.assignedText}
              </div>
            </div>

            {/* Students List */}
            <div className="glass-panel p-6 rounded-2xl">
              <h3 className="text-lg font-bold text-foreground mb-4">វឌ្ឍនភាពរបស់សិស្ស</h3>
              
              {students.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users size={48} className="mx-auto mb-4 opacity-50" />
                  <p>កំពុងរង់ចាំសិស្សចូលរួម...</p>
                  <p className="text-sm mt-2">ចែករំលែកលេខកូដបន្ទប់ជាមួយសិស្សរបស់អ្នក</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {students.map((student, index) => (
                    <div 
                      key={student.id} 
                      className={cn(
                        "flex items-center justify-between p-4 rounded-xl border",
                        student.finished ? "bg-green-500/10 border-green-500/30" : "bg-secondary/50 border-border"
                      )}
                      data-testid={`student-row-${index}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center font-bold",
                          student.finished ? "bg-green-500 text-white" : "bg-primary/10 text-primary"
                        )}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-bold text-foreground" data-testid={`text-student-name-${index}`}>{student.studentName}</div>
                          <div className="text-sm text-muted-foreground">
                            {student.finished ? (
                              <span className="text-green-500 font-medium">បានបញ្ចប់!</span>
                            ) : (
                              <span>វឌ្ឍនភាព: {student.progress}%</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="flex items-center gap-1 text-blue-500">
                            <Gauge size={16} />
                            <span className="font-bold" data-testid={`text-wpm-${index}`}>{student.wpm}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">WPM</div>
                        </div>

                        <div className="text-center">
                          <div className="flex items-center gap-1 text-amber-500">
                            <Target size={16} />
                            <span className="font-bold" data-testid={`text-accuracy-${index}`}>{student.accuracy}%</span>
                          </div>
                          <div className="text-xs text-muted-foreground">ភាពត្រឹមត្រូវ</div>
                        </div>

                        <div className="text-center">
                          <div className="flex items-center gap-1 text-violet-500">
                            <Clock size={16} />
                            <span className="font-bold" data-testid={`text-time-${index}`}>{formatTime(student.timeSeconds)}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">រយៈពេល</div>
                        </div>

                        {student.finished && (
                          <Trophy className="text-yellow-500" size={24} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Student Typing View */}
        {viewMode === 'student-typing' && joinedRoom && (
          <div className="space-y-6">
            {/* Status Bar */}
            <div className="glass-panel p-4 rounded-2xl">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Room:</span>
                  <span className="font-mono font-bold text-primary">{joinedRoom.roomCode}</span>
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

            {!sessionStarted ? (
              <div className="glass-panel p-12 rounded-2xl text-center">
                <div className="text-6xl mb-4 animate-pulse">⏳</div>
                <h2 className="text-2xl font-bold text-foreground mb-2">កំពុងរង់ចាំគ្រូបង្រៀន</h2>
                <p className="text-muted-foreground">គ្រូបង្រៀននឹងចាប់ផ្ដើមមេរៀនក្នុងពេលឆាប់ៗនេះ...</p>
              </div>
            ) : finished ? (
              <div className="glass-panel p-12 rounded-2xl text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold text-foreground mb-4">បានបញ្ចប់!</h2>
                <div className="flex justify-center gap-8 mb-6">
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
                    <div className="text-sm text-muted-foreground">រយៈពេល</div>
                  </div>
                </div>
                <Button onClick={() => navigate('/home')} data-testid="button-go-home">
                  ត្រឡប់ទៅទំព័រដើម
                </Button>
              </div>
            ) : (
              <>
                {/* Text to Type */}
                <div className="glass-panel p-6 rounded-2xl">
                  <h3 className="text-lg font-bold text-foreground mb-4">សូមវាយអត្ថបទខាងក្រោម៖</h3>
                  {renderText()}
                  
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      វឌ្ឍនភាព: {Math.round((currentIndex / joinedRoom.assignedText.length) * 100)}%
                    </div>
                    <div className="w-full max-w-md mx-4 bg-secondary rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-primary h-full transition-all duration-300"
                        style={{ width: `${(currentIndex / joinedRoom.assignedText.length) * 100}%` }}
                      />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {currentIndex}/{joinedRoom.assignedText.length}
                    </div>
                  </div>
                </div>

                {/* Keyboard */}
                <Keyboard 
                  activeCode={null}
                  className="mt-4"
                />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
