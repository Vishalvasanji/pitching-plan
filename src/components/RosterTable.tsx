import { ROSTER } from '../data/roster';
import { DAYS } from '../data/tournament';
import { useDerivedPlan } from '../state/selectors';
import { backOnLabel, violationLabel } from '../lib/engine/format';
import type { DayIndex, DayStatus } from '../types';

// Requested column letters: W (Wed) · TH (Thu) · F (Fri) · S (Sat).
const DAY_ABBR: Record<DayIndex, string> = { 1: 'W', 2: 'TH', 3: 'F', 4: 'S' };

/** Detail shown on hover (the dot itself is the at-a-glance signal). */
function cellTitle(s: DayStatus): string {
  if (s.kind === 'available') return 'Available';
  if (s.kind === 'pitched') {
    const v = s.violations.length ? ` — ${violationLabel(s.violations)}` : '';
    return `${s.pitches} pitches${v}`;
  }
  const back = backOnLabel(s.backOnDay);
  return back === 'Done' ? 'Resting — done for the tournament' : `Resting — back ${back}`;
}

export function RosterTable() {
  const { availability } = useDerivedPlan();

  return (
    <div className="roster__scroll">
      <table className="rtable rtable--compact">
        <thead>
          <tr>
            <th className="col-name">Pitcher</th>
            {DAYS.map((d) => (
              <th key={d.index} className="col-dot" title={`${d.weekday} ${d.date}`}>
                {DAY_ABBR[d.index]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROSTER.map((p) => {
            const st = availability.get(p.id)!;
            return (
              <tr key={p.id}>
                <td className="col-name">
                  <div className="player">
                    <span className="player__num">#{p.number}</span>
                    <span className="player__name">
                      {p.firstName} {p.lastName}
                    </span>
                  </div>
                </td>
                {DAYS.map((d) => {
                  const s = st[d.index - 1];
                  const available = s.kind === 'available';
                  const bad = s.violations.length > 0;
                  const title = cellTitle(s);
                  return (
                    <td key={d.index} className="col-dot">
                      <div
                        className={`availcell ${available ? 'availcell--yes' : 'availcell--no'} ${
                          bad ? 'availcell--bad' : ''
                        }`}
                        title={title}
                        aria-label={title}
                      >
                        {s.pitches > 0 ? s.pitches : ''}
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
