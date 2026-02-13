import { eq, desc, and } from "drizzle-orm";
import { db } from "./db";
import {
  players,
  typingSessions,
  multiplayerRooms,
  roomParticipants,
  playerPreferences,
  teacherRooms,
  studentResults,
  type Player,
  type InsertPlayer,
  type TypingSession,
  type InsertTypingSession,
  type MultiplayerRoom,
  type InsertMultiplayerRoom,
  type RoomParticipant,
  type InsertRoomParticipant,
  type PlayerPreferences,
  type InsertPlayerPreferences,
  type TeacherRoom,
  type InsertTeacherRoom,
  type StudentResult,
  type InsertStudentResult,
} from "@shared/schema";

export interface IStorage {
  // Players
  getPlayer(id: string): Promise<Player | undefined>;
  getPlayerByName(name: string): Promise<Player | undefined>;
  createPlayer(player: InsertPlayer): Promise<Player>;

  // Typing Sessions
  createTypingSession(session: InsertTypingSession): Promise<TypingSession>;
  getPlayerSessions(playerId: string, limit?: number): Promise<TypingSession[]>;
  getPlayerStatsByMode(playerId: string, mode: string): Promise<TypingSession[]>;

  // Multiplayer Rooms
  createRoom(room: InsertMultiplayerRoom): Promise<MultiplayerRoom>;
  getRoomByCode(roomCode: string): Promise<MultiplayerRoom | undefined>;
  getRoom(id: string): Promise<MultiplayerRoom | undefined>;
  updateRoomStatus(id: string, status: string, startedAt?: Date, completedAt?: Date): Promise<void>;
  
  // Room Participants
  addParticipant(participant: InsertRoomParticipant): Promise<RoomParticipant>;
  getRoomParticipants(roomId: string): Promise<RoomParticipant[]>;
  updateParticipantProgress(id: string, progress: number, wpm: number, accuracy: number): Promise<void>;
  finishParticipant(id: string): Promise<void>;

  // Player Preferences
  getPlayerPreferences(playerId: string): Promise<PlayerPreferences | undefined>;
  upsertPlayerPreferences(prefs: InsertPlayerPreferences): Promise<PlayerPreferences>;

  // Teacher Rooms
  createTeacherRoom(room: InsertTeacherRoom): Promise<TeacherRoom>;
  getTeacherRoomByCode(roomCode: string): Promise<TeacherRoom | undefined>;
  getTeacherRoom(id: string): Promise<TeacherRoom | undefined>;
  updateTeacherRoomStatus(id: string, status: string, startedAt?: Date, completedAt?: Date): Promise<void>;

  // Student Results
  addStudentResult(result: InsertStudentResult): Promise<StudentResult>;
  getStudentResults(roomId: string): Promise<StudentResult[]>;
  updateStudentProgress(id: string, progress: number, wpm: number, accuracy: number, timeSeconds: number): Promise<void>;
  finishStudent(id: string, wpm: number, accuracy: number, timeSeconds: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Players
  async getPlayer(id: string): Promise<Player | undefined> {
    const result = await db.select().from(players).where(eq(players.id, id)).limit(1);
    return result[0];
  }

  async getPlayerByName(name: string): Promise<Player | undefined> {
    const result = await db.select().from(players).where(eq(players.name, name)).limit(1);
    return result[0];
  }

  async createPlayer(player: InsertPlayer): Promise<Player> {
    const result = await db.insert(players).values(player).returning();
    return result[0];
  }

  // Typing Sessions
  async createTypingSession(session: InsertTypingSession): Promise<TypingSession> {
    const result = await db.insert(typingSessions).values(session).returning();
    return result[0];
  }

  async getPlayerSessions(playerId: string, limit: number = 50): Promise<TypingSession[]> {
    return db
      .select()
      .from(typingSessions)
      .where(eq(typingSessions.playerId, playerId))
      .orderBy(desc(typingSessions.completedAt))
      .limit(limit);
  }

  async getPlayerStatsByMode(playerId: string, mode: string): Promise<TypingSession[]> {
    return db
      .select()
      .from(typingSessions)
      .where(and(eq(typingSessions.playerId, playerId), eq(typingSessions.mode, mode)))
      .orderBy(desc(typingSessions.completedAt))
      .limit(20);
  }

  // Multiplayer Rooms
  async createRoom(room: InsertMultiplayerRoom): Promise<MultiplayerRoom> {
    const result = await db.insert(multiplayerRooms).values(room).returning();
    return result[0];
  }

  async getRoomByCode(roomCode: string): Promise<MultiplayerRoom | undefined> {
    const result = await db.select().from(multiplayerRooms).where(eq(multiplayerRooms.roomCode, roomCode)).limit(1);
    return result[0];
  }

  async getRoom(id: string): Promise<MultiplayerRoom | undefined> {
    const result = await db.select().from(multiplayerRooms).where(eq(multiplayerRooms.id, id)).limit(1);
    return result[0];
  }

  async updateRoomStatus(id: string, status: string, startedAt?: Date, completedAt?: Date): Promise<void> {
    const updates: any = { status };
    if (startedAt) updates.startedAt = startedAt;
    if (completedAt) updates.completedAt = completedAt;
    
    await db.update(multiplayerRooms).set(updates).where(eq(multiplayerRooms.id, id));
  }

  // Room Participants
  async addParticipant(participant: InsertRoomParticipant): Promise<RoomParticipant> {
    const result = await db.insert(roomParticipants).values(participant).returning();
    return result[0];
  }

  async getRoomParticipants(roomId: string): Promise<RoomParticipant[]> {
    return db.select().from(roomParticipants).where(eq(roomParticipants.roomId, roomId));
  }

  async updateParticipantProgress(id: string, progress: number, wpm: number, accuracy: number): Promise<void> {
    await db
      .update(roomParticipants)
      .set({ progress, wpm, accuracy })
      .where(eq(roomParticipants.id, id));
  }

  async finishParticipant(id: string): Promise<void> {
    await db
      .update(roomParticipants)
      .set({ finished: true, finishedAt: new Date() })
      .where(eq(roomParticipants.id, id));
  }

  // Player Preferences
  async getPlayerPreferences(playerId: string): Promise<PlayerPreferences | undefined> {
    const result = await db.select().from(playerPreferences).where(eq(playerPreferences.playerId, playerId)).limit(1);
    return result[0];
  }

  async upsertPlayerPreferences(prefs: InsertPlayerPreferences): Promise<PlayerPreferences> {
    const existing = await this.getPlayerPreferences(prefs.playerId);
    
    if (existing) {
      const result = await db
        .update(playerPreferences)
        .set({ ...prefs, updatedAt: new Date() })
        .where(eq(playerPreferences.playerId, prefs.playerId))
        .returning();
      return result[0];
    } else {
      const result = await db.insert(playerPreferences).values(prefs).returning();
      return result[0];
    }
  }

  // Teacher Rooms
  async createTeacherRoom(room: InsertTeacherRoom): Promise<TeacherRoom> {
    const result = await db.insert(teacherRooms).values(room).returning();
    return result[0];
  }

  async getTeacherRoomByCode(roomCode: string): Promise<TeacherRoom | undefined> {
    const result = await db.select().from(teacherRooms).where(eq(teacherRooms.roomCode, roomCode)).limit(1);
    return result[0];
  }

  async getTeacherRoom(id: string): Promise<TeacherRoom | undefined> {
    const result = await db.select().from(teacherRooms).where(eq(teacherRooms.id, id)).limit(1);
    return result[0];
  }

  async updateTeacherRoomStatus(id: string, status: string, startedAt?: Date, completedAt?: Date): Promise<void> {
    const updates: any = { status };
    if (startedAt) updates.startedAt = startedAt;
    if (completedAt) updates.completedAt = completedAt;
    
    await db.update(teacherRooms).set(updates).where(eq(teacherRooms.id, id));
  }

  // Student Results
  async addStudentResult(result: InsertStudentResult): Promise<StudentResult> {
    const res = await db.insert(studentResults).values(result).returning();
    return res[0];
  }

  async getStudentResults(roomId: string): Promise<StudentResult[]> {
    return db.select().from(studentResults).where(eq(studentResults.roomId, roomId)).orderBy(desc(studentResults.wpm));
  }

  async updateStudentProgress(id: string, progress: number, wpm: number, accuracy: number, timeSeconds: number): Promise<void> {
    await db
      .update(studentResults)
      .set({ progress, wpm, accuracy, timeSeconds })
      .where(eq(studentResults.id, id));
  }

  async finishStudent(id: string, wpm: number, accuracy: number, timeSeconds: number): Promise<void> {
    await db
      .update(studentResults)
      .set({ finished: true, finishedAt: new Date(), wpm, accuracy, timeSeconds })
      .where(eq(studentResults.id, id));
  }
}

export const storage = new DatabaseStorage();
