import type {
  Assignment,
  DayIndex,
  DayStatus,
  Player,
  RestReason,
  ViolationKind,
} from '../../types';
import { DAILY_MAX, NUM_DAYS, restDays } from './restRules';

/**
 * Sum each player's pitches per day, counting only assignments to games that
 * are currently on the path (pool games + the displayed bracket path). An
 * assignment to a pruned/off-path game is ignored (dormant).
 */
export function computeDailyTotals(
  assignments: Assignment[],
  onPathGameDays: Map<string, DayIndex>,
): Map<string, number[]> {
  const totals = new Map<string, number[]>();
  for (const a of assignments) {
    const day = onPathGameDays.get(a.gameId);
    if (!day) continue;
    let arr = totals.get(a.playerId);
    if (!arr) {
      arr = [0, 0, 0, 0];
      totals.set(a.playerId, arr);
    }
    arr[day - 1] += a.pitches;
  }
  return totals;
}

function gamesByPlayerDay(
  assignments: Assignment[],
  onPathGameDays: Map<string, DayIndex>,
): Map<string, string[][]> {
  const map = new Map<string, string[][]>();
  for (const a of assignments) {
    const day = onPathGameDays.get(a.gameId);
    if (!day) continue;
    let pd = map.get(a.playerId);
    if (!pd) {
      pd = [[], [], [], []];
      map.set(a.playerId, pd);
    }
    pd[day - 1].push(a.gameId);
  }
  return map;
}

/**
 * The single source of truth for pitcher status. For each player, returns a
 * length-4 array of DayStatus (index 0 = Day 1).
 */
export function computeAvailability(
  assignments: Assignment[],
  roster: Player[],
  onPathGameDays: Map<string, DayIndex>,
): Map<string, DayStatus[]> {
  const totals = computeDailyTotals(assignments, onPathGameDays);
  const games = gamesByPlayerDay(assignments, onPathGameDays);
  const result = new Map<string, DayStatus[]>();

  for (const player of roster) {
    const p = totals.get(player.id) ?? [0, 0, 0, 0];
    const pd = games.get(player.id) ?? [[], [], [], []];
    const statuses: DayStatus[] = [];

    for (let d = 1; d <= NUM_DAYS; d++) {
      const pitches = p[d - 1];
      const gameIds = pd[d - 1];

      if (pitches > 0) {
        const violations: ViolationKind[] = [];
        if (pitches > DAILY_MAX) violations.push('over-daily-max');
        // Rest violation: any PRIOR outing whose forced-rest window covers day d.
        for (let dp = 1; dp < d; dp++) {
          if (p[dp - 1] > 0 && d <= dp + restDays(p[dp - 1])) {
            violations.push('rest-violation');
            break;
          }
        }
        // 3-days-in-a-row: pitched both of the two previous days.
        if (d >= 3 && p[d - 2] > 0 && p[d - 3] > 0) {
          violations.push('three-in-a-row');
        }
        statuses.push({ day: d as DayIndex, kind: 'pitched', pitches, violations, gameIds });
        continue;
      }

      // pitches === 0: resting or available?
      let backOnDay: number | undefined;
      let restReason: RestReason | undefined;
      for (let dp = 1; dp < d; dp++) {
        if (p[dp - 1] > 0) {
          const back = dp + restDays(p[dp - 1]) + 1;
          if (d < back) {
            if (backOnDay === undefined || back > backOnDay) backOnDay = back;
            restReason = 'rest-window';
          }
        }
      }
      if (restReason === undefined && d >= 3 && p[d - 2] > 0 && p[d - 3] > 0) {
        restReason = 'three-in-a-row';
        backOnDay = d + 1;
      }

      if (restReason) {
        statuses.push({
          day: d as DayIndex,
          kind: 'resting',
          pitches: 0,
          violations: [],
          restReason,
          backOnDay,
          gameIds: [],
        });
      } else {
        statuses.push({ day: d as DayIndex, kind: 'available', pitches: 0, violations: [], gameIds: [] });
      }
    }

    result.set(player.id, statuses);
  }

  return result;
}

/** Players legal to pitch on a given day (used to populate the add-pitcher picker). */
export function availablePitchersForDay(
  day: DayIndex,
  availability: Map<string, DayStatus[]>,
  roster: Player[],
): Player[] {
  return roster.filter((pl) => availability.get(pl.id)?.[day - 1].kind === 'available');
}
