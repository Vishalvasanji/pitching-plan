import type { BracketId, DayIndex, Game, GameResult } from '../../types';
import { GAME_BY_ID } from '../../data/games';
import { ASSUMED_SEED, ENTRY } from '../../data/brackets';

export { ASSUMED_SEED };

function gm(id: string): Game {
  const g = GAME_BY_ID.get(id);
  if (!g) throw new Error(`Unknown game: ${id}`);
  return g;
}

function countDay(ids: string[], day: DayIndex): number {
  let c = 0;
  for (const id of ids) if (gm(id).day === day) c++;
  return c;
}

/** Pick the path with more total games; tie-break toward the heaviest final day. */
function chooseWorse(a: string[], b: string[] | null): string[] {
  if (!b) return a;
  if (a.length !== b.length) return a.length > b.length ? a : b;
  const a4 = countDay(a, 4);
  const b4 = countDay(b, 4);
  if (a4 !== b4) return a4 > b4 ? a : b;
  const a3 = countDay(a, 3);
  const b3 = countDay(b, 3);
  if (a3 !== b3) return a3 > b3 ? a : b;
  return a;
}

/**
 * The longest road to the championship from a given state (recursive over the
 * advancement DAG). With 1 loss you must win out (a 2nd loss eliminates you),
 * so the path is forced. With 0 losses, take the worse of the win/lose branch.
 */
export function worstCasePath(gameId: string, losses: number): string[] {
  const g = gm(gameId);
  if (g.winnerTo === 'champion' || !g.winnerTo) return [gameId];
  if (losses >= 1) return [gameId, ...worstCasePath(g.winnerTo, 1)];

  const winPath = [gameId, ...worstCasePath(g.winnerTo, 0)];
  let losePath: string[] | null = null;
  if (g.loserTo && g.loserTo !== 'eliminated') {
    losePath = [gameId, ...worstCasePath(g.loserTo, 1)];
  }
  return chooseWorse(winPath, losePath);
}

export type Outcome = 'in-progress' | 'champion' | 'eliminated';
export interface PlayedGame {
  gameId: string;
  result: GameResult;
}
export interface TraceResult {
  played: PlayedGame[];
  current: string | null;
  losses: number;
  outcome: Outcome;
}

export function entryGame(bracket: BracketId): string {
  return ENTRY[ASSUMED_SEED[bracket]];
}

/**
 * Follow the marked W/L results from the assumed seed's entry game. Stops at
 * the first unmarked game (`current`) or at a terminal state.
 */
export function tracePath(bracket: BracketId, results: Record<string, GameResult>): TraceResult {
  const played: PlayedGame[] = [];
  let current: string | null = entryGame(bracket);
  let losses = 0;
  let outcome: Outcome = 'in-progress';
  const guard = new Set<string>();

  while (current && results[current]) {
    if (guard.has(current)) break;
    guard.add(current);
    const result = results[current];
    played.push({ gameId: current, result });
    const g = gm(current);

    if (result === 'W') {
      if (g.winnerTo === 'champion' || !g.winnerTo) {
        outcome = 'champion';
        current = null;
        break;
      }
      current = g.winnerTo;
    } else {
      losses += 1;
      if (!g.loserTo || g.loserTo === 'eliminated' || losses >= 2) {
        outcome = 'eliminated';
        current = null;
        break;
      }
      current = g.loserTo;
    }
  }

  return { played, current, losses, outcome };
}

export function perDayCounts(gameIds: string[]): Record<DayIndex, number> {
  const counts: Record<DayIndex, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
  for (const id of gameIds) counts[gm(id).day] += 1;
  return counts;
}
