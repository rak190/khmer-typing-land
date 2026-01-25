import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { makeBadges, unlockBadgesByStars } from './badges';
import { buildWorlds } from './curriculum';

interface Progress {
  starsByStage: Record<string, number>; // "w1s1" -> 0..3
}

interface Player {
  name: string;
  progress: Progress;
  badgesOwned: string[];
  selectedBadgeId: string;
}

interface GameState {
  profile: { name: string };
  progress: Progress;
  badgesOwned: string[];
  selectedBadgeId: string;
  players: Record<string, Player>;
  currentPlayerId: string | null;
  
  // Actions
  setProfileName: (name: string) => void;
  recordStageResult: (worldId: string, stageId: string, stars: number) => { newBadges: string[] };
  selectBadge: (id: string) => void;
  resetProgress: () => void;
  
  // Multi-player Actions
  addPlayer: (name: string) => void;
  switchPlayer: (name: string) => void;
  deletePlayer: (name: string) => void;
  
  // Computed helpers (not stored)
  getTotalStars: () => number;
  getUnlockedWorlds: () => string[];
}

const DEFAULT_STATE = {
  profile: { name: "Player" },
  progress: { starsByStage: {} },
  badgesOwned: ["B001"],
  selectedBadgeId: "B001",
  players: {},
  currentPlayerId: null
};

const ALL_BADGES = makeBadges();
const WORLDS = buildWorlds();

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_STATE,

      setProfileName: (name) => set((state) => {
        const newState = { profile: { ...state.profile, name } };
        if (state.currentPlayerId) {
          const updatedPlayers = { ...state.players };
          updatedPlayers[state.currentPlayerId] = {
            ...updatedPlayers[state.currentPlayerId],
            name
          };
          return { ...newState, players: updatedPlayers };
        }
        return newState;
      }),

      recordStageResult: (worldId, stageId, stars) => {
        const state = get();
        const stageKey = `${worldId}${stageId}`;
        const prevStars = state.progress.starsByStage[stageKey] || 0;
        
        if (stars > prevStars) {
          const newStarsByStage = { ...state.progress.starsByStage, [stageKey]: stars };
          const totalStars = Object.values(newStarsByStage).reduce((a, b) => a + b, 0);
          const newBadges = unlockBadgesByStars(ALL_BADGES, state.badgesOwned, totalStars);
          
          const newState = {
            progress: { ...state.progress, starsByStage: newStarsByStage },
            badgesOwned: [...state.badgesOwned, ...newBadges],
            selectedBadgeId: newBadges.length > 0 ? newBadges[newBadges.length - 1] : state.selectedBadgeId
          };

          if (state.currentPlayerId) {
            const updatedPlayers = { ...state.players };
            updatedPlayers[state.currentPlayerId] = {
              ...updatedPlayers[state.currentPlayerId],
              progress: newState.progress,
              badgesOwned: newState.badgesOwned,
              selectedBadgeId: newState.selectedBadgeId
            };
            set({ ...newState, players: updatedPlayers });
          } else {
            set(newState);
          }
          
          return { newBadges };
        }
        
        return { newBadges: [] };
      },

      selectBadge: (id) => set((state) => {
        const newState = { selectedBadgeId: id };
        if (state.currentPlayerId) {
          const updatedPlayers = { ...state.players };
          updatedPlayers[state.currentPlayerId] = {
            ...updatedPlayers[state.currentPlayerId],
            selectedBadgeId: id
          };
          return { ...newState, players: updatedPlayers };
        }
        return newState;
      }),

      resetProgress: () => set((state) => ({
        ...DEFAULT_STATE,
        players: state.players,
        currentPlayerId: state.currentPlayerId
      })),

      addPlayer: (name) => set((state) => {
        if (state.players[name]) return state;
        const newPlayer: Player = {
          name,
          progress: { starsByStage: {} },
          badgesOwned: ["B001"],
          selectedBadgeId: "B001"
        };
        return {
          players: { ...state.players, [name]: newPlayer }
        };
      }),

      switchPlayer: (name) => set((state) => {
        const player = state.players[name];
        if (!player) return state;
        return {
          currentPlayerId: name,
          profile: { name: player.name },
          progress: player.progress,
          badgesOwned: player.badgesOwned,
          selectedBadgeId: player.selectedBadgeId
        };
      }),

      deletePlayer: (name) => set((state) => {
        const { [name]: _, ...remainingPlayers } = state.players;
        const isCurrent = state.currentPlayerId === name;
        return {
          players: remainingPlayers,
          ...(isCurrent ? {
            currentPlayerId: null,
            ...DEFAULT_STATE,
            players: remainingPlayers
          } : {})
        };
      }),

      getTotalStars: () => {
        const state = get();
        return Object.values(state.progress.starsByStage).reduce((a, b) => a + b, 0);
      },
      
      getUnlockedWorlds: () => {
        const state = get();
        const total = Object.values(state.progress.starsByStage).reduce((a, b) => a + b, 0);
        return buildWorlds().filter(w => total >= w.unlockStars).map(w => w.id);
      }
    }),
    {
      name: 'khmer-typing-land-storage',
      partialize: (state) => ({
        profile: state.profile,
        progress: state.progress,
        badgesOwned: state.badgesOwned,
        selectedBadgeId: state.selectedBadgeId,
        players: state.players,
        currentPlayerId: state.currentPlayerId
      }),
    }
  )
);
