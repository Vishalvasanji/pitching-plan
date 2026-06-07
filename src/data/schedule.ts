import type { Game } from '../types';
import { toMinutes } from '../lib/time';

// Pool play (Days 1–2). All four games from the team schedule, fixed.
function pool(
  id: string,
  day: 1 | 2,
  time: string,
  homeAway: 'home' | 'away',
  opponent: string,
  field: string,
): Game {
  return {
    id,
    day,
    phase: 'pool',
    time,
    sortMinutes: toMinutes(time),
    field,
    opponent,
    homeAway,
  };
}

export const POOL_GAMES: Game[] = [
  pool('G1', 1, '12:00 PM', 'away', 'Texas Angels NB 13u Cantu', 'Foley HS Baseball'),
  pool('G2', 1, '3:30 PM', 'away', 'River Valley Drillers', 'Foley HS Baseball'),
  pool('G3', 2, '8:30 AM', 'home', 'Premier Baseball Club', 'Loxley 3'),
  pool('G4', 2, '12:00 PM', 'away', 'Marauder Baseball Club', 'Loxley 3'),
];
