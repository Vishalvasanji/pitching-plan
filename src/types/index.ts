// Shared domain types for the pitching-plan simulator.

export type DayIndex = 1 | 2 | 3 | 4;
export type BracketId = 'red' | 'blue' | 'white';
export type GameResult = 'W' | 'L';
export type GamePhase = 'pool' | 'bracket';
export type Theme = 'light' | 'dark' | 'system';

export interface Player {
  id: string; // stable id, e.g. "p25"
  number: number; // jersey #
  firstName: string;
  lastName: string;
  position: string; // informational only — every player is pitch-eligible
}

/** Where a bracket game's two competitors come from (for display only). */
export type GameSlot =
  | { kind: 'seed'; seed: number }
  | { kind: 'winner'; from: string }
  | { kind: 'loser'; from: string };

export interface Game {
  id: string; // "G1".."G4" pool; "GM31".. bracket
  day: DayIndex;
  phase: GamePhase;
  bracket?: BracketId; // bracket games only
  time: string; // "8:30 AM"
  sortMinutes: number; // minutes since midnight, for chronological ordering
  field: string;

  // pool display
  opponent?: string;
  homeAway?: 'home' | 'away';

  // bracket display + advancement graph
  slot1?: GameSlot;
  slot2?: GameSlot;
  winnerTo?: string | 'champion';
  loserTo?: string | 'eliminated';
  isChampionship?: boolean;
}

export interface Assignment {
  id: string; // uuid
  gameId: string;
  playerId: string;
  pitches: number; // planned pitch count for THIS game (>= 0)
}

export type DayStatusKind = 'available' | 'pitched' | 'resting';
export type ViolationKind = 'over-daily-max' | 'rest-violation' | 'three-in-a-row';
export type RestReason = 'rest-window' | 'three-in-a-row';

export interface DayStatus {
  day: DayIndex;
  kind: DayStatusKind;
  pitches: number; // 0 unless kind === 'pitched'
  violations: ViolationKind[]; // only when pitched
  restReason?: RestReason; // only when resting
  backOnDay?: number; // only when resting; 1..5 (5 = after tournament)
  gameIds: string[]; // games this player is assigned on this day
}

export interface PlanData {
  selectedBracket: BracketId;
  results: Record<string, GameResult>; // gameId -> W/L for the team's path
  assignments: Assignment[];
}

export interface RootState {
  version: number;
  userName: string | null;
  plan: PlanData;
  theme: Theme;
}
