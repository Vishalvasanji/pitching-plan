import { describe, it, expect } from 'vitest';
import { addDays, computeAvailability, formatInnings } from '../lib/engine/innings';
import type { Assignment, Game, Player } from '../types';

const ROSTER: Player[] = [{ id: 'r1', name: 'Test', number: null }];
const D = (i: number) => addDays('2026-06-11', i); // D(1)=Jun 12 … D(5)=Jun 16 (consecutive)

// Build a 5-day scenario for one pitcher; `outsByDay` maps day index -> outs.
function scenario(outsByDay: Record<number, number>) {
  const games: Game[] = [1, 2, 3, 4, 5].map((i) => ({ id: `g${i}`, date: D(i) }));
  const assignments: Assignment[] = [];
  for (const [day, outs] of Object.entries(outsByDay)) {
    if (outs > 0) assignments.push({ id: `a${day}`, gameId: `g${day}`, playerId: 'r1', outs });
  }
  const av = computeAvailability(games, assignments, ROSTER).get('r1')!;
  return (day: number) => av.get(D(day))!;
}

describe('formatInnings', () => {
  it('renders thirds', () => {
    expect(formatInnings(0)).toBe('0');
    expect(formatInnings(1)).toBe('⅓');
    expect(formatInnings(2)).toBe('⅔');
    expect(formatInnings(3)).toBe('1');
    expect(formatInnings(7)).toBe('2⅓');
    expect(formatInnings(21)).toBe('7');
  });
});

describe('USSSA innings rules — cheat-sheet examples', () => {
  it('3 IP then 0 → next day max 5 IP', () => {
    const s = scenario({ 1: 9 }); // Day 1: 3 IP
    expect(s(3).availableOuts).toBe(15); // 5 IP
    expect(s(3).kind).toBe('available');
  });

  it('6 IP forces next-day rest, then max 2 IP', () => {
    const s = scenario({ 1: 18 }); // Day 1: 6 IP
    expect(s(2).kind).toBe('resting');
    expect(s(2).restReason).toBe('post-long-outing');
    expect(s(3).availableOuts).toBe(6); // 2 IP
  });

  it('13U: 7 IP → rest → day 3 max 1 IP; day 5 max 4 IP', () => {
    expect(scenario({ 1: 21 })(3).availableOuts).toBe(3); // day-3 max = 1 IP
    const s = scenario({ 1: 21, 3: 3, 4: 9 });
    expect(s(5).availableOuts).toBe(12); // 4 IP
  });

  it('2/3/3 across three days blocks the 4th, then max 5 IP', () => {
    const s = scenario({ 1: 6, 2: 9, 3: 9 });
    expect(s(4).kind).toBe('resting');
    expect(s(4).restReason).toBe('four-in-a-row');
    expect(s(5).availableOuts).toBe(15); // 5 IP
  });

  it('1 / ⅓ / 2⅓ blocks the 4th, then max 5⅔ IP', () => {
    const s = scenario({ 1: 3, 2: 1, 3: 7 });
    expect(s(4).kind).toBe('resting');
    expect(s(5).availableOuts).toBe(17); // 5⅔ IP
    expect(formatInnings(s(5).availableOuts)).toBe('5⅔');
  });
});

describe('violations are flagged (warn, not block)', () => {
  it('pitching a 4th straight day flags four-in-a-row', () => {
    const s = scenario({ 1: 3, 2: 3, 3: 3, 4: 3 });
    expect(s(4).kind).toBe('pitched');
    expect(s(4).violations).toContain('four-in-a-row');
  });

  it('more than 8 IP over three days flags over-window', () => {
    const s = scenario({ 1: 9, 2: 9, 3: 9 }); // 3+3+3 = 9 IP in 3 days
    expect(s(3).violations).toContain('over-window');
  });

  it('pitching the day after > 3 IP flags no-rest', () => {
    const s = scenario({ 1: 12, 2: 3 }); // 4 IP then pitch next day
    expect(s(2).violations).toContain('no-rest');
  });

  it('more than 7 IP in a day flags over-daily', () => {
    const s = scenario({ 1: 24 }); // 8 IP in one day
    expect(s(1).violations).toContain('over-daily');
  });
});
