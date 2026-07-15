import type { Assignment, DateStatus, Game, Player, RestReason, ViolationKind } from '../../types';

// USSSA weekend-tournament pitching rules (innings-based). Everything is tracked
// in OUTS to keep the ⅓-inning math exact.
//
//  1. Never pitch more than 3 days in a row (a 4th straight day is illegal).
//  2. Daily cap: 6 innings/day for 12U & under, 7 for 13U & up. (This team: 7.)
//  3. Pitch > 3 innings in a day -> must rest the next day.
//  4. Max 8 innings across any rolling 3 days (today + the 2 prior days).
//  5. Innings count by outs recorded.
//  6. A rest day does NOT reset anything — the windows are calendar-based.

export const OUTS_PER_INNING = 3;
export const DAILY_CAP_OUTS = 21; // 7 innings/day (13U+)
export const WINDOW_MAX_OUTS = 24; // 8 innings across any rolling 3 days
export const LONG_OUTING_OUTS = 9; // > 3 innings (>9 outs) forces next-day rest

/** Outs -> "2⅓" style innings label. */
export function formatInnings(outs: number): string {
  if (outs <= 0) return '0';
  const whole = Math.floor(outs / OUTS_PER_INNING);
  const rem = outs % OUTS_PER_INNING;
  const frac = rem === 1 ? '⅓' : rem === 2 ? '⅔' : '';
  if (whole === 0) return frac || '0';
  return `${whole}${frac}`;
}

// ---- date helpers (UTC so there's no timezone drift on plain dates) ----

export function addDays(iso: string, delta: number): string {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

export function sortedGameDates(games: Game[]): string[] {
  return [...new Set(games.map((g) => g.date))].sort();
}

export function dateParts(iso: string): { wd: string; md: string } {
  const [, m, d] = iso.split('-').map((n) => parseInt(n, 10));
  const wd = new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: 'UTC' }).format(
    new Date(iso + 'T00:00:00Z'),
  );
  return { wd, md: `${m}/${d}` };
}

export function formatDateLabel(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(iso + 'T00:00:00Z'));
}

/** Minutes since midnight for a 24h "HH:MM"; -1 when unset/invalid (sorts first). */
export function minutesFrom24(t?: string): number {
  if (!t) return -1;
  const m = t.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return -1;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}

/** 24h "HH:MM" -> "8:30 AM"; '' when unset. */
export function formatClock(t?: string): string {
  const min = minutesFrom24(t);
  if (min < 0) return '';
  let h = Math.floor(min / 60);
  const mm = min % 60;
  const ap = h >= 12 ? 'PM' : 'AM';
  h %= 12;
  if (h === 0) h = 12;
  return `${h}:${String(mm).padStart(2, '0')} ${ap}`;
}

// ---- the rest engine ----

type OutsByDate = Record<string, number>;

function outsOn(byDate: OutsByDate, date: string): number {
  return byDate[date] ?? 0;
}

/** Is `date` blocked for this pitcher, given their recorded usage? */
function blockedOn(byDate: OutsByDate, date: string): boolean {
  const d1 = outsOn(byDate, addDays(date, -1));
  const d2 = outsOn(byDate, addDays(date, -2));
  const d3 = outsOn(byDate, addDays(date, -3));
  const fourInRow = d1 > 0 && d2 > 0 && d3 > 0; // today would be the 4th straight
  const postLong = d1 > LONG_OUTING_OUTS; // threw > 3 innings yesterday
  const windowRemaining = WINDOW_MAX_OUTS - d1 - d2;
  return fourInRow || postLong || windowRemaining <= 0;
}

/** Next date at/after `date`+1 this pitcher can throw, or null within ~a week. */
function nextAvailableDate(byDate: OutsByDate, date: string): string | null {
  for (let i = 1; i <= 6; i++) {
    const d = addDays(date, i);
    if (!blockedOn(byDate, d)) return d;
  }
  return null;
}

function statusForDate(date: string, byDate: OutsByDate): DateStatus {
  const thrown = outsOn(byDate, date);
  const d1 = outsOn(byDate, addDays(date, -1));
  const d2 = outsOn(byDate, addDays(date, -2));
  const d3 = outsOn(byDate, addDays(date, -3));

  const fourInRow = d1 > 0 && d2 > 0 && d3 > 0;
  const postLong = d1 > LONG_OUTING_OUTS;
  const windowCap = Math.min(DAILY_CAP_OUTS, WINDOW_MAX_OUTS - d1 - d2);
  const startCap = fourInRow || postLong ? 0 : Math.max(0, windowCap);

  if (thrown > 0) {
    const violations: ViolationKind[] = [];
    if (thrown > DAILY_CAP_OUTS) violations.push('over-daily');
    if (thrown + d1 + d2 > WINDOW_MAX_OUTS) violations.push('over-window');
    if (postLong) violations.push('no-rest');
    if (fourInRow) violations.push('four-in-a-row');
    return {
      date,
      kind: 'pitched',
      outs: thrown,
      availableOuts: Math.max(0, windowCap - thrown),
      violations,
    };
  }

  if (startCap <= 0) {
    const restReason: RestReason = fourInRow
      ? 'four-in-a-row'
      : postLong
        ? 'post-long-outing'
        : 'window-full';
    return {
      date,
      kind: 'resting',
      outs: 0,
      availableOuts: 0,
      violations: [],
      restReason,
      backOn: nextAvailableDate(byDate, date),
    };
  }

  return { date, kind: 'available', outs: 0, availableOuts: startCap, violations: [] };
}

/**
 * Availability for every roster player across every game date. Rest windows are
 * calendar-based, so a date with no game still counts as a (rest) day.
 */
export function computeAvailability(
  games: Game[],
  assignments: Assignment[],
  roster: Player[],
): Map<string, Map<string, DateStatus>> {
  const dates = sortedGameDates(games);
  const gameDate = new Map(games.map((g) => [g.id, g.date]));

  const outsMap = new Map<string, OutsByDate>();
  for (const a of assignments) {
    const date = gameDate.get(a.gameId);
    if (!date) continue;
    let byDate = outsMap.get(a.playerId);
    if (!byDate) {
      byDate = {};
      outsMap.set(a.playerId, byDate);
    }
    byDate[date] = (byDate[date] ?? 0) + a.outs;
  }

  const result = new Map<string, Map<string, DateStatus>>();
  for (const p of roster) {
    const byDate = outsMap.get(p.id) ?? {};
    const statuses = new Map<string, DateStatus>();
    for (const date of dates) statuses.set(date, statusForDate(date, byDate));
    result.set(p.id, statuses);
  }
  return result;
}
