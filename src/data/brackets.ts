import type { BracketId, Game, GameSlot } from '../types';
import { toMinutes } from '../lib/time';

const seed = (n: number): GameSlot => ({ kind: 'seed', seed: n });
const win = (from: string): GameSlot => ({ kind: 'winner', from });
const lose = (from: string): GameSlot => ({ kind: 'loser', from });

interface BG {
  id: string;
  day: 3 | 4;
  time: string;
  field: string;
  bracket: BracketId;
  slot1: GameSlot;
  slot2: GameSlot;
  winnerTo: string | 'champion';
  loserTo: string | 'eliminated';
  championship?: boolean;
}

function bg(g: BG): Game {
  return {
    id: g.id,
    day: g.day,
    phase: 'bracket',
    bracket: g.bracket,
    time: g.time,
    sortMinutes: toMinutes(g.time),
    field: g.field,
    slot1: g.slot1,
    slot2: g.slot2,
    winnerTo: g.winnerTo,
    loserTo: g.loserTo,
    isChampionship: g.championship,
  };
}

const SWE7 = 'SW Escambia Field 7';
const SWE8 = 'SW Escambia Field 8';
const FOLEY = 'Foley HS Baseball';
const LOX = 'Loxley 3';

// Double-elimination advancement verified against the printed brackets.
export const BRACKET_GAMES: Game[] = [
  // ---------- RED (seeds 1–6) ----------
  bg({ id: 'GM31', day: 3, time: '8:30 AM', field: SWE7, bracket: 'red', slot1: seed(4), slot2: seed(5), winnerTo: 'GM33', loserTo: 'GM35' }),
  bg({ id: 'GM32', day: 3, time: '8:30 AM', field: SWE8, bracket: 'red', slot1: seed(3), slot2: seed(6), winnerTo: 'GM34', loserTo: 'GM36' }),
  bg({ id: 'GM33', day: 3, time: '10:30 AM', field: SWE7, bracket: 'red', slot1: seed(1), slot2: win('GM31'), winnerTo: 'GM37', loserTo: 'GM36' }),
  bg({ id: 'GM34', day: 3, time: '10:30 AM', field: SWE8, bracket: 'red', slot1: seed(2), slot2: win('GM32'), winnerTo: 'GM37', loserTo: 'GM35' }),
  bg({ id: 'GM37', day: 3, time: '12:30 PM', field: SWE8, bracket: 'red', slot1: win('GM33'), slot2: win('GM34'), winnerTo: 'GM40', loserTo: 'GM39' }),
  bg({ id: 'GM35', day: 4, time: '8:30 AM', field: FOLEY, bracket: 'red', slot1: lose('GM34'), slot2: lose('GM31'), winnerTo: 'GM38', loserTo: 'eliminated' }),
  bg({ id: 'GM36', day: 4, time: '10:30 AM', field: FOLEY, bracket: 'red', slot1: lose('GM33'), slot2: lose('GM32'), winnerTo: 'GM38', loserTo: 'eliminated' }),
  bg({ id: 'GM38', day: 4, time: '12:30 PM', field: FOLEY, bracket: 'red', slot1: win('GM35'), slot2: win('GM36'), winnerTo: 'GM39', loserTo: 'eliminated' }),
  bg({ id: 'GM39', day: 4, time: '2:30 PM', field: FOLEY, bracket: 'red', slot1: lose('GM37'), slot2: win('GM38'), winnerTo: 'GM40', loserTo: 'eliminated' }),
  bg({ id: 'GM40', day: 4, time: '4:30 PM', field: FOLEY, bracket: 'red', slot1: win('GM37'), slot2: win('GM39'), winnerTo: 'champion', loserTo: 'eliminated', championship: true }),

  // ---------- BLUE (seeds 7–11) ----------
  bg({ id: 'GM41', day: 3, time: '8:30 AM', field: FOLEY, bracket: 'blue', slot1: seed(10), slot2: seed(11), winnerTo: 'GM42', loserTo: 'GM44' }),
  bg({ id: 'GM42', day: 3, time: '10:30 AM', field: FOLEY, bracket: 'blue', slot1: seed(7), slot2: win('GM41'), winnerTo: 'GM45', loserTo: 'GM46' }),
  bg({ id: 'GM43', day: 3, time: '12:30 PM', field: FOLEY, bracket: 'blue', slot1: seed(8), slot2: seed(9), winnerTo: 'GM45', loserTo: 'GM44' }),
  bg({ id: 'GM45', day: 3, time: '2:30 PM', field: FOLEY, bracket: 'blue', slot1: win('GM42'), slot2: win('GM43'), winnerTo: 'GM48', loserTo: 'GM47' }),
  bg({ id: 'GM44', day: 4, time: '8:30 AM', field: SWE7, bracket: 'blue', slot1: lose('GM43'), slot2: lose('GM41'), winnerTo: 'GM46', loserTo: 'eliminated' }),
  bg({ id: 'GM46', day: 4, time: '10:30 AM', field: SWE7, bracket: 'blue', slot1: lose('GM42'), slot2: win('GM44'), winnerTo: 'GM47', loserTo: 'eliminated' }),
  bg({ id: 'GM47', day: 4, time: '12:30 PM', field: SWE7, bracket: 'blue', slot1: lose('GM45'), slot2: win('GM46'), winnerTo: 'GM48', loserTo: 'eliminated' }),
  bg({ id: 'GM48', day: 4, time: '2:30 PM', field: SWE7, bracket: 'blue', slot1: win('GM45'), slot2: win('GM47'), winnerTo: 'champion', loserTo: 'eliminated', championship: true }),

  // ---------- WHITE (seeds 12–15) ----------
  bg({ id: 'GM49', day: 3, time: '8:30 AM', field: LOX, bracket: 'white', slot1: seed(12), slot2: seed(15), winnerTo: 'GM51', loserTo: 'GM52' }),
  bg({ id: 'GM50', day: 3, time: '10:30 AM', field: LOX, bracket: 'white', slot1: seed(13), slot2: seed(14), winnerTo: 'GM51', loserTo: 'GM52' }),
  bg({ id: 'GM51', day: 3, time: '12:30 PM', field: LOX, bracket: 'white', slot1: win('GM49'), slot2: win('GM50'), winnerTo: 'GM54', loserTo: 'GM53' }),
  bg({ id: 'GM52', day: 4, time: '8:30 AM', field: SWE8, bracket: 'white', slot1: lose('GM50'), slot2: lose('GM49'), winnerTo: 'GM53', loserTo: 'eliminated' }),
  bg({ id: 'GM53', day: 4, time: '10:30 AM', field: SWE8, bracket: 'white', slot1: lose('GM51'), slot2: win('GM52'), winnerTo: 'GM54', loserTo: 'eliminated' }),
  bg({ id: 'GM54', day: 4, time: '12:30 PM', field: SWE8, bracket: 'white', slot1: win('GM51'), slot2: win('GM53'), winnerTo: 'champion', loserTo: 'eliminated', championship: true }),
];

// Where each seed first plays.
export const ENTRY: Record<number, string> = {
  1: 'GM33', 2: 'GM34', 3: 'GM32', 4: 'GM31', 5: 'GM31', 6: 'GM32',
  7: 'GM42', 8: 'GM43', 9: 'GM43', 10: 'GM41', 11: 'GM41',
  12: 'GM49', 13: 'GM50', 14: 'GM50', 15: 'GM49',
};

export const BRACKET_SEEDS: Record<BracketId, number[]> = {
  red: [1, 2, 3, 4, 5, 6],
  blue: [7, 8, 9, 10, 11],
  white: [12, 13, 14, 15],
};

// The app assumes a low seed that must play the opening (extra) game — the
// worst-case, most-games scenario. One constant, trivially adjustable.
export const ASSUMED_SEED: Record<BracketId, number> = { red: 6, blue: 11, white: 15 };

export const BRACKET_LABELS: Record<BracketId, string> = {
  red: 'Red',
  blue: 'Blue',
  white: 'White',
};

export const BRACKET_SEED_RANGE: Record<BracketId, string> = {
  red: 'Seeds 1–6',
  blue: 'Seeds 7–11',
  white: 'Seeds 12–15',
};
