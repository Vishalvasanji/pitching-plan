import type { Player } from '../types';

// LAK Lugnuts 14EY roster. Every player is pitch-eligible (the coach decides
// who actually pitches). Ordered alphabetically by last name for the table.
export const ROSTER: Player[] = [
  { id: 'p3', number: 3, firstName: 'Alek', lastName: 'Biletnikoff', position: '2B' },
  { id: 'p9', number: 9, firstName: 'George', lastName: 'Brost', position: 'RHP' },
  { id: 'p10', number: 10, firstName: 'Bryce', lastName: 'Holden', position: 'RHP' },
  { id: 'p44', number: 44, firstName: 'Hudson', lastName: 'Hymel', position: '1B' },
  { id: 'p27', number: 27, firstName: 'Campbell', lastName: 'Jones', position: 'SS' },
  { id: 'p67', number: 67, firstName: 'Thomas', lastName: 'Jones', position: 'SS' },
  { id: 'p5', number: 5, firstName: 'Harvin', lastName: 'Landry', position: 'RHP' },
  { id: 'p47', number: 47, firstName: 'Vincent', lastName: 'Petry', position: 'C' },
  { id: 'p13', number: 13, firstName: 'Brody', lastName: 'Shepherd', position: 'SS' },
  { id: 'p24', number: 24, firstName: 'Ryne', lastName: 'Sweat', position: 'OF' },
  { id: 'p20', number: 20, firstName: 'Flynn', lastName: 'Thiebaud', position: 'RHP' },
  { id: 'p25', number: 25, firstName: 'Jaylen', lastName: 'Vasanji', position: '2B' },
  { id: 'p1', number: 1, firstName: 'Brayden', lastName: 'Yarnall', position: '1B' },
];

export const PLAYER_BY_ID: Map<string, Player> = new Map(ROSTER.map((p) => [p.id, p]));
