import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Players table (persistent accounts)
export const players = pgTable("players", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPlayerSchema = createInsertSchema(players).omit({ id: true, createdAt: true });
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Player = typeof players.$inferSelect;

// Typing sessions table (every session recorded)
export const typingSessions = pgTable("typing_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  playerId: varchar("player_id").references(() => players.id).notNull(),
  mode: text("mode").notNull(), // "platform", "runner", "defender", "timed", "free", "accuracy", "challenge"
  difficulty: text("difficulty").notNull(), // "beginner", "intermediate", "expert"
  wpm: integer("wpm").notNull(),
  accuracy: integer("accuracy").notNull(),
  errors: integer("errors").notNull(),
  stars: integer("stars").notNull(),
  duration: integer("duration").notNull(), // seconds
  worldId: text("world_id"),
  stageId: text("stage_id"),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

export const insertTypingSessionSchema = createInsertSchema(typingSessions).omit({ id: true, completedAt: true });
export type InsertTypingSession = z.infer<typeof insertTypingSessionSchema>;
export type TypingSession = typeof typingSessions.$inferSelect;

// Multiplayer rooms
export const multiplayerRooms = pgTable("multiplayer_rooms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roomCode: text("room_code").notNull().unique(),
  hostPlayerId: varchar("host_player_id").references(() => players.id).notNull(),
  mode: text("mode").notNull(), // "race", "coop"
  difficulty: text("difficulty").notNull(),
  maxPlayers: integer("max_players").notNull().default(4),
  status: text("status").notNull().default("waiting"), // "waiting", "active", "completed"
  textContent: text("text_content").notNull(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMultiplayerRoomSchema = createInsertSchema(multiplayerRooms).omit({ 
  id: true, 
  createdAt: true,
  startedAt: true,
  completedAt: true 
});
export type InsertMultiplayerRoom = z.infer<typeof insertMultiplayerRoomSchema>;
export type MultiplayerRoom = typeof multiplayerRooms.$inferSelect;

// Room participants
export const roomParticipants = pgTable("room_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roomId: varchar("room_id").references(() => multiplayerRooms.id).notNull(),
  playerId: varchar("player_id").references(() => players.id).notNull(),
  progress: integer("progress").notNull().default(0), // characters typed
  wpm: integer("wpm").notNull().default(0),
  accuracy: integer("accuracy").notNull().default(100),
  finished: boolean("finished").notNull().default(false),
  finishedAt: timestamp("finished_at"),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const insertRoomParticipantSchema = createInsertSchema(roomParticipants).omit({ 
  id: true, 
  joinedAt: true,
  finishedAt: true 
});
export type InsertRoomParticipant = z.infer<typeof insertRoomParticipantSchema>;
export type RoomParticipant = typeof roomParticipants.$inferSelect;

// Player preferences (themes, settings)
export const playerPreferences = pgTable("player_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  playerId: varchar("player_id").references(() => players.id).notNull().unique(),
  theme: text("theme").notNull().default("angkor-classic"), // "angkor-classic", "night-temple", "krama-red", etc.
  fontStyle: text("font_style").notNull().default("battambang"), // font preference
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPlayerPreferencesSchema = createInsertSchema(playerPreferences).omit({ 
  id: true, 
  updatedAt: true 
});
export type InsertPlayerPreferences = z.infer<typeof insertPlayerPreferencesSchema>;
export type PlayerPreferences = typeof playerPreferences.$inferSelect;
