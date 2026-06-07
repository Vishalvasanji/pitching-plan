import type { DayStatus, Game, GameSlot, ViolationKind } from '../../types';
import { DAYS } from '../../data/tournament';
import { gameNumber } from '../../data/games';

export function weekdayForDay(day: number): string {
  const meta = DAYS.find((d) => d.index === day);
  return meta ? meta.weekday : 'after';
}

/** Human label for when a resting pitcher is next legal. backOnDay 5 = done. */
export function backOnLabel(backOnDay: number | undefined): string {
  if (backOnDay === undefined) return '';
  if (backOnDay > DAYS.length) return 'Done';
  return weekdayForDay(backOnDay);
}

export function slotShort(slot?: GameSlot): string {
  if (!slot) return '';
  if (slot.kind === 'seed') return `#${slot.seed}`;
  return `${slot.kind === 'winner' ? 'W' : 'L'}${gameNumber(slot.from)}`;
}

export function slotLong(slot?: GameSlot): string {
  if (!slot) return 'TBD';
  if (slot.kind === 'seed') return `#${slot.seed} seed`;
  return `${slot.kind === 'winner' ? 'Winner' : 'Loser'} G${gameNumber(slot.from)}`;
}

/** Matchup text for a game card. */
export function gameMatchup(game: Game): string {
  if (game.phase === 'pool') {
    const prefix = game.homeAway === 'away' ? '@' : 'vs';
    return `${prefix} ${game.opponent ?? ''}`.trim();
  }
  return `${slotLong(game.slot1)} vs ${slotLong(game.slot2)}`;
}

/** Compact matchup for tight chips (roster table headers). */
export function gameMatchupShort(game: Game): string {
  if (game.phase === 'pool') {
    const prefix = game.homeAway === 'away' ? '@' : 'vs';
    const opp = game.opponent ?? '';
    return `${prefix} ${opp}`;
  }
  return `${slotShort(game.slot1)}·${slotShort(game.slot2)}`;
}

export function gameTitle(game: Game): string {
  if (game.phase === 'pool') return game.opponent ?? game.id;
  return `Game ${gameNumber(game.id)}`;
}

export const VIOLATION_TEXT: Record<ViolationKind, string> = {
  'over-daily-max': 'Over 95',
  'rest-violation': 'No rest',
  'three-in-a-row': '3rd day',
};

export function violationLabel(violations: ViolationKind[]): string {
  return violations.map((v) => VIOLATION_TEXT[v]).join(' · ');
}

/** Short status text for a roster cell. */
export function cellStatusText(status: DayStatus): string {
  if (status.kind === 'pitched') {
    return `${status.pitches}`;
  }
  if (status.kind === 'resting') {
    const back = backOnLabel(status.backOnDay);
    return back === 'Done' ? 'Done' : `Rest`;
  }
  return 'Open';
}
