import { describe, it, expect } from 'vitest';
import { buildScenarios, planScenario, type ScenarioPlan } from '../lib/engine/scenarios';
import type { ArmStatus, SlotArm } from '../types';

const champArm = (plan: ScenarioPlan): string | undefined =>
  plan.games.find((g) => g.game.isChampionship || g.game.winnerTo === 'champion')!.arms[0]?.playerId;

describe('blue bracket scenarios', () => {
  const scenarios = buildScenarios('blue');

  it('enumerates the four championship roads, easiest first', () => {
    expect(scenarios).toHaveLength(4);
    expect(scenarios[0].lossGameId).toBeNull(); // sweep
    expect(scenarios[0].saturdayCount).toBe(1);
    expect(scenarios[3].saturdayCount).toBe(4); // lose the opener -> 4 to win Saturday
  });

  it('the sweep plays four games ending in the championship', () => {
    expect(scenarios[0].games.map((g) => g.id)).toEqual(['GM41', 'GM42', 'GM45', 'GM48']);
  });

  it('the lose-opener road is four straight Saturday elimination games', () => {
    const hard = scenarios[3];
    expect(hard.games.map((g) => g.id)).toEqual(['GM41', 'GM44', 'GM46', 'GM47', 'GM48']);
    expect(hard.games.filter((g) => g.day === 4)).toHaveLength(4);
  });

  it('auto-suggests front-line arms in tier order and never uses Brayden', () => {
    const plan = planScenario(scenarios[0], {}, undefined);
    expect(plan.games.map((g) => g.arms[0].playerId)).toEqual(['p27', 'p13', 'p20', 'p5']);
    const all = plan.games.flatMap((g) => g.arms.map((a) => a.playerId));
    expect(all).not.toContain('p1'); // Brayden can't pitch
    expect(plan.reserveFront).toContain('p24'); // Sweat spare
    expect(plan.feasibility).toBe('comfortable');
  });

  it('saves a weaker arm for the title the harder the road', () => {
    expect(champArm(planScenario(scenarios[0], {}, undefined))).toBe('p5'); // Harvin after a sweep
    expect(champArm(planScenario(scenarios[3], {}, undefined))).toBe('p24'); // Sweat on the gauntlet
  });

  it('does not touch hurt arms unless needed', () => {
    const plan = planScenario(scenarios[3], {}, undefined);
    const all = plan.games.flatMap((g) => g.arms.map((a) => a.playerId));
    expect(all).not.toContain('p10'); // Bryce
    expect(all).not.toContain('p47'); // Vinny
    expect(plan.usedEmergency).toBe(false);
  });

  it('marking arms out forces an emergency arm and flags the risk', () => {
    const out: Record<string, ArmStatus> = { p20: 'out', p5: 'out', p24: 'out' };
    const plan = planScenario(scenarios[3], out, undefined);
    expect(plan.games.flatMap((g) => g.arms).map((a) => a.playerId)).toHaveLength(5);
    expect(plan.usedEmergency).toBe(true);
    expect(plan.feasibility).toBe('tight');
  });

  it('honours a manual override and cascades the rest', () => {
    const override: Record<string, SlotArm[]> = { GM41: [{ playerId: 'p13', pitches: 85 }] };
    const plan = planScenario(scenarios[0], {}, override);
    expect(plan.games[0].arms[0].playerId).toBe('p13'); // Brody pinned to the opener
    expect(plan.games[0].overridden).toBe(true);
    expect(plan.games[1].arms[0].playerId).toBe('p27'); // Campbell slides to the next game
  });
});
