import type { DayIndex, GamePhase } from '../types';

export interface DayMeta {
  index: DayIndex;
  label: string; // "Day 1"
  weekday: string; // "Wed"
  date: string; // "Jun 10"
  phase: GamePhase;
}

// 4-day PG Gulf Coast World Series (Gulf Shores, AL), Jun 10–13, 2026.
export const DAYS: DayMeta[] = [
  { index: 1, label: 'Day 1', weekday: 'Wed', date: 'Jun 10', phase: 'pool' },
  { index: 2, label: 'Day 2', weekday: 'Thu', date: 'Jun 11', phase: 'pool' },
  { index: 3, label: 'Day 3', weekday: 'Fri', date: 'Jun 12', phase: 'bracket' },
  { index: 4, label: 'Day 4', weekday: 'Sat', date: 'Jun 13', phase: 'bracket' },
];

export const TOURNAMENT_NAME = '14U PG Gulf Coast World Series';
export const TOURNAMENT_DATES = 'Jun 10–13, 2026 · Gulf Shores, AL';

// Pitch-count rest rule table (GCWS), for display in a rules reference.
export const REST_RULE_TABLE: { range: string; rest: string }[] = [
  { range: '1–20 pitches', rest: '0 days rest' },
  { range: '21–35 pitches', rest: '1 day rest' },
  { range: '36–50 pitches', rest: '2 days rest' },
  { range: '51–65 pitches', rest: '3 days rest' },
  { range: '66+ pitches', rest: '4 days rest' },
];
