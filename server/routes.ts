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
  insertTeacherRoomSchema,
  insertStudentResultSchema,
} from "@shared/schema";
import { z } from "zod";

// WebSocket state management
interface RoomState {
  roomId: string;
  participants: Map<string, { participantId: string; playerId: string; name: string; socketId: string }>;
}

interface TeacherRoomState {
  roomId: string;
  students: Map<string, { studentId: string; name: string; socketId: string }>;
}

const activeRooms = new Map<string, RoomState>();
const activeTeacherRooms = new Map<string, TeacherRoomState>();

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
        for (const [roomCode, roomState] of Array.from(activeRooms.entries())) {
          const participant = Array.from(roomState.participants.values()).find(
            (p) => p.participantId === participantId
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

    // Teacher Mode Socket Events
    socket.on("teacher_join_room", async ({ roomCode }) => {
      try {
        const room = await storage.getTeacherRoomByCode(roomCode);
        if (!room) {
          socket.emit("error", { message: "Room not found" });
          return;
        }

        socket.join(`teacher_${roomCode}`);
        
        const students = await storage.getStudentResults(room.id);
        socket.emit("teacher_room_joined", { room, students });
      } catch (error) {
        console.error("Error teacher joining room:", error);
        socket.emit("error", { message: "Failed to join room" });
      }
    });

    socket.on("student_join_room", async ({ roomCode, studentName }) => {
      try {
        const room = await storage.getTeacherRoomByCode(roomCode);
        if (!room) {
          socket.emit("error", { message: "Room not found" });
          return;
        }

        // Add student to database
        const student = await storage.addStudentResult({
          roomId: room.id,
          studentName,
          wpm: 0,
          accuracy: 0,
          timeSeconds: 0,
          finished: false,
          progress: 0,
        });

        socket.join(`teacher_${roomCode}`);

        if (!activeTeacherRooms.has(roomCode)) {
          activeTeacherRooms.set(roomCode, {
            roomId: room.id,
            students: new Map(),
          });
        }

        const roomState = activeTeacherRooms.get(roomCode)!;
        roomState.students.set(socket.id, {
          studentId: student.id,
          name: studentName,
          socketId: socket.id,
        });

        const allStudents = await storage.getStudentResults(room.id);
        
        io.to(`teacher_${roomCode}`).emit("teacher_room_updated", {
          room,
          students: allStudents,
        });

        socket.emit("student_joined", { student, room });
      } catch (error) {
        console.error("Error student joining room:", error);
        socket.emit("error", { message: "Failed to join room" });
      }
    });

    socket.on("teacher_start_session", async ({ roomCode }) => {
      try {
        const room = await storage.getTeacherRoomByCode(roomCode);
        if (!room) return;

        await storage.updateTeacherRoomStatus(room.id, "active", new Date());
        const updatedRoom = await storage.getTeacherRoom(room.id);
        const students = await storage.getStudentResults(room.id);

        io.to(`teacher_${roomCode}`).emit("session_started", { room: updatedRoom, students });
      } catch (error) {
        console.error("Error starting session:", error);
      }
    });

    socket.on("student_update_progress", async ({ studentId, roomCode, progress, wpm, accuracy, timeSeconds }) => {
      try {
        const room = await storage.getTeacherRoomByCode(roomCode);
        if (!room) return;

        // Verify that the student belongs to this room
        const students = await storage.getStudentResults(room.id);
        const studentBelongsToRoom = students.some(s => s.id === studentId);
        if (!studentBelongsToRoom) {
          socket.emit("error", { message: "Invalid student" });
          return;
        }

        await storage.updateStudentProgress(studentId, progress, wpm, accuracy, timeSeconds);

        const allStudents = await storage.getStudentResults(room.id);
        io.to(`teacher_${roomCode}`).emit("teacher_room_updated", {
          room,
          students: allStudents,
        });
      } catch (error) {
        console.error("Error updating student progress:", error);
      }
    });

    socket.on("student_finish", async ({ studentId, roomCode, wpm, accuracy, timeSeconds }) => {
      try {
        const room = await storage.getTeacherRoomByCode(roomCode);
        if (!room) return;

        // Verify that the student belongs to this room
        const students = await storage.getStudentResults(room.id);
        const studentBelongsToRoom = students.some(s => s.id === studentId);
        if (!studentBelongsToRoom) {
          socket.emit("error", { message: "Invalid student" });
          return;
        }

        await storage.finishStudent(studentId, wpm, accuracy, timeSeconds);

        const allStudents = await storage.getStudentResults(room.id);
        io.to(`teacher_${roomCode}`).emit("teacher_room_updated", {
          room,
          students: allStudents,
        });
      } catch (error) {
        console.error("Error finishing student:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
      
      // Clean up room state
      for (const [roomCode, roomState] of Array.from(activeRooms.entries())) {
        if (roomState.participants.has(socket.id)) {
          roomState.participants.delete(socket.id);
          if (roomState.participants.size === 0) {
            activeRooms.delete(roomCode);
          }
        }
      }

      // Clean up teacher room state
      for (const [roomCode, roomState] of Array.from(activeTeacherRooms.entries())) {
        if (roomState.students.has(socket.id)) {
          roomState.students.delete(socket.id);
          if (roomState.students.size === 0) {
            activeTeacherRooms.delete(roomCode);
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

  // Teacher Rooms
  app.post("/api/teacher-rooms", async (req, res) => {
    try {
      const data = insertTeacherRoomSchema.parse(req.body);
      const room = await storage.createTeacherRoom(data);
      res.json(room);
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  app.get("/api/teacher-rooms/code/:roomCode", async (req, res) => {
    const room = await storage.getTeacherRoomByCode(req.params.roomCode);
    if (!room) {
      res.status(404).json({ error: "Room not found" });
      return;
    }
    res.json(room);
  });

  app.get("/api/teacher-rooms/:id/students", async (req, res) => {
    const students = await storage.getStudentResults(req.params.id);
    res.json(students);
  });

  return httpServer;
}
