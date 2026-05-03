import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Copy, Play, Plus, RotateCcw, Target, Trophy, Users, Zap } from "lucide-react";
import { child, get, onValue, ref, remove, set, update } from "firebase/database";

import { HUD } from "@/components/HUD";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { realtimeDb, isFirebaseRealtimeReady } from "@/lib/firebase";
import { useGameStore } from "@/lib/store";

type Phase = "menu" | "lobby" | "racing" | "results";
type RoomStatus = "waiting" | "racing" | "finished";

interface Racer {
  id: string;
  name: string;
  progress: number;
  wpm: number;
  accuracy: number;
  finished: boolean;
}

interface RoomPlayer extends Racer {
  joinedAt: number;
}

interface MatchRoom {
  code: string;
  hostId: string;
  status: RoomStatus;
  raceText: string;
  startedAt?: number;
  createdAt: number;
  players?: Record<string, RoomPlayer>;
}

const RACE_TEXT =
  "ការប្រកួតវាយអក្សរខ្មែរ ជួយឱ្យអ្នករៀនបង្កើនល្បឿន ភាពត្រឹមត្រូវ និងទំនុកចិត្ត។";

const makePlayerId = () => {
  const saved = window.localStorage.getItem("khmer-typing-player-id");
  if (saved) return saved;
  const next = `player-${Math.random().toString(36).slice(2, 10)}`;
  window.localStorage.setItem("khmer-typing-player-id", next);
  return next;
};

const makeRoomCode = () => Math.random().toString(36).slice(2, 8).toUpperCase();

const getRoomRef = (roomCode: string) => {
  if (!realtimeDb) throw new Error("Firebase Realtime Database is not configured.");
  return ref(realtimeDb, `matchRooms/${roomCode}`);
};

export const Multiplayer: React.FC = () => {
  const { profile } = useGameStore();
  const [phase, setPhase] = useState<Phase>("menu");
  const [mode, setMode] = useState<"local" | "room">("local");
  const [typedText, setTypedText] = useState("");
  const [errors, setErrors] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [roomCode, setRoomCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [statusText, setStatusText] = useState("");
  const [room, setRoom] = useState<MatchRoom | null>(null);
  const [playerId] = useState(makePlayerId);
  const inputRef = useRef<HTMLInputElement>(null);
  const [racers, setRacers] = useState<Racer[]>([]);

  const playerName = profile.name || "អ្នក";
  const myRacer = racers.find((racer) => racer.id === (mode === "room" ? playerId : "you"));
  const sortedRacers = useMemo(
    () => [...racers].sort((a, b) => b.progress - a.progress || b.wpm - a.wpm),
    [racers],
  );
  const activeRaceText = room?.raceText || RACE_TEXT;
  const isHost = Boolean(room && room.hostId === playerId);

  useEffect(() => {
    if (!roomCode || !realtimeDb) return;
    const unsubscribe = onValue(getRoomRef(roomCode), (snapshot) => {
      const nextRoom = snapshot.val() as MatchRoom | null;
      setRoom(nextRoom);

      if (!nextRoom) {
        setStatusText("បន្ទប់នេះមិនមានទៀតទេ។");
        setPhase("menu");
        setRoomCode("");
        setRacers([]);
        return;
      }

      const players = Object.values(nextRoom.players || {});
      setRacers(players);

      if (nextRoom.status === "waiting") setPhase("lobby");
      if (nextRoom.status === "racing") {
        setPhase("racing");
        setStartTime(nextRoom.startedAt || Date.now());
        setTimeout(() => inputRef.current?.focus(), 100);
      }
      if (nextRoom.status === "finished") setPhase("results");
    });

    return () => unsubscribe();
  }, [roomCode]);

  useEffect(() => {
    if (phase === "racing") {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [phase]);

  useEffect(() => {
    if (mode !== "local" || phase !== "racing" || !startTime) return;

    const interval = window.setInterval(() => {
      const elapsed = Math.max((Date.now() - startTime) / 1000, 1);
      setRacers((current) =>
        current.map((racer) => {
          if (racer.id === "you" || racer.finished) return racer;
          const speed = racer.id === "bot-1" ? 4.8 : racer.id === "bot-2" ? 4.1 : 3.5;
          const progress = Math.min(RACE_TEXT.length, Math.round(elapsed * speed));
          return {
            ...racer,
            progress,
            wpm: Math.round((progress / 5 / elapsed) * 60),
            finished: progress >= RACE_TEXT.length,
          };
        }),
      );
    }, 400);

    return () => window.clearInterval(interval);
  }, [mode, phase, startTime]);

  useEffect(() => {
    if (mode === "local" && phase === "racing" && racers.length > 0 && racers.every((racer) => racer.finished)) {
      setPhase("results");
    }
  }, [mode, phase, racers]);

  const createRoom = async () => {
    setStatusText("");
    if (!isFirebaseRealtimeReady || !realtimeDb) {
      setStatusText("សូមកំណត់ VITE_FIREBASE_DATABASE_URL សិន ដើម្បីប្រើបន្ទប់ប្រកួត។");
      return;
    }

    let code = makeRoomCode();
    let roomSnapshot = await get(child(ref(realtimeDb), `matchRooms/${code}`));
    while (roomSnapshot.exists()) {
      code = makeRoomCode();
      roomSnapshot = await get(child(ref(realtimeDb), `matchRooms/${code}`));
    }

    const nextRoom: MatchRoom = {
      code,
      hostId: playerId,
      status: "waiting",
      raceText: RACE_TEXT,
      createdAt: Date.now(),
      players: {
        [playerId]: {
          id: playerId,
          name: playerName,
          progress: 0,
          wpm: 0,
          accuracy: 100,
          finished: false,
          joinedAt: Date.now(),
        },
      },
    };

    await set(getRoomRef(code), nextRoom);
    setMode("room");
    setRoomCode(code);
    setTypedText("");
    setErrors(0);
    setPhase("lobby");
  };

  const joinRoom = async () => {
    setStatusText("");
    if (!isFirebaseRealtimeReady || !realtimeDb) {
      setStatusText("សូមកំណត់ VITE_FIREBASE_DATABASE_URL សិន ដើម្បីប្រើបន្ទប់ប្រកួត។");
      return;
    }

    const code = joinCode.trim().toUpperCase();
    if (!code) {
      setStatusText("សូមបញ្ចូលលេខកូដបន្ទប់។");
      return;
    }

    const snapshot = await get(getRoomRef(code));
    const existingRoom = snapshot.val() as MatchRoom | null;
    if (!existingRoom) {
      setStatusText("រកមិនឃើញបន្ទប់នេះទេ។");
      return;
    }
    if (existingRoom.status !== "waiting") {
      setStatusText("បន្ទប់នេះបានចាប់ផ្តើមរួចហើយ។");
      return;
    }

    await update(getRoomRef(code), {
      [`players/${playerId}`]: {
        id: playerId,
        name: playerName,
        progress: 0,
        wpm: 0,
        accuracy: 100,
        finished: false,
        joinedAt: Date.now(),
      },
    });

    setMode("room");
    setRoomCode(code);
    setTypedText("");
    setErrors(0);
    setPhase("lobby");
  };

  const startLocalRace = () => {
    setMode("local");
    setTypedText("");
    setErrors(0);
    setStartTime(Date.now());
    setRacers([
      { id: "you", name: playerName, progress: 0, wpm: 0, accuracy: 100, finished: false },
      { id: "bot-1", name: "នីតា", progress: 0, wpm: 0, accuracy: 97, finished: false },
      { id: "bot-2", name: "ដារ៉ា", progress: 0, wpm: 0, accuracy: 94, finished: false },
      { id: "bot-3", name: "សុខា", progress: 0, wpm: 0, accuracy: 91, finished: false },
    ]);
    setPhase("racing");
  };

  const startRoomRace = async () => {
    if (!roomCode) return;
    setTypedText("");
    setErrors(0);
    await update(getRoomRef(roomCode), {
      status: "racing",
      startedAt: Date.now(),
    });
  };

  const leaveRoom = async () => {
    if (roomCode && realtimeDb) {
      const roomRef = getRoomRef(roomCode);
      if (isHost) {
        await remove(roomRef);
      } else {
        await remove(child(roomRef, `players/${playerId}`));
      }
    }
    setMode("local");
    setRoom(null);
    setRoomCode("");
    setJoinCode("");
    setRacers([]);
    setTypedText("");
    setErrors(0);
    setPhase("menu");
  };

  const restartRoom = async () => {
    if (!roomCode || !room) return;
    const resetPlayers = Object.fromEntries(
      Object.values(room.players || {}).map((player) => [
        player.id,
        { ...player, progress: 0, wpm: 0, accuracy: 100, finished: false },
      ]),
    );
    await update(getRoomRef(roomCode), {
      status: "waiting",
      startedAt: null,
      players: resetPlayers,
    });
    setTypedText("");
    setErrors(0);
  };

  const handleTyping = (value: string) => {
    if (phase !== "racing") return;

    const nextValue = value.slice(0, activeRaceText.length);
    let nextErrors = 0;
    for (let i = 0; i < nextValue.length; i++) {
      if (nextValue[i] !== activeRaceText[i]) nextErrors++;
    }

    const elapsed = Math.max((Date.now() - startTime) / 1000, 1);
    const accuracy =
      nextValue.length > 0
        ? Math.max(0, Math.round(((nextValue.length - nextErrors) / nextValue.length) * 100))
        : 100;
    const wpm = Math.round((nextValue.length / 5 / elapsed) * 60);
    const finished = nextValue.length >= activeRaceText.length;

    setTypedText(nextValue);
    setErrors(nextErrors);

    if (mode === "room" && roomCode && realtimeDb) {
      const nextPlayer = {
        id: playerId,
        name: playerName,
        progress: nextValue.length,
        wpm,
        accuracy,
        finished,
        joinedAt: room?.players?.[playerId]?.joinedAt || Date.now(),
      };
      update(getRoomRef(roomCode), {
        [`players/${playerId}`]: nextPlayer,
      });

      const nextPlayers = Object.values({ ...(room?.players || {}), [playerId]: nextPlayer });
      if (finished && nextPlayers.length > 0 && nextPlayers.every((player) => player.finished)) {
        update(getRoomRef(roomCode), { status: "finished" });
      }
      return;
    }

    setRacers((current) =>
      current.map((racer) =>
        racer.id === "you"
          ? {
              ...racer,
              progress: nextValue.length,
              wpm,
              accuracy,
              finished,
            }
          : racer,
      ),
    );
  };

  const copyRoomCode = async () => {
    if (!roomCode) return;
    await navigator.clipboard?.writeText(roomCode);
    setStatusText("បានចម្លងលេខកូដបន្ទប់។");
  };

  const renderProgress = (racer: Racer) => Math.round((racer.progress / activeRaceText.length) * 100);

  return (
    <div className="min-h-screen bg-background pb-20 pt-20">
      <HUD />
      <div className="container mx-auto px-4 max-w-6xl mt-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/home">
            <Button variant="ghost" size="icon" data-testid="button-back-home">
              <ArrowLeft />
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-black font-display text-foreground" data-testid="text-multiplayer-title">
              ការប្រកួតគ្នា
            </h1>
            <p className="text-muted-foreground">
              បង្កើតបន្ទប់ ឬចូលរួមជាមួយដៃគូ ដើម្បីប្រកួតវាយអក្សរខ្មែរផ្ទាល់។
            </p>
          </div>
        </div>

        {phase === "menu" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-panel rounded-3xl p-8 border-border bg-card">
              <Users className="mb-4 text-primary" size={48} />
              <h2 className="text-2xl font-black text-foreground mb-3">ប្រកួតជាមួយដៃគូ</h2>
              <p className="text-muted-foreground mb-6">
                ម្ចាស់បន្ទប់បង្កើតលេខកូដ ហើយផ្ញើឱ្យដៃគូ។ ពេលទាំងពីរចូលរួមរួច ម្ចាស់បន្ទប់អាចចាប់ផ្តើមបាន។
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={createRoom} className="h-12 font-black" data-testid="button-create-room">
                  <Plus className="mr-2" /> បង្កើតបន្ទប់
                </Button>
                <div className="flex flex-1 gap-2">
                  <Input
                    value={joinCode}
                    onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
                    placeholder="លេខកូដបន្ទប់"
                    className="h-12 font-mono uppercase"
                    data-testid="input-room-code"
                  />
                  <Button onClick={joinRoom} variant="secondary" className="h-12 font-black" data-testid="button-join-room">
                    ចូលរួម
                  </Button>
                </div>
              </div>
              {statusText && <p className="mt-4 text-sm font-bold text-primary">{statusText}</p>}
            </div>

            <div className="glass-panel rounded-3xl p-8 border-border bg-card">
              <Trophy className="mb-4 text-amber-500" size={48} />
              <h2 className="text-2xl font-black text-foreground mb-3">ហាត់ជាមួយកុំព្យូទ័រ</h2>
              <p className="text-muted-foreground mb-6">
                ប្រើរបៀបនេះនៅពេលចង់ហាត់ម្នាក់ឯង ដោយប្រកួតជាមួយអ្នកលេងកុំព្យូទ័រ។
              </p>
              <Button onClick={startLocalRace} className="h-12 px-8 font-black" data-testid="button-start-local-race">
                <Play className="mr-2" fill="currentColor" /> ចាប់ផ្តើមប្រកួត
              </Button>
            </div>
          </div>
        )}

        {phase === "lobby" && room && (
          <div className="glass-panel rounded-3xl p-8 border-border bg-card max-w-3xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <div className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">លេខកូដបន្ទប់</div>
                <div className="text-5xl font-mono font-black text-primary" data-testid="text-room-code">{roomCode}</div>
              </div>
              <Button onClick={copyRoomCode} variant="secondary" className="h-12 font-black">
                <Copy className="mr-2" /> ចម្លងកូដ
              </Button>
            </div>

            <h2 className="text-xl font-black mb-4">អ្នកចូលរួម</h2>
            <div className="space-y-3 mb-8">
              {sortedRacers.map((racer) => (
                <div key={racer.id} className="rounded-xl bg-secondary/50 p-4 flex items-center justify-between">
                  <span className="font-bold">{racer.name}</span>
                  <span className="text-xs font-black text-muted-foreground">
                    {racer.id === room.hostId ? "ម្ចាស់បន្ទប់" : "ដៃគូ"}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {isHost ? (
                <Button onClick={startRoomRace} className="h-14 flex-1 text-lg font-black" disabled={sortedRacers.length < 2}>
                  <Play className="mr-2" fill="currentColor" /> ចាប់ផ្តើមប្រកួត
                </Button>
              ) : (
                <div className="h-14 flex-1 rounded-xl bg-muted/40 flex items-center justify-center px-4 text-center font-bold text-muted-foreground">
                  រង់ចាំម្ចាស់បន្ទប់ចាប់ផ្តើម...
                </div>
              )}
              <Button onClick={leaveRoom} variant="outline" className="h-14 font-black">
                ចាកចេញ
              </Button>
            </div>
            {sortedRacers.length < 2 && isHost && (
              <p className="mt-4 text-sm text-muted-foreground">ផ្ញើលេខកូដនេះឱ្យដៃគូ ដើម្បីឱ្យគេចូលរួម។</p>
            )}
          </div>
        )}

        {phase === "racing" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass-panel rounded-3xl p-8 border-border bg-card">
              <div className="text-2xl leading-relaxed mb-6 text-foreground/80">
                {activeRaceText.split("").map((char, index) => {
                  const typed = typedText[index];
                  const isTyped = index < typedText.length;
                  const isCorrect = typed === char;
                  const isCurrent = index === typedText.length;

                  return (
                    <span
                      key={`${char}-${index}`}
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
                onChange={(event) => handleTyping(event.target.value)}
                className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="ចាប់ផ្តើមវាយអក្សរ..."
                data-testid="input-race-typing"
                autoFocus
              />

              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="bg-muted/30 rounded-xl p-4">
                  <div className="text-xs font-black uppercase text-muted-foreground">ពាក្យ/នាទី</div>
                  <div className="text-3xl font-mono font-black text-foreground">{myRacer?.wpm || 0}</div>
                </div>
                <div className="bg-muted/30 rounded-xl p-4">
                  <div className="text-xs font-black uppercase text-muted-foreground">ភាពត្រឹមត្រូវ</div>
                  <div className="text-3xl font-mono font-black text-foreground">{myRacer?.accuracy || 100}%</div>
                </div>
                <div className="bg-muted/30 rounded-xl p-4">
                  <div className="text-xs font-black uppercase text-muted-foreground">កំហុស</div>
                  <div className="text-3xl font-mono font-black text-red-600">{errors}</div>
                </div>
              </div>
            </div>

            <div className="glass-panel rounded-3xl p-8 border-border bg-card">
              <h2 className="text-xl font-black mb-4 flex items-center gap-2">
                <Trophy size={20} className="text-amber-500" /> ចំណាត់ថ្នាក់ផ្ទាល់
              </h2>
              <div className="space-y-3">
                {sortedRacers.map((racer, index) => (
                  <div key={racer.id} className={`rounded-xl p-4 ${racer.id === (mode === "room" ? playerId : "you") ? "bg-primary/10 border-2 border-primary" : "bg-secondary/50"}`}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${index === 0 ? "bg-amber-500 text-white" : "bg-muted text-foreground"}`}>
                        {index + 1}
                      </div>
                      <span className="font-bold text-sm">{racer.name}</span>
                      {racer.finished && <span className="ml-auto text-xs font-black text-emerald-600">រួចរាល់</span>}
                    </div>
                    <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-primary to-emerald-500 h-full transition-all duration-300"
                        style={{ width: `${renderProgress(racer)}%` }}
                      />
                    </div>
                    <div className="mt-2 flex gap-3 text-xs text-muted-foreground">
                      <span><Zap size={12} className="inline" /> {racer.wpm} ពាក្យ/នាទី</span>
                      <span><Target size={12} className="inline" /> {racer.accuracy}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {phase === "results" && (
          <div className="glass-panel rounded-3xl p-8 border-border bg-card max-w-3xl mx-auto">
            <h2 className="text-3xl font-black text-foreground mb-6 text-center">ការប្រកួតបានបញ្ចប់</h2>
            <div className="space-y-4">
              {sortedRacers.map((racer, index) => (
                <div key={racer.id} className={`rounded-2xl p-5 flex items-center gap-4 ${racer.id === (mode === "room" ? playerId : "you") ? "bg-primary/10 border-2 border-primary" : "bg-secondary/40"}`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xl ${index === 0 ? "bg-amber-500 text-white" : "bg-muted text-foreground"}`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-black text-lg">{racer.name}</div>
                    <div className="text-sm text-muted-foreground">{racer.wpm} ពាក្យ/នាទី · ភាពត្រឹមត្រូវ {racer.accuracy}% · បានបញ្ចប់ {renderProgress(racer)}%</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              {mode === "room" && room ? (
                <>
                  {isHost && (
                    <Button onClick={restartRoom} className="flex-1 h-14 text-lg font-black" data-testid="button-new-race">
                      <RotateCcw className="mr-2" /> ប្រកួតម្តងទៀត
                    </Button>
                  )}
                  <Button onClick={leaveRoom} variant="outline" className="flex-1 h-14 text-lg font-black">
                    ចាកចេញពីបន្ទប់
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={startLocalRace} className="flex-1 h-14 text-lg font-black" data-testid="button-new-race">
                    <RotateCcw className="mr-2" /> ប្រកួតម្តងទៀត
                  </Button>
                  <Link href="/home" className="flex-1">
                    <Button variant="outline" className="w-full h-14 text-lg font-black">
                      ត្រឡប់ទៅទំព័រដើម
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
