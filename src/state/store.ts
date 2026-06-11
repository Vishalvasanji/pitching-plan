import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ArmStatus, BracketId, GameResult, PlanData, RootState, SlotArm, Theme } from '../types';
import { tracePath } from '../lib/engine/bracket';

const STORAGE_KEY = 'pitching-plan';
const VERSION = 4;

export const INITIAL_PLAN: PlanData = {
  selectedBracket: 'red',
  results: {},
  assignments: [],
};

interface Store extends RootState {
  setUser(name: string): void;
  setBracket(b: BracketId): void;
  setResult(gameId: string, result: GameResult | null): void;
  addAssignment(gameId: string, playerId: string, pitches: number): void;
  updateAssignmentPitches(id: string, pitches: number): void;
  removeAssignment(id: string): void;
  setTheme(t: Theme): void;
  resetPlan(): void;
  setArmStatus(playerId: string, status: ArmStatus): void;
  setScenarioArms(scenarioId: string, gameId: string, arms: SlotArm[]): void;
  resetScenarios(): void;
}

function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `a${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// Keep only the marks that lie on the actual traced route from the entry game.
function prunedResults(
  bracket: BracketId,
  results: Record<string, GameResult>,
): Record<string, GameResult> {
  const trace = tracePath(bracket, results);
  const next: Record<string, GameResult> = {};
  for (const p of trace.played) next[p.gameId] = p.result;
  return next;
}

const initialRoot: RootState = {
  version: VERSION,
  userName: null,
  plan: INITIAL_PLAN,
  theme: 'system',
  armStatus: {},
  scenarioArms: {},
};

/** The plan for the current device (stable reference until it changes). */
export function activePlan(s: Store): PlanData {
  return s.plan;
}

export const useStore = create<Store>()(
  persist(
    (set) => ({
      ...initialRoot,
      setUser: (name) => set(() => ({ userName: name.trim() || null })),
      setBracket: (b) =>
        set((s) => ({ plan: { ...s.plan, selectedBracket: b, results: {} } })),
      setResult: (gameId, result) =>
        set((s) => {
          const results = { ...s.plan.results };
          if (result === null) delete results[gameId];
          else results[gameId] = result;
          return { plan: { ...s.plan, results: prunedResults(s.plan.selectedBracket, results) } };
        }),
      addAssignment: (gameId, playerId, pitches) =>
        set((s) => ({
          plan: { ...s.plan, assignments: [...s.plan.assignments, { id: uid(), gameId, playerId, pitches }] },
        })),
      updateAssignmentPitches: (id, pitches) =>
        set((s) => ({
          plan: { ...s.plan, assignments: s.plan.assignments.map((a) => (a.id === id ? { ...a, pitches } : a)) },
        })),
      removeAssignment: (id) =>
        set((s) => ({
          plan: { ...s.plan, assignments: s.plan.assignments.filter((a) => a.id !== id) },
        })),
      setTheme: (t) => set(() => ({ theme: t })),
      resetPlan: () => set(() => ({ plan: INITIAL_PLAN })),
      setArmStatus: (playerId, status) =>
        set((s) => ({ armStatus: { ...s.armStatus, [playerId]: status } })),
      setScenarioArms: (scenarioId, gameId, arms) =>
        set((s) => {
          const forScenario = { ...(s.scenarioArms[scenarioId] ?? {}) };
          if (arms.length === 0) delete forScenario[gameId];
          else forScenario[gameId] = arms;
          return { scenarioArms: { ...s.scenarioArms, [scenarioId]: forScenario } };
        }),
      resetScenarios: () => set(() => ({ armStatus: {}, scenarioArms: {} })),
    }),
    {
      name: STORAGE_KEY,
      version: VERSION,
      // Preserve data from older shapes so no one loses their plan.
      migrate: (persisted, fromVersion) => {
        const old = persisted as Record<string, unknown> | undefined;
        if (!old) return persisted as RootState;

        // v2: profiles map -> carry the active profile into the flat shape.
        if (fromVersion === 2 && 'users' in old) {
          const users = old.users as Record<string, { name: string; plan: PlanData }> | undefined;
          const cu = (old.currentUser as string | null) ?? null;
          const prof = cu && users ? users[cu] : undefined;
          const name = prof?.name && prof.name !== 'My Plan' ? prof.name : null;
          return {
            version: VERSION,
            userName: name,
            plan: prof?.plan ?? INITIAL_PLAN,
            theme: (old.theme as Theme) ?? 'system',
            armStatus: {},
            scenarioArms: {},
          } satisfies RootState;
        }

        // v1: flat single plan (no name) -> keep the plan, ask for a name.
        if (fromVersion < 2 && 'selectedBracket' in old) {
          return {
            version: VERSION,
            userName: null,
            plan: {
              selectedBracket: (old.selectedBracket as BracketId) ?? 'red',
              results: (old.results as Record<string, GameResult>) ?? {},
              assignments: (old.assignments as PlanData['assignments']) ?? [],
            },
            theme: (old.theme as Theme) ?? 'system',
            armStatus: {},
            scenarioArms: {},
          } satisfies RootState;
        }

        // v3 -> v4: add the scenarios fields, keep everything else intact.
        return {
          ...(old as unknown as RootState),
          version: VERSION,
          armStatus: (old.armStatus as RootState['armStatus']) ?? {},
          scenarioArms: (old.scenarioArms as RootState['scenarioArms']) ?? {},
        };
      },
      partialize: (s) => ({
        version: s.version,
        userName: s.userName,
        plan: s.plan,
        theme: s.theme,
        armStatus: s.armStatus,
        scenarioArms: s.scenarioArms,
      }),
    },
  ),
);
