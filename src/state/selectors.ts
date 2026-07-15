import { useMemo } from 'react';
import { useStore } from './store';
import { computeAvailability, minutesFrom24, sortedGameDates } from '../lib/engine/innings';
import type { Assignment, DateStatus, Game, Player } from '../types';

export function useRoster(): Player[] {
  return useStore((s) => s.roster);
}
export function useGames(): Game[] {
  return useStore((s) => s.games);
}
export function useAssignments(): Assignment[] {
  return useStore((s) => s.assignments);
}

export function usePlayerMap(): Map<string, Player> {
  const roster = useRoster();
  return useMemo(() => new Map(roster.map((p) => [p.id, p])), [roster]);
}

export interface DatedGames {
  date: string;
  games: Game[];
}

/** Games grouped by date (chronological), each date's games sorted by time. */
export function useGamesByDate(): DatedGames[] {
  const games = useGames();
  return useMemo(() => {
    const byDate = new Map<string, Game[]>();
    for (const g of games) {
      const arr = byDate.get(g.date) ?? [];
      arr.push(g);
      byDate.set(g.date, arr);
    }
    return sortedGameDates(games).map((date) => ({
      date,
      games: (byDate.get(date) ?? []).sort((a, b) => minutesFrom24(a.time) - minutesFrom24(b.time)),
    }));
  }, [games]);
}

export function useAvailability(): Map<string, Map<string, DateStatus>> {
  const games = useGames();
  const assignments = useAssignments();
  const roster = useRoster();
  return useMemo(
    () => computeAvailability(games, assignments, roster),
    [games, assignments, roster],
  );
}

export function useGameAssignments(gameId: string): Assignment[] {
  const assignments = useAssignments();
  return useMemo(() => assignments.filter((a) => a.gameId === gameId), [assignments, gameId]);
}
