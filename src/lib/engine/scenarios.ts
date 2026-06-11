import type { ArmStatus, BracketId, Game, GameResult, PitchRole, SlotArm } from '../../types';
import { GAME_BY_ID, gameNumber } from '../../data/games';
import { ENTRY, ASSUMED_SEED } from '../../data/brackets';

// The coach plans ~80–90 pitches a game; 85 is the working number for a start.
// (At 66+ pitches the rest table forces 4 days off — so a start ends a weekend.)
export const GAME_PITCHES = 85;

export interface PitcherTier {
  playerId: string;
  rank: number; // lower = used first
  role: PitchRole;
  defaultStatus: ArmStatus;
}

// Tiers from the coach: Campbell/Brody are 1a/1b, then Flynn/Harvin/Sweat,
// Jaylen/Brost are inning-eaters, Bryce/Vinny are hurt (emergency only), and
// Brayden can't pitch.
export const PITCHER_TIERS: PitcherTier[] = [
  { playerId: 'p27', rank: 1, role: 'ace', defaultStatus: 'available' }, // Campbell Jones
  { playerId: 'p13', rank: 2, role: 'ace', defaultStatus: 'available' }, // Brody Shepherd
  { playerId: 'p20', rank: 3, role: 'starter', defaultStatus: 'available' }, // Flynn Thiebaud
  { playerId: 'p5', rank: 4, role: 'starter', defaultStatus: 'available' }, // Harvin Landry
  { playerId: 'p24', rank: 5, role: 'starter', defaultStatus: 'available' }, // Ryne Sweat
  { playerId: 'p25', rank: 6, role: 'eater', defaultStatus: 'available' }, // Jaylen Vasanji
  { playerId: 'p9', rank: 7, role: 'eater', defaultStatus: 'available' }, // George Brost
  { playerId: 'p10', rank: 8, role: 'emergency', defaultStatus: 'emergency' }, // Bryce Holden
  { playerId: 'p47', rank: 9, role: 'emergency', defaultStatus: 'emergency' }, // Vinny Petry
  { playerId: 'p1', rank: 99, role: 'no-pitch', defaultStatus: 'out' }, // Brayden Yarnall
];

export const TIER_BY_ID: Map<string, PitcherTier> = new Map(
  PITCHER_TIERS.map((t) => [t.playerId, t]),
);

export function effectiveStatus(
  playerId: string,
  statusMap: Record<string, ArmStatus>,
): ArmStatus {
  const tier = TIER_BY_ID.get(playerId);
  if (!tier) return 'out';
  if (tier.role === 'no-pitch') return 'out'; // never pitches; not user-toggleable
  return statusMap[playerId] ?? tier.defaultStatus;
}

function gm(id: string): Game {
  const g = GAME_BY_ID.get(id);
  if (!g) throw new Error(`Unknown game: ${id}`);
  return g;
}

export interface ScenarioStep {
  gameId: string;
  result: GameResult; // the assumed result on this road (W to advance; the single L)
}

export interface Scenario {
  id: string;
  bracket: BracketId;
  lossGameId: string | null; // the one game you lose, or null for a sweep
  steps: ScenarioStep[];
  games: Game[];
  fridayCount: number;
  saturdayCount: number;
  title: string;
  subtitle: string;
}

/** What a game is in the bracket — used as a per-row descriptor. */
export function roundLabel(game: Game): string {
  if (game.isChampionship || game.winnerTo === 'champion') return 'Championship';
  if (game.loserTo === 'eliminated') return 'Elimination';
  return "Winners' bracket";
}

function dayWord(day: number): string {
  return day === 3 ? 'Fri' : day === 4 ? 'Sat' : `Day ${day}`;
}

// Every result path that ends as champion: at most one loss (and only on the
// winners' side — once you've lost, a second loss eliminates you, so you must
// win out). Win branch explored first.
function enumeratePaths(entry: string): ScenarioStep[][] {
  const out: ScenarioStep[][] = [];
  const walk = (gameId: string, losses: number, acc: ScenarioStep[]) => {
    const g = gm(gameId);
    if (!g.winnerTo || g.winnerTo === 'champion') {
      out.push([...acc, { gameId, result: 'W' }]); // win the final
      return;
    }
    walk(g.winnerTo, losses, [...acc, { gameId, result: 'W' }]);
    if (losses < 1 && g.loserTo && g.loserTo !== 'eliminated') {
      walk(g.loserTo, losses + 1, [...acc, { gameId, result: 'L' }]);
    }
  };
  walk(entry, 0, []);
  return out;
}

export function buildScenarios(bracket: BracketId): Scenario[] {
  const entry = ENTRY[ASSUMED_SEED[bracket]];
  const scenarios = enumeratePaths(entry).map((steps): Scenario => {
    const games = steps.map((s) => gm(s.gameId));
    const lossStep = steps.find((s) => s.result === 'L');
    const lossGameId = lossStep ? lossStep.gameId : null;
    const fridayCount = games.filter((g) => g.day === 3).length;
    const saturdayCount = games.filter((g) => g.day === 4).length;

    let title: string;
    let subtitle: string;
    if (!lossGameId) {
      title = 'Win out Friday';
      subtitle = `Sweep all ${fridayCount} Friday games — the championship is your only Saturday game.`;
    } else {
      const lg = gm(lossGameId);
      title = `Lose Game ${gameNumber(lossGameId)}`;
      subtitle = `Drop the ${dayWord(lg.day)} ${lg.time} game, then win ${saturdayCount} straight Saturday to the title.`;
    }

    return {
      id: `${bracket}-${lossGameId ?? 'sweep'}`,
      bracket,
      lossGameId,
      steps,
      games,
      fridayCount,
      saturdayCount,
      title,
      subtitle,
    };
  });

  // Easiest road (fewest Saturday games) first; the gauntlet last.
  scenarios.sort((a, b) => a.saturdayCount - b.saturdayCount || a.games.length - b.games.length);
  return scenarios;
}

export interface PlannedGame {
  gameId: string;
  game: Game;
  result: GameResult;
  arms: SlotArm[];
  overridden: boolean;
  candidates: string[]; // legal picks here: not 'out', not already used on this road
}

export type Feasibility = 'comfortable' | 'covered' | 'tight' | 'short';

export interface ScenarioPlan {
  scenario: Scenario;
  games: PlannedGame[];
  reserveFront: string[];
  reserveEater: string[];
  reserveEmergency: string[];
  feasibility: Feasibility;
  shortBy: number;
  usedEmergency: boolean;
}

function rankedIds(filter: (t: PitcherTier) => boolean): string[] {
  return PITCHER_TIERS.filter(filter)
    .sort((a, b) => a.rank - b.rank)
    .map((t) => t.playerId);
}

/**
 * Greedy, tier-ordered arm allocation down one road: best available arm to each
 * game in time order; an arm that throws is spent for the weekend. Falls back to
 * emergency (hurt) arms only when the available pool runs out. Manual overrides
 * are honoured and cascade to the suggestions that follow.
 */
export function planScenario(
  scenario: Scenario,
  statusMap: Record<string, ArmStatus>,
  overrides: Record<string, SlotArm[]> | undefined,
): ScenarioPlan {
  const used = new Set<string>();
  const status = (id: string) => effectiveStatus(id, statusMap);
  const games: PlannedGame[] = [];

  for (const step of scenario.steps) {
    const candidates = PITCHER_TIERS.filter(
      (t) => status(t.playerId) !== 'out' && !used.has(t.playerId),
    )
      .sort((a, b) => {
        const ea = status(a.playerId) === 'emergency' ? 1 : 0;
        const eb = status(b.playerId) === 'emergency' ? 1 : 0;
        return ea - eb || a.rank - b.rank; // available before emergency, then tier
      })
      .map((t) => t.playerId);

    const ov = overrides?.[step.gameId]?.filter(
      (a) => status(a.playerId) !== 'out' && !used.has(a.playerId),
    );

    let arms: SlotArm[];
    let overridden = false;
    if (ov && ov.length) {
      arms = ov;
      overridden = true;
    } else {
      const pick =
        rankedIds((t) => status(t.playerId) === 'available').find((id) => !used.has(id)) ??
        rankedIds((t) => status(t.playerId) === 'emergency').find((id) => !used.has(id));
      arms = pick ? [{ playerId: pick, pitches: GAME_PITCHES }] : [];
    }

    for (const a of arms) used.add(a.playerId);
    games.push({
      gameId: step.gameId,
      game: gm(step.gameId),
      result: step.result,
      arms,
      overridden,
      candidates,
    });
  }

  const reserveByRole = (match: (r: PitchRole) => boolean) =>
    rankedIds((t) => match(t.role) && status(t.playerId) !== 'out').filter((id) => !used.has(id));

  const reserveFront = reserveByRole((r) => r === 'ace' || r === 'starter');
  const reserveEater = reserveByRole((r) => r === 'eater');
  const reserveEmergency = reserveByRole((r) => r === 'emergency');

  const usedEmergency = games.some((g) =>
    g.arms.some((a) => TIER_BY_ID.get(a.playerId)?.role === 'emergency'),
  );
  const shortBy = games.filter((g) => g.arms.length === 0).length;

  let feasibility: Feasibility;
  if (shortBy > 0) feasibility = 'short';
  else if (usedEmergency) feasibility = 'tight';
  else if (reserveFront.length + reserveEater.length >= 1) feasibility = 'comfortable';
  else feasibility = 'covered';

  return {
    scenario,
    games,
    reserveFront,
    reserveEater,
    reserveEmergency,
    feasibility,
    shortBy,
    usedEmergency,
  };
}
