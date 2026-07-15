import { useRoster, useGames, useAvailability } from '../state/selectors';
import { dateParts, formatInnings, sortedGameDates } from '../lib/engine/innings';
import type { DateStatus, ViolationKind } from '../types';

const VIOLATION_TEXT: Record<ViolationKind, string> = {
  'over-daily': 'Over 7 IP/day',
  'over-window': 'Over 8 IP/3 days',
  'no-rest': 'No rest after >3 IP',
  'four-in-a-row': '4th straight day',
};

function cellTitle(s: DateStatus): string {
  if (s.kind === 'available') return `Available · ${formatInnings(s.availableOuts)} IP left`;
  if (s.kind === 'pitched') {
    const v = s.violations.length ? ` — ${s.violations.map((x) => VIOLATION_TEXT[x]).join(' · ')}` : '';
    const left = s.availableOuts > 0 ? ` · ${formatInnings(s.availableOuts)} left` : '';
    return `${formatInnings(s.outs)} IP${v}${left}`;
  }
  const reason =
    s.restReason === 'four-in-a-row'
      ? '3 days straight'
      : s.restReason === 'post-long-outing'
        ? 'threw > 3 IP'
        : '8-inning limit';
  const back = s.backOn ? ` · back ${dateParts(s.backOn).wd} ${dateParts(s.backOn).md}` : '';
  return `Resting — ${reason}${back}`;
}

export function AvailabilityTable() {
  const roster = useRoster();
  const games = useGames();
  const availability = useAvailability();
  const dates = sortedGameDates(games);

  if (dates.length === 0) {
    return <div className="empty-note">Add games first — availability fills in per date.</div>;
  }

  return (
    <div className="availwrap">
      <table className="availtable">
        <thead>
          <tr>
            <th className="col-name">Pitcher</th>
            {dates.map((d) => {
              const { wd, md } = dateParts(d);
              return (
                <th key={d} className="acol">
                  <div className="dcol">
                    <span className="dcol__wd">{wd}</span>
                    <span className="dcol__md">{md}</span>
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {roster.map((p) => {
            const byDate = availability.get(p.id);
            return (
              <tr key={p.id}>
                <td className="col-name">
                  <div className="player">
                    {p.number != null && <span className="player__num">#{p.number}</span>}
                    <span className="player__name">{p.name}</span>
                  </div>
                </td>
                {dates.map((d) => {
                  const s = byDate?.get(d);
                  if (!s) return <td key={d} className="acol" />;
                  const bad = s.violations.length > 0;
                  const cls =
                    s.kind === 'available'
                      ? 'availcell--yes'
                      : s.kind === 'pitched'
                        ? 'availcell--pitched'
                        : 'availcell--no';
                  return (
                    <td key={d} className="acol">
                      <div
                        className={`availcell ${cls} ${bad ? 'availcell--bad' : ''}`}
                        title={cellTitle(s)}
                        aria-label={cellTitle(s)}
                      >
                        {s.kind === 'pitched' ? formatInnings(s.outs) : ''}
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
