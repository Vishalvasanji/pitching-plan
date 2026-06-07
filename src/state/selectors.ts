import { useMemo } from 'react';
import { useStore, activePlan } from './store';
import { ROSTER } from '../data/roster';
import { POOL_GAMES } from '../data/schedule';
import { getGame } from '../data/games';
import { computeAvailability } from '../lib/engine/availability';
import { perDayCounts, tracePath, worstCasePath } from '../lib/engine/bracket';
import type { Assignment, DayIndex, DayStatus, Game, GameResult } from '../types';

export type GameRole = 'pool' | 'played' | 'current' | 'projected';

export interface PathGame {
  game: Game;
  role: GameRole;
  result?: GameResult;
}

export interface DerivedPlan {
  pathGames: PathGame[]; // bracket games on the path, ordered
  gamesByDay: Record<DayIndex, PathGame[]>; // pool + bracket, sorted by time
  onPathGameDays: Map<string, DayIndex>;
  availability: Map<string, DayStatus[]>;
  worstAhead: Record<DayIndex, number>; // worst-case games still to play, per day
  worstTotalAhead: number;
  outcome: ReturnType<typeof tracePath>['outcome'];
  trace: ReturnType<typeof tracePath>;
}

const DAY_INDEXES: DayIndex[] = [1, 2, 3, 4];

/** The active profile's plan data (stable reference; safe before a user is chosen). */
export function useActivePlan() {
  return useStore(activePlan);
}

export function useDerivedPlan(): DerivedPlan {
  const plan = useActivePlan();
  const { selectedBracket, results, assignments } = plan;

  return useMemo(() => {
    const trace = tracePath(selectedBracket, results);
    const tail = trace.current ? worstCasePath(trace.current, trace.losses) : [];

    // Bracket games on the path, tagged with role.
    const pathGames: PathGame[] = [];
    for (const p of trace.played) {
      const g = getGame(p.gameId);
      if (g) pathGames.push({ game: g, role: 'played', result: p.result });
    }
    if (trace.current) {
      const g = getGame(trace.current);
      if (g) pathGames.push({ game: g, role: 'current' });
    }
    for (const id of tail) {
      if (id === trace.current) continue;
      const g = getGame(id);
      if (g) pathGames.push({ game: g, role: 'projected' });
    }

    // onPathGameDays = pool games (always) + bracket path games.
    const onPathGameDays = new Map<string, DayIndex>();
    for (const g of POOL_GAMES) onPathGameDays.set(g.id, g.day);
    for (const pg of pathGames) onPathGameDays.set(pg.game.id, pg.game.day);

    // gamesByDay for the board + table headers.
    const gamesByDay: Record<DayIndex, PathGame[]> = { 1: [], 2: [], 3: [], 4: [] };
    for (const g of POOL_GAMES) gamesByDay[g.day].push({ game: g, role: 'pool' });
    for (const pg of pathGames) gamesByDay[pg.game.day].push(pg);
    for (const d of DAY_INDEXES) {
      gamesByDay[d].sort((a, b) => a.game.sortMinutes - b.game.sortMinutes);
    }

    const availability = computeAvailability(assignments as Assignment[], ROSTER, onPathGameDays);

    const aheadIds = trace.current ? tail : [];
    const worstAhead = perDayCounts(aheadIds);
    const worstTotalAhead = aheadIds.length;

    return {
      pathGames,
      gamesByDay,
      onPathGameDays,
      availability,
      worstAhead,
      worstTotalAhead,
      outcome: trace.outcome,
      trace,
    };
  }, [plan, selectedBracket, results, assignments]);
}

/** Assignments for a single game (memo-friendly thin selector). */
export function useGameAssignments(gameId: string): Assignment[] {
  const { assignments } = useActivePlan();
  return useMemo(() => assignments.filter((a) => a.gameId === gameId), [assignments, gameId]);
}
