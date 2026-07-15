// Shared domain types — regular weekend tournament (USSSA innings rules).
//
// NOTE: The original Perfect Game / Gulf Coast World Series build (fixed
// schedule + bracket tracing + pitch-count rest table) is preserved but
// dormant — those files still live under src/ and are excluded from the build
// in tsconfig.json / vite.config.ts. Nothing here imports them.

export type Theme = 'light' | 'dark' | 'system';

export interface Player {
  id: string;
  name: string; // full name, e.g. "Campbell Jones"
  number?: number | null; // jersey number, optional
}

/** A manually entered game. Days for the rest rules come from `date`. */
export interface Game {
  id: string;
  date: string; // ISO 'YYYY-MM-DD'
  time?: string; // 24h 'HH:MM' from a time input, optional
  opponent?: string;
}

/** Innings pitched are tracked in OUTS (3 outs = 1 inning) per USSSA. */
export interface Assignment {
  id: string;
  gameId: string;
  playerId: string;
  outs: number; // innings pitched in this game, in outs (>= 0)
}

export type DayStatusKind = 'available' | 'pitched' | 'resting';

export type ViolationKind =
  | 'over-daily' // more than the daily inning cap
  | 'over-window' // more than 8 innings across a rolling 3 days
  | 'no-rest' // pitched the day after throwing > 3 innings
  | 'four-in-a-row'; // a 4th straight day

export type RestReason = 'window-full' | 'post-long-outing' | 'four-in-a-row';

/** Per-pitcher, per-date availability under the innings rules. */
export interface DateStatus {
  date: string;
  kind: DayStatusKind;
  outs: number; // innings thrown that date, in outs
  availableOuts: number; // innings still legal to throw that date, in outs
  violations: ViolationKind[];
  restReason?: RestReason;
  backOn?: string | null; // next date they can pitch (ISO), or null
}

export interface RootState {
  version: number;
  userName: string | null;
  theme: Theme;
  tournamentName: string;
  roster: Player[];
  games: Game[];
  assignments: Assignment[];
}
