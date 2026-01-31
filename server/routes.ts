import type { Express } from "express";
import { createServer, type Server } from "http";
import { Server as SocketIOServer } from "socket.io";
import { storage } from "./storage";
import {
  insertPlayerSchema,
  insertTypingSessionSchema,
  insertMultiplayerRoomSchema,
  insertRoomParticipantSchema,
  insertPlayerPreferencesSchema,
} from "@shared/schema";
import { z } from "zod";

// WebSocket state management
interface RoomState {
  roomId: string;
  participants: Map<string, { participantId: string; playerId: string; name: string; socketId: string }>;
}

const activeRooms = new Map<string, RoomState>();

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Initialize Socket.IO
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Socket.IO handlers
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("join_room", async ({ roomCode, playerId, playerName }) => {
      try {
        const room = await storage.getRoomByCode(roomCode);
        if (!room) {
          socket.emit("error", { message: "Room not found" });
          return;
        }

        if (room.status !== "waiting") {
          socket.emit("error", { message: "Room already started" });
          return;
        }

        // Add participant to database
        const participant = await storage.addParticipant({
          roomId: room.id,
          playerId,
          progress: 0,
          wpm: 0,
          accuracy: 100,
          finished: false,
        });

        // Join socket room
        socket.join(roomCode);

        // Update room state
        if (!activeRooms.has(roomCode)) {
          activeRooms.set(roomCode, {
            roomId: room.id,
            participants: new Map(),
          });
        }

        const roomState = activeRooms.get(roomCode)!;
        roomState.participants.set(socket.id, {
          participantId: participant.id,
          playerId,
          name: playerName,
          socketId: socket.id,
        });

        // Get all participants
        const allParticipants = await storage.getRoomParticipants(room.id);

        // Notify everyone
        io.to(roomCode).emit("room_updated", {
          room,
          participants: allParticipants,
        });

        socket.emit("joined_room", { participant, room });
      } catch (error) {
        console.error("Error joining room:", error);
        socket.emit("error", { message: "Failed to join room" });
      }
    });

    socket.on("start_race", async ({ roomCode }) => {
      try {
        const room = await storage.getRoomByCode(roomCode);
        if (!room) return;

        await storage.updateRoomStatus(room.id, "active", new Date());
        const updatedRoom = await storage.getRoom(room.id);

        io.to(roomCode).emit("race_started", { room: updatedRoom });
      } catch (error) {
        console.error("Error starting race:", error);
      }
    });

    socket.on("update_progress", async ({ participantId, progress, wpm, accuracy }) => {
      try {
        await storage.updateParticipantProgress(participantId, progress, wpm, accuracy);

        // Find the room this participant is in
        for (const [roomCode, roomState] of activeRooms.entries()) {
          const participant = Array.from(roomState.participants.values()).find(
            p => p.participantId === participantId
          );
          
          if (participant) {
            const allParticipants = await storage.getRoomParticipants(roomState.roomId);
            io.to(roomCode).emit("progress_updated", {
              participants: allParticipants,
            });
            break;
          }
        }
      } catch (error) {
        console.error("Error updating progress:", error);
      }
    });

    socket.on("finish_race", async ({ participantId, roomCode }) => {
      try {
        await storage.finishParticipant(participantId);

        const room = await storage.getRoomByCode(roomCode);
        if (!room) return;

        const allParticipants = await storage.getRoomParticipants(room.id);
        const allFinished = allParticipants.every(p => p.finished);

        if (allFinished) {
          await storage.updateRoomStatus(room.id, "completed", undefined, new Date());
          const updatedRoom = await storage.getRoom(room.id);
          
          io.to(roomCode).emit("race_completed", {
            room: updatedRoom,
            participants: allParticipants,
          });
        } else {
          io.to(roomCode).emit("progress_updated", {
            participants: allParticipants,
          });
        }
      } catch (error) {
        console.error("Error finishing race:", error);
      }
    });

    socket.on("leave_room", ({ roomCode }) => {
      socket.leave(roomCode);
      
      const roomState = activeRooms.get(roomCode);
      if (roomState) {
        roomState.participants.delete(socket.id);
        if (roomState.participants.size === 0) {
          activeRooms.delete(roomCode);
        }
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
      
      // Clean up room state
      for (const [roomCode, roomState] of activeRooms.entries()) {
        if (roomState.participants.has(socket.id)) {
          roomState.participants.delete(socket.id);
          if (roomState.participants.size === 0) {
            activeRooms.delete(roomCode);
          }
        }
      }
    });
  });

  // REST API Routes

  // Players
  app.post("/api/players", async (req, res) => {
    try {
      const data = insertPlayerSchema.parse(req.body);
      const player = await storage.createPlayer(data);
      res.json(player);
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  app.get("/api/players/:id", async (req, res) => {
    const player = await storage.getPlayer(req.params.id);
    if (!player) {
      res.status(404).json({ error: "Player not found" });
      return;
    }
    res.json(player);
  });

  // Typing Sessions
  app.post("/api/sessions", async (req, res) => {
    try {
      const data = insertTypingSessionSchema.parse(req.body);
      const session = await storage.createTypingSession(data);
      res.json(session);
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  app.get("/api/sessions/player/:playerId", async (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const sessions = await storage.getPlayerSessions(req.params.playerId, limit);
    res.json(sessions);
  });

  app.get("/api/sessions/player/:playerId/mode/:mode", async (req, res) => {
    const sessions = await storage.getPlayerStatsByMode(req.params.playerId, req.params.mode);
    res.json(sessions);
  });

  // Multiplayer Rooms
  app.post("/api/rooms", async (req, res) => {
    try {
      const data = insertMultiplayerRoomSchema.parse(req.body);
      const room = await storage.createRoom(data);
      res.json(room);
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  app.get("/api/rooms/code/:roomCode", async (req, res) => {
    const room = await storage.getRoomByCode(req.params.roomCode);
    if (!room) {
      res.status(404).json({ error: "Room not found" });
      return;
    }
    res.json(room);
  });

  app.get("/api/rooms/:id/participants", async (req, res) => {
    const participants = await storage.getRoomParticipants(req.params.id);
    res.json(participants);
  });

  // Player Preferences
  app.get("/api/preferences/:playerId", async (req, res) => {
    const prefs = await storage.getPlayerPreferences(req.params.playerId);
    if (!prefs) {
      res.status(404).json({ error: "Preferences not found" });
      return;
    }
    res.json(prefs);
  });

  app.post("/api/preferences", async (req, res) => {
    try {
      const data = insertPlayerPreferencesSchema.parse(req.body);
      const prefs = await storage.upsertPlayerPreferences(data);
      res.json(prefs);
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  return httpServer;
}
