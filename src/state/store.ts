import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BracketId, GameResult, PlanState, Theme } from '../types';
import { tracePath } from '../lib/engine/bracket';

const STORAGE_KEY = 'pitching-plan';
const VERSION = 1;

interface Store extends PlanState {
  setBracket(b: BracketId): void;
  setResult(gameId: string, result: GameResult | null): void;
  addAssignment(gameId: string, playerId: string, pitches: number): void;
  updateAssignmentPitches(id: string, pitches: number): void;
  removeAssignment(id: string): void;
  setTheme(t: Theme): void;
  resetPlan(): void;
}

function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `a${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// Keep only the marks that lie on the actual traced route from the entry game.
// Clears orphaned downstream marks when an earlier result is changed.
function prunedResults(
  bracket: BracketId,
  results: Record<string, GameResult>,
): Record<string, GameResult> {
  const trace = tracePath(bracket, results);
  const next: Record<string, GameResult> = {};
  for (const p of trace.played) next[p.gameId] = p.result;
  return next;
}

const initial: PlanState = {
  version: VERSION,
  selectedBracket: 'red',
  results: {},
  assignments: [],
  theme: 'system',
};

export const useStore = create<Store>()(
  persist(
    (set) => ({
      ...initial,
      setBracket: (b) => set(() => ({ selectedBracket: b, results: {} })),
      setResult: (gameId, result) =>
        set((s) => {
          const results = { ...s.results };
          if (result === null) delete results[gameId];
          else results[gameId] = result;
          return { results: prunedResults(s.selectedBracket, results) };
        }),
      addAssignment: (gameId, playerId, pitches) =>
        set((s) => ({
          assignments: [...s.assignments, { id: uid(), gameId, playerId, pitches }],
        })),
      updateAssignmentPitches: (id, pitches) =>
        set((s) => ({
          assignments: s.assignments.map((a) => (a.id === id ? { ...a, pitches } : a)),
        })),
      removeAssignment: (id) =>
        set((s) => ({ assignments: s.assignments.filter((a) => a.id !== id) })),
      setTheme: (t) => set(() => ({ theme: t })),
      resetPlan: () => set(() => ({ ...initial })),
    }),
    {
      name: STORAGE_KEY,
      version: VERSION,
      partialize: (s) => ({
        version: s.version,
        selectedBracket: s.selectedBracket,
        results: s.results,
        assignments: s.assignments,
        theme: s.theme,
      }),
    },
  ),
);
