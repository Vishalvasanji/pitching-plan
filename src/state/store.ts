import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BracketId, GameResult, PlanData, RootState, Theme } from '../types';
import { tracePath } from '../lib/engine/bracket';

const STORAGE_KEY = 'pitching-plan';
const VERSION = 2;

export const INITIAL_PLAN: PlanData = {
  selectedBracket: 'red',
  results: {},
  assignments: [],
};

interface Store extends RootState {
  setUser(name: string): void;
  signOut(): void;
  setBracket(b: BracketId): void;
  setResult(gameId: string, result: GameResult | null): void;
  addAssignment(gameId: string, playerId: string, pitches: number): void;
  updateAssignmentPitches(id: string, pitches: number): void;
  removeAssignment(id: string): void;
  setTheme(t: Theme): void;
  resetPlan(): void;
}

function slugify(name: string): string {
  return (
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'coach'
  );
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
  currentUser: null,
  users: {},
  theme: 'system',
};

/** Immutably update the active profile's plan. No-op if no profile is active. */
function patchActivePlan(s: Store, fn: (p: PlanData) => PlanData): Partial<Store> {
  const key = s.currentUser;
  const user = key ? s.users[key] : undefined;
  if (!key || !user) return {};
  return { users: { ...s.users, [key]: { ...user, plan: fn(user.plan) } } };
}

export function activePlan(s: Store): PlanData {
  return (s.currentUser && s.users[s.currentUser]?.plan) || INITIAL_PLAN;
}

export const useStore = create<Store>()(
  persist(
    (set) => ({
      ...initialRoot,
      setUser: (name) =>
        set((s) => {
          const slug = slugify(name);
          const users = s.users[slug]
            ? s.users
            : { ...s.users, [slug]: { name: name.trim(), plan: INITIAL_PLAN } };
          return { users, currentUser: slug };
        }),
      signOut: () => set(() => ({ currentUser: null })),
      setBracket: (b) =>
        set((s) => patchActivePlan(s, (p) => ({ ...p, selectedBracket: b, results: {} }))),
      setResult: (gameId, result) =>
        set((s) =>
          patchActivePlan(s, (p) => {
            const results = { ...p.results };
            if (result === null) delete results[gameId];
            else results[gameId] = result;
            return { ...p, results: prunedResults(p.selectedBracket, results) };
          }),
        ),
      addAssignment: (gameId, playerId, pitches) =>
        set((s) =>
          patchActivePlan(s, (p) => ({
            ...p,
            assignments: [...p.assignments, { id: uid(), gameId, playerId, pitches }],
          })),
        ),
      updateAssignmentPitches: (id, pitches) =>
        set((s) =>
          patchActivePlan(s, (p) => ({
            ...p,
            assignments: p.assignments.map((a) => (a.id === id ? { ...a, pitches } : a)),
          })),
        ),
      removeAssignment: (id) =>
        set((s) =>
          patchActivePlan(s, (p) => ({
            ...p,
            assignments: p.assignments.filter((a) => a.id !== id),
          })),
        ),
      setTheme: (t) => set(() => ({ theme: t })),
      resetPlan: () => set((s) => patchActivePlan(s, () => ({ ...INITIAL_PLAN }))),
    }),
    {
      name: STORAGE_KEY,
      version: VERSION,
      // v1 stored a single flat plan; wrap it into a default profile so data isn't lost.
      migrate: (persisted, fromVersion) => {
        const old = persisted as Record<string, unknown> | undefined;
        if (fromVersion < 2 && old && 'selectedBracket' in old) {
          const slug = 'my-plan';
          return {
            version: VERSION,
            currentUser: slug,
            users: {
              [slug]: {
                name: 'My Plan',
                plan: {
                  selectedBracket: (old.selectedBracket as BracketId) ?? 'red',
                  results: (old.results as Record<string, GameResult>) ?? {},
                  assignments: (old.assignments as PlanData['assignments']) ?? [],
                },
              },
            },
            theme: (old.theme as Theme) ?? 'system',
          } satisfies RootState;
        }
        return persisted as RootState;
      },
      partialize: (s) => ({
        version: s.version,
        currentUser: s.currentUser,
        users: s.users,
        theme: s.theme,
      }),
    },
  ),
);
