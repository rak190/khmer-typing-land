import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { makeBadges, unlockBadgesByStars, Badge } from './badges';
import { buildWorlds, World } from './curriculum';

interface Progress {
  starsByStage: Record<string, number>; // "w1s1" -> 0..3
}

interface GameState {
  profile: { name: string };
  progress: Progress;
  badgesOwned: string[];
  selectedBadgeId: string;
  
  // Actions
  setProfileName: (name: string) => void;
  recordStageResult: (worldId: string, stageId: string, stars: number) => { newBadges: string[] };
  selectBadge: (id: string) => void;
  resetProgress: () => void;
  
  // Computed helpers (not stored)
  getTotalStars: () => number;
  getUnlockedWorlds: () => string[];
}

const DEFAULT_STATE = {
  profile: { name: "Player" },
  progress: { starsByStage: {} },
  badgesOwned: ["B001"],
  selectedBadgeId: "B001"
};

const ALL_BADGES = makeBadges();
const WORLDS = buildWorlds();

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_STATE,

      setProfileName: (name) => set((state) => ({ profile: { ...state.profile, name } })),

      recordStageResult: (worldId, stageId, stars) => {
        const state = get();
        const stageKey = `${worldId}${stageId}`;
        const prevStars = state.progress.starsByStage[stageKey] || 0;
        
        // Update stars if improved
        if (stars > prevStars) {
          const newStarsByStage = { ...state.progress.starsByStage, [stageKey]: stars };
          
          // Calculate total stars with the new value
          const totalStars = Object.values(newStarsByStage).reduce((a, b) => a + b, 0);
          
          // Check for badge unlocks
          const newBadges = unlockBadgesByStars(ALL_BADGES, state.badgesOwned, totalStars);
          
          set({
            progress: { ...state.progress, starsByStage: newStarsByStage },
            badgesOwned: [...state.badgesOwned, ...newBadges],
            // Auto-select newest badge if one was unlocked
            selectedBadgeId: newBadges.length > 0 ? newBadges[newBadges.length - 1] : state.selectedBadgeId
          });
          
          return { newBadges };
        }
        
        return { newBadges: [] };
      },

      selectBadge: (id) => set({ selectedBadgeId: id }),

      resetProgress: () => set({ ...DEFAULT_STATE }),

      getTotalStars: () => {
        const state = get();
        return Object.values(state.progress.starsByStage).reduce((a, b) => a + b, 0);
      },
      
      getUnlockedWorlds: () => {
        const state = get();
        const total = Object.values(state.progress.starsByStage).reduce((a, b) => a + b, 0);
        return WORLDS.filter(w => total >= w.unlockStars).map(w => w.id);
      }
    }),
    {
      name: 'khmer-typing-land-storage',
      partialize: (state) => ({
        profile: state.profile,
        progress: state.progress,
        badgesOwned: state.badgesOwned,
        selectedBadgeId: state.selectedBadgeId
      }),
    }
  )
);
