import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Users, Copy, Check, Play, Trophy, Target, Zap } from "lucide-react";
import { HUD } from "@/components/HUD";
import { Button } from "@/components/ui/button";
import { useGameStore } from "@/lib/store";
import { connectSocket, disconnectSocket } from "@/lib/socket";
import type { Socket } from "socket.io-client";

type Phase = "menu" | "creating" | "lobby" | "racing" | "results";

interface Participant {
  id: string;
  playerId: string;
  progress: number;
  wpm: number;
  accuracy: number;
  finished: boolean;
}

export const Multiplayer: React.FC = () => {
  const [, navigate] = useLocation();
  const { profile, difficulty } = useGameStore();
  const [phase, setPhase] = useState<Phase>("menu");
  const [roomCode, setRoomCode] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [room, setRoom] = useState<any>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [myParticipantId, setMyParticipantId] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [typedText, setTypedText] = useState("");
  const [errors, setErrors] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const s = connectSocket();
    setSocket(s);

    s.on("joined_room", ({ participant, room: joinedRoom }) => {
      setMyParticipantId(participant.id);
      setRoom(joinedRoom);
      setPhase("lobby");
    });

    s.on("room_updated", ({ room: updatedRoom, participants: updatedParticipants }) => {
      setRoom(updatedRoom);
      setParticipants(updatedParticipants);
    });

    s.on("race_started", ({ room: startedRoom }) => {
      setRoom(startedRoom);
      setPhase("racing");
      setStartTime(Date.now());
      setTimeout(() => inputRef.current?.focus(), 100);
    });

    s.on("progress_updated", ({ participants: updatedParticipants }) => {
      setParticipants(updatedParticipants);
    });

    s.on("race_completed", ({ room: completedRoom, participants: finalParticipants }) => {
      setRoom(completedRoom);
      setParticipants(finalParticipants);
      setPhase("results");
    });

    s.on("error", ({ message }) => {
      alert(message);
      setPhase("menu");
    });

    return () => {
      if (s) {
        s.emit("leave_room", { roomCode });
        s.off("joined_room");
        s.off("room_updated");
        s.off("race_started");
        s.off("progress_updated");
        s.off("race_completed");
        s.off("error");
      }
    };
  }, [roomCode]);

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const createRoom = async () => {
    const code = generateRoomCode();
    const textContent = "ភាសាខ្មែរជាភាសាមួយដែលមានប្រវត្តិសាស្ត្រយូរលង់ និងមានតួអក្សរប្លែក។ វាត្រូវបានប្រើប្រាស់ក្នុងព្រះរាជាណាចក្រកម្ពុជា និងក្នុងតំបន់ជិតខាងនានា។";

    try {
      // Find or create player in DB first
      let playerId = profile.name;
      const playerResp = await fetch("/api/players/name/" + encodeURIComponent(profile.name));
      if (playerResp.ok) {
        const p = await playerResp.json();
        playerId = p.id;
      } else {
        const createResp = await fetch("/api/players", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: profile.name }),
        });
        if (createResp.ok) {
          const p = await createResp.json();
          playerId = p.id;
        }
      }

      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomCode: code,
          hostPlayerId: playerId,
          mode: "race",
          difficulty: difficulty || "beginner",
          maxPlayers: 4,
          textContent,
        }),
      });

      if (response.ok) {
        const createdRoom = await response.json();
        setRoomCode(code);
        setRoom(createdRoom);
        
        if (socket) {
          socket.emit("join_room", {
            roomCode: code,
            playerId: playerId,
            playerName: profile.name,
          });
        }
      }
    } catch (error) {
      console.error("Error creating room:", error);
      alert("Failed to create room");
    }
  };

  const joinRoom = async () => {
    if (!inputCode.trim()) return;
    
    setRoomCode(inputCode.toUpperCase());
    
    // Find or create player in DB first
    let playerId = profile.name;
    try {
      const playerResp = await fetch("/api/players/name/" + encodeURIComponent(profile.name));
      if (playerResp.ok) {
        const p = await playerResp.json();
        playerId = p.id;
      } else {
        const createResp = await fetch("/api/players", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: profile.name }),
        });
        if (createResp.ok) {
          const p = await createResp.json();
          playerId = p.id;
        }
      }

      if (socket) {
        socket.emit("join_room", {
          roomCode: inputCode.toUpperCase(),
          playerId: playerId,
          playerName: profile.name,
        });
      }
    } catch (error) {
      console.error("Error joining room:", error);
    }
  };

  const startRace = () => {
    if (socket) {
      socket.emit("start_race", { roomCode });
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTyping = (value: string) => {
    if (!room || phase !== "racing") return;
    
    setTypedText(value);

    const targetText = room.textContent;
    const progress = value.length;
    let errorCount = 0;

    for (let i = 0; i < value.length; i++) {
      if (value[i] !== targetText[i]) {
        errorCount++;
      }
    }

    setErrors(errorCount);

    const elapsed = (Date.now() - startTime) / 1000;
    const wpm = Math.round((value.length / 5) / Math.max(elapsed / 60, 0.01));
    const accuracy = value.length > 0 ? Math.round(((value.length - errorCount) / value.length) * 100) : 100;

    if (socket && myParticipantId) {
      socket.emit("update_progress", {
        participantId: myParticipantId,
        progress,
        wpm,
        accuracy,
      });
    }

    if (value === targetText) {
      if (socket && myParticipantId) {
        socket.emit("finish_race", {
          participantId: myParticipantId,
          roomCode,
        });
      }
    }
  };

  const renderProgress = (participant: Participant) => {
    if (!room) return 0;
    return Math.round((participant.progress / room.textContent.length) * 100);
  };

  if (phase === "menu") {
    return (
      <div className="min-h-screen bg-background pb-20 pt-20">
        <HUD />
        <div className="container mx-auto px-4 max-w-2xl mt-8">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/home">
              <Button variant="ghost" size="icon" data-testid="button-back-home">
                <ArrowLeft />
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-black font-display text-foreground" data-testid="text-multiplayer-title">
                ការប្រកួតជាមួយអ្នកដទៃ / Multiplayer
              </h1>
              <p className="text-muted-foreground">Race with others in real-time</p>
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-8 border-border bg-card space-y-6">
            <Button
              onClick={createRoom}
              className="w-full h-16 text-xl font-black bg-primary hover:bg-primary/90"
              data-testid="button-create-room"
            >
              <Users className="mr-2" /> បង្កើតបន្ទប់ / Create Room
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder="លេខកូដបន្ទប់ / Room Code"
                className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-center text-2xl font-mono font-black text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 uppercase"
                data-testid="input-room-code"
                maxLength={6}
              />
              <Button
                onClick={joinRoom}
                disabled={!inputCode.trim()}
                className="w-full h-14 text-lg font-black"
                data-testid="button-join-room"
              >
                ចូលរួមបន្ទប់ / Join Room
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "lobby") {
    return (
      <div className="min-h-screen bg-background pb-20 pt-20">
        <HUD />
        <div className="container mx-auto px-4 max-w-4xl mt-8">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" onClick={() => {
              if (socket) socket.emit("leave_room", { roomCode });
              setPhase("menu");
            }}>
              <ArrowLeft />
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-black font-display text-foreground">Waiting Room</h1>
              <p className="text-muted-foreground">Waiting for players...</p>
            </div>
            <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-2xl px-4 py-2">
              <span className="text-sm font-black text-primary">Room:</span>
              <span className="text-2xl font-mono font-black text-primary" data-testid="text-room-code">{roomCode}</span>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={copyCode}>
                {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
              </Button>
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-8 border-border bg-card mb-6">
            <h2 className="text-xl font-black mb-4">Players ({participants.length}/{room?.maxPlayers || 4})</h2>
            <div className="space-y-3">
              {participants.map((p, idx) => (
                <div key={p.id} className="flex items-center gap-3 bg-secondary/50 rounded-xl p-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl font-black text-primary">
                    {idx + 1}
                  </div>
                  <span className="font-bold text-foreground">Player {idx + 1}</span>
                  {p.id === myParticipantId && (
                    <span className="ml-auto bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-black">YOU</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {room?.hostPlayerId === profile.name && (
            <Button
              onClick={startRace}
              disabled={participants.length < 1}
              className="w-full h-16 text-xl font-black bg-emerald-600 hover:bg-emerald-500"
              data-testid="button-start-race"
            >
              <Play className="mr-2" fill="currentColor" /> ចាប់ផ្តើមប្រកួត / Start Race
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (phase === "racing") {
    const me = participants.find(p => p.id === myParticipantId);
    const targetText = room?.textContent || "";

    return (
      <div className="min-h-screen bg-background pb-20 pt-20">
        <HUD />
        <div className="container mx-auto px-4 max-w-6xl mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="glass-panel rounded-3xl p-8 border-border bg-card">
                <div className="text-2xl font-khmer leading-relaxed mb-6 text-foreground/80">
                  {targetText.split("").map((char: string, idx: number) => {
                    const typed = typedText[idx];
                    const isTyped = idx < typedText.length;
                    const isCorrect = typed === char;
                    const isCurrent = idx === typedText.length;

                    return (
                      <span
                        key={idx}
                        className={`${isTyped ? (isCorrect ? "text-emerald-600" : "text-red-600 underline") : "text-foreground/40"} ${isCurrent ? "bg-primary/20" : ""}`}
                      >
                        {char}
                      </span>
                    );
                  })}
                </div>

                <input
                  ref={inputRef}
                  value={typedText}
                  onChange={(e) => handleTyping(e.target.value)}
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-xl font-khmer text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Start typing..."
                  data-testid="input-race-typing"
                  autoFocus
                />

                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div className="bg-muted/30 rounded-xl p-4">
                    <div className="text-xs font-black uppercase text-muted-foreground">WPM</div>
                    <div className="text-3xl font-mono font-black text-foreground">{me?.wpm || 0}</div>
                  </div>
                  <div className="bg-muted/30 rounded-xl p-4">
                    <div className="text-xs font-black uppercase text-muted-foreground">Accuracy</div>
                    <div className="text-3xl font-mono font-black text-foreground">{me?.accuracy || 100}%</div>
                  </div>
                  <div className="bg-muted/30 rounded-xl p-4">
                    <div className="text-xs font-black uppercase text-muted-foreground">Errors</div>
                    <div className="text-3xl font-mono font-black text-red-600">{errors}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-panel rounded-3xl p-8 border-border bg-card">
              <h2 className="text-xl font-black mb-4 flex items-center gap-2">
                <Trophy size={20} className="text-amber-500" /> Live Rankings
              </h2>
              <div className="space-y-3">
                {[...participants].sort((a, b) => b.progress - a.progress).map((p, idx) => (
                  <div key={p.id} className={`rounded-xl p-4 ${p.id === myParticipantId ? "bg-primary/10 border-2 border-primary" : "bg-secondary/50"}`}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${idx === 0 ? "bg-amber-500 text-white" : "bg-muted text-foreground"}`}>
                        {idx + 1}
                      </div>
                      <span className="font-bold text-sm">Player {participants.indexOf(p) + 1}</span>
                      {p.finished && <span className="ml-auto text-xs font-black text-emerald-600">✓ DONE</span>}
                    </div>
                    <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-primary to-emerald-500 h-full transition-all duration-300"
                        style={{ width: `${renderProgress(p)}%` }}
                      />
                    </div>
                    <div className="mt-2 flex gap-3 text-xs text-muted-foreground">
                      <span><Zap size={12} className="inline" /> {p.wpm} WPM</span>
                      <span><Target size={12} className="inline" /> {p.accuracy}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "results") {
    const sortedParticipants = [...participants].sort((a, b) => {
      if (a.finished && !b.finished) return -1;
      if (!a.finished && b.finished) return 1;
      return b.progress - a.progress;
    });

    return (
      <div className="min-h-screen bg-background pb-20 pt-20">
        <HUD />
        <div className="container mx-auto px-4 max-w-4xl mt-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🏆</div>
            <h1 className="text-4xl font-black font-display text-foreground mb-2">Race Complete!</h1>
            <p className="text-muted-foreground">Great job everyone!</p>
          </div>

          <div className="glass-panel rounded-3xl p-8 border-border bg-card space-y-4">
            {sortedParticipants.map((p, idx) => (
              <div key={p.id} className={`rounded-2xl p-6 ${p.id === myParticipantId ? "bg-primary/10 border-2 border-primary" : "bg-secondary/30"}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center font-black text-2xl ${idx === 0 ? "bg-amber-500 text-white" : idx === 1 ? "bg-slate-400 text-white" : idx === 2 ? "bg-amber-700 text-white" : "bg-muted text-foreground"}`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-black text-lg">Player {participants.indexOf(p) + 1}</div>
                    <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                      <span>{p.wpm} WPM</span>
                      <span>{p.accuracy}% accuracy</span>
                      <span>{renderProgress(p)}% complete</span>
                    </div>
                  </div>
                  {p.id === myParticipantId && (
                    <span className="bg-primary text-primary-foreground px-4 py-2 rounded-full font-black">YOU</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex gap-4">
            <Button onClick={() => setPhase("menu")} className="flex-1 h-14 text-lg font-black" data-testid="button-new-race">
              New Race
            </Button>
            <Link href="/home" className="flex-1">
              <Button variant="outline" className="w-full h-14 text-lg font-black">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
