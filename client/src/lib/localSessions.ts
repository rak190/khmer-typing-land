export interface LocalTypingSession {
  id: string;
  playerId: string;
  mode: string;
  difficulty: string;
  wpm: number;
  accuracy: number;
  errors: number;
  stars: number;
  duration: number;
  worldId?: string;
  stageId?: string;
  completedAt: string;
}

const STORAGE_KEY = "khmer-typing-land-sessions";
const MAX_SESSIONS = 200;

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function readLocalSessions(playerId?: string, limit = 30): LocalTypingSession[] {
  if (!canUseStorage()) return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const sessions = raw ? (JSON.parse(raw) as LocalTypingSession[]) : [];
    return sessions
      .filter((session) => !playerId || session.playerId === playerId)
      .sort((a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt))
      .slice(0, limit);
  } catch (error) {
    console.error("Error reading local sessions:", error);
    return [];
  }
}

export function saveLocalSession(
  session: Omit<LocalTypingSession, "id" | "completedAt">,
) {
  if (!canUseStorage()) return;

  try {
    const nextSession: LocalTypingSession = {
      ...session,
      id: crypto.randomUUID(),
      completedAt: new Date().toISOString(),
    };
    const sessions = readLocalSessions(undefined, MAX_SESSIONS);
    const nextSessions = [nextSession, ...sessions].slice(0, MAX_SESSIONS);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSessions));
  } catch (error) {
    console.error("Error saving local session:", error);
  }
}
