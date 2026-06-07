// GCWS 14U pitch-count rules. These override the generic PG rules.

export const DAILY_MAX = 95; // max pitches per pitcher per day (14U)
export const NUM_DAYS = 4;

/**
 * Required days of rest after throwing `pitches` in a single day.
 * "N days rest" means the next legal pitching day is outingDay + N + 1.
 */
export function restDays(pitches: number): 0 | 1 | 2 | 3 | 4 {
  if (pitches <= 20) return 0; // includes 0 (no outing)
  if (pitches <= 35) return 1;
  if (pitches <= 50) return 2;
  if (pitches <= 65) return 3;
  return 4;
}
