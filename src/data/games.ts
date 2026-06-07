import type { Game } from '../types';
import { POOL_GAMES } from './schedule';
import { BRACKET_GAMES } from './brackets';

export const ALL_GAMES: Game[] = [...POOL_GAMES, ...BRACKET_GAMES];

export const GAME_BY_ID: Map<string, Game> = new Map(ALL_GAMES.map((g) => [g.id, g]));

export function getGame(id: string): Game | undefined {
  return GAME_BY_ID.get(id);
}

/** Numeric part of a game id, e.g. "GM31" -> 31. Used for short labels. */
export function gameNumber(id: string): string {
  return id.replace(/^[A-Za-z]+/, '');
}
