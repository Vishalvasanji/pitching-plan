import { describe, it, expect } from 'vitest';
import { entryGame, perDayCounts, tracePath, worstCasePath } from '../lib/engine/bracket';

describe('worstCasePath — assumed-seed worst cases', () => {
  it('Red #6: 6 games (Day 3: 2, Day 4: 4)', () => {
    const path = worstCasePath(entryGame('red'), 0);
    expect(path).toEqual(['GM32', 'GM34', 'GM35', 'GM38', 'GM39', 'GM40']);
    expect(perDayCounts(path)).toEqual({ 1: 0, 2: 0, 3: 2, 4: 4 });
  });

  it('Blue #11: 5 games (Day 3: 1, Day 4: 4)', () => {
    const path = worstCasePath(entryGame('blue'), 0);
    expect(path).toEqual(['GM41', 'GM44', 'GM46', 'GM47', 'GM48']);
    expect(perDayCounts(path)).toEqual({ 1: 0, 2: 0, 3: 1, 4: 4 });
  });

  it('White #15: 4 games (Day 3: 1, Day 4: 3)', () => {
    const path = worstCasePath(entryGame('white'), 0);
    expect(path).toEqual(['GM49', 'GM52', 'GM53', 'GM54']);
    expect(perDayCounts(path)).toEqual({ 1: 0, 2: 0, 3: 1, 4: 3 });
  });
});

describe('tracePath', () => {
  it('starts at the assumed-seed entry game, in progress', () => {
    const t = tracePath('red', {});
    expect(t.current).toBe('GM32');
    expect(t.played).toHaveLength(0);
    expect(t.losses).toBe(0);
    expect(t.outcome).toBe('in-progress');
  });

  it('marking a win advances and prunes the losers-bracket gauntlet', () => {
    const t = tracePath('red', { GM32: 'W' });
    expect(t.current).toBe('GM34');
    expect(t.losses).toBe(0);
    const ahead = worstCasePath(t.current!, t.losses);
    expect(ahead).toEqual(['GM34', 'GM35', 'GM38', 'GM39', 'GM40']);
    expect(ahead).not.toContain('GM36');
  });

  it('marking a loss reroutes into the losers bracket as a forced win-out', () => {
    const t = tracePath('red', { GM32: 'L' });
    expect(t.current).toBe('GM36');
    expect(t.losses).toBe(1);
    const ahead = worstCasePath(t.current!, t.losses);
    expect(ahead).toEqual(['GM36', 'GM38', 'GM39', 'GM40']); // no branching after a loss
  });

  it('reaches champion on the undefeated path (fewest games)', () => {
    const t = tracePath('red', { GM32: 'W', GM34: 'W', GM37: 'W', GM40: 'W' });
    expect(t.outcome).toBe('champion');
    expect(t.current).toBeNull();
    expect(t.played).toHaveLength(4);
  });

  it('a second loss eliminates the team', () => {
    const t = tracePath('red', { GM32: 'L', GM36: 'L' });
    expect(t.outcome).toBe('eliminated');
    expect(t.losses).toBe(2);
    expect(t.current).toBeNull();
  });

  it('ignores orphaned results not on the traced route', () => {
    // GM50 belongs to a different bracket; should be ignored entirely.
    const t = tracePath('red', { GM32: 'W', GM50: 'W' });
    expect(t.current).toBe('GM34');
    expect(t.played.map((p) => p.gameId)).toEqual(['GM32']);
  });
});
