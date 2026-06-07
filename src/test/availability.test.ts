import { describe, it, expect } from 'vitest';
import type { Assignment, DayIndex, Player } from '../types';
import { availablePitchersForDay, computeAvailability } from '../lib/engine/availability';

const ROSTER: Player[] = [
  { id: 'p1', number: 1, firstName: 'Test', lastName: 'Pitcher', position: 'P' },
];

/** Build statuses for one player given pitches per day (length 4, one game/day). */
function statuses(pitchesByDay: number[]) {
  const assignments: Assignment[] = [];
  const dayMap = new Map<string, DayIndex>();
  pitchesByDay.forEach((p, i) => {
    if (p > 0) {
      const gid = `g${i + 1}`;
      assignments.push({ id: `a${i}`, gameId: gid, playerId: 'p1', pitches: p });
      dayMap.set(gid, (i + 1) as DayIndex);
    }
  });
  return computeAvailability(assignments, ROSTER, dayMap).get('p1')!;
}

describe('computeAvailability — rest windows', () => {
  it('20 pitches Day 1 → available Day 2 (0 rest)', () => {
    const s = statuses([20, 0, 0, 0]);
    expect(s[0].kind).toBe('pitched');
    expect(s[1].kind).toBe('available');
  });

  it('21 pitches Day 1 → resting Day 2, back Day 3', () => {
    const s = statuses([21, 0, 0, 0]);
    expect(s[1].kind).toBe('resting');
    expect(s[1].backOnDay).toBe(3);
    expect(s[2].kind).toBe('available');
  });

  it('50 pitches Day 1 → rest Days 2 & 3, back Day 4', () => {
    const s = statuses([50, 0, 0, 0]);
    expect(s[1].kind).toBe('resting');
    expect(s[2].kind).toBe('resting');
    expect(s[1].backOnDay).toBe(4);
    expect(s[3].kind).toBe('available');
  });

  it('66+ pitches Day 1 → done for the tournament (back Day 6, beyond the event)', () => {
    const s = statuses([66, 0, 0, 0]);
    expect(s[1].kind).toBe('resting');
    expect(s[3].kind).toBe('resting');
    expect(s[3].backOnDay).toBe(6); // 1 + restDays(66)=4 + 1; > 4 days → "Done"
  });

  it('NON-ADJACENT guard: 60 Day 1, pitch Day 4 → rest violation', () => {
    // restDays(60) = 3 → window covers Days 2,3,4 even though Day 3 was empty.
    const s = statuses([60, 0, 0, 40]);
    expect(s[1].kind).toBe('resting');
    expect(s[2].kind).toBe('resting');
    expect(s[3].kind).toBe('pitched');
    expect(s[3].violations).toContain('rest-violation');
  });
});

describe('computeAvailability — 3-in-a-row', () => {
  it('15 + 15 on Days 1–2 (low counts) → Day 3 blocked by 3-in-a-row', () => {
    const s = statuses([15, 15, 0, 0]);
    expect(s[1].kind).toBe('pitched'); // 0 rest, legal back-to-back
    expect(s[2].kind).toBe('resting');
    expect(s[2].restReason).toBe('three-in-a-row');
    expect(s[2].backOnDay).toBe(4);
    expect(s[3].kind).toBe('available');
  });

  it('pitching the 3rd straight day flags a three-in-a-row violation', () => {
    const s = statuses([15, 15, 15, 0]);
    expect(s[2].kind).toBe('pitched');
    expect(s[2].violations).toContain('three-in-a-row');
  });
});

describe('computeAvailability — multiple games same day & daily max', () => {
  it('sums two games in one day toward the rest threshold', () => {
    const assignments: Assignment[] = [
      { id: 'a1', gameId: 'x1', playerId: 'p1', pitches: 40 },
      { id: 'a2', gameId: 'x2', playerId: 'p1', pitches: 30 },
    ];
    const dayMap = new Map<string, DayIndex>([
      ['x1', 3],
      ['x2', 3],
    ]);
    const s = computeAvailability(assignments, ROSTER, dayMap).get('p1')!;
    expect(s[2].kind).toBe('pitched');
    expect(s[2].pitches).toBe(70); // restDays(70) = 4
    expect(s[2].violations).toHaveLength(0);
    expect(s[3].kind).toBe('resting');
  });

  it('flags over-daily-max when the day total exceeds 95', () => {
    const assignments: Assignment[] = [
      { id: 'a1', gameId: 'x1', playerId: 'p1', pitches: 60 },
      { id: 'a2', gameId: 'x2', playerId: 'p1', pitches: 40 },
    ];
    const dayMap = new Map<string, DayIndex>([
      ['x1', 3],
      ['x2', 3],
    ]);
    const s = computeAvailability(assignments, ROSTER, dayMap).get('p1')!;
    expect(s[2].pitches).toBe(100);
    expect(s[2].violations).toContain('over-daily-max');
  });

  it('95 exactly is legal; 96 is a violation', () => {
    expect(statuses([95, 0, 0, 0])[0].violations).toHaveLength(0);
    expect(statuses([96, 0, 0, 0])[0].violations).toContain('over-daily-max');
  });
});

describe('computeAvailability — misc', () => {
  it('empty plan → available every day', () => {
    const s = statuses([0, 0, 0, 0]);
    expect(s.every((d) => d.kind === 'available')).toBe(true);
  });

  it('availablePitchersForDay excludes pitching/resting players', () => {
    const assignments: Assignment[] = [
      { id: 'a1', gameId: 'g1', playerId: 'p1', pitches: 40 },
    ];
    const dayMap = new Map<string, DayIndex>([['g1', 1]]);
    const av = computeAvailability(assignments, ROSTER, dayMap);
    expect(availablePitchersForDay(1, av, ROSTER)).toHaveLength(0); // pitching Day 1
    expect(availablePitchersForDay(2, av, ROSTER)).toHaveLength(0); // resting Day 2
    expect(availablePitchersForDay(4, av, ROSTER)).toHaveLength(1); // free Day 4
  });

  it('assignments to off-path games are ignored (dormant)', () => {
    const assignments: Assignment[] = [
      { id: 'a1', gameId: 'offpath', playerId: 'p1', pitches: 80 },
    ];
    const dayMap = new Map<string, DayIndex>(); // game not on path
    const s = computeAvailability(assignments, ROSTER, dayMap).get('p1')!;
    expect(s.every((d) => d.kind === 'available')).toBe(true);
  });
});
