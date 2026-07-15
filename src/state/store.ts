import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Game, Player, RootState, Theme } from '../types';
import { DEFAULT_ROSTER } from '../data/roster';

const STORAGE_KEY = 'pitching-plan';
const VERSION = 4; // v4 = regular weekend tournament (innings). v1–3 were the WS build.

interface Store extends RootState {
  setUser(name: string): void;
  setTheme(t: Theme): void;
  setTournamentName(name: string): void;
  addGame(game: { date: string; time?: string; opponent?: string }): void;
  updateGame(id: string, patch: Partial<Omit<Game, 'id'>>): void;
  removeGame(id: string): void;
  addAssignment(gameId: string, playerId: string, outs: number): void;
  updateAssignmentOuts(id: string, outs: number): void;
  removeAssignment(id: string): void;
  addPlayer(name: string): void;
  updatePlayer(id: string, patch: Partial<Omit<Player, 'id'>>): void;
  removePlayer(id: string): void;
  resetTournament(): void;
}

function uid(prefix = 'a'): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${prefix}${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

const initialRoot: RootState = {
  version: VERSION,
  userName: null,
  theme: 'system',
  tournamentName: '',
  roster: DEFAULT_ROSTER,
  games: [],
  assignments: [],
};

export const useStore = create<Store>()(
  persist(
    (set) => ({
      ...initialRoot,
      setUser: (name) => set(() => ({ userName: name.trim() || null })),
      setTheme: (t) => set(() => ({ theme: t })),
      setTournamentName: (name) => set(() => ({ tournamentName: name })),

      addGame: (game) =>
        set((s) => ({ games: [...s.games, { id: uid('g'), ...game }] })),
      updateGame: (id, patch) =>
        set((s) => ({ games: s.games.map((g) => (g.id === id ? { ...g, ...patch } : g)) })),
      removeGame: (id) =>
        set((s) => ({
          games: s.games.filter((g) => g.id !== id),
          assignments: s.assignments.filter((a) => a.gameId !== id),
        })),

      addAssignment: (gameId, playerId, outs) =>
        set((s) => ({
          assignments: [...s.assignments, { id: uid(), gameId, playerId, outs }],
        })),
      updateAssignmentOuts: (id, outs) =>
        set((s) => ({
          assignments: s.assignments.map((a) => (a.id === id ? { ...a, outs } : a)),
        })),
      removeAssignment: (id) =>
        set((s) => ({ assignments: s.assignments.filter((a) => a.id !== id) })),

      addPlayer: (name) =>
        set((s) => ({ roster: [...s.roster, { id: uid('r'), name: name.trim(), number: null }] })),
      updatePlayer: (id, patch) =>
        set((s) => ({ roster: s.roster.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
      removePlayer: (id) =>
        set((s) => ({
          roster: s.roster.filter((p) => p.id !== id),
          assignments: s.assignments.filter((a) => a.playerId !== id),
        })),

      resetTournament: () => set(() => ({ games: [], assignments: [], tournamentName: '' })),
    }),
    {
      name: STORAGE_KEY,
      version: VERSION,
      // v1–v3 were the World Series build (a different data shape). There's no
      // meaningful mapping to the tournament model, so start fresh but keep the
      // coach's name and theme.
      migrate: (persisted, fromVersion) => {
        const old = (persisted ?? {}) as Record<string, unknown>;
        if (fromVersion >= 4) {
          return {
            ...initialRoot,
            ...old,
            version: VERSION,
          } as RootState;
        }
        return {
          ...initialRoot,
          userName: (old.userName as string | null) ?? null,
          theme: (old.theme as Theme) ?? 'system',
        } satisfies RootState;
      },
      partialize: (s) => ({
        version: s.version,
        userName: s.userName,
        theme: s.theme,
        tournamentName: s.tournamentName,
        roster: s.roster,
        games: s.games,
        assignments: s.assignments,
      }),
    },
  ),
);
