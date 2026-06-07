import { ROSTER } from '../data/roster';
import { DAYS } from '../data/tournament';
import { useDerivedPlan } from '../state/selectors';
import { backOnLabel, gameMatchupShort, violationLabel } from '../lib/engine/format';
import type { DayStatus } from '../types';

function shortTime(t: string): string {
  return t.replace(' AM', 'a').replace(' PM', 'p');
}

function StatusCell({ status }: { status: DayStatus }) {
  if (status.kind === 'pitched') {
    const bad = status.violations.length > 0;
    return (
      <div className="cell cell--pitched">
        <span className="cell__big" style={bad ? { color: 'var(--red-ink)' } : undefined}>
          {status.pitches}
        </span>
        <span className={`cell__sub ${bad ? 'cell__sub--violation' : ''}`}>
          {bad ? violationLabel(status.violations) : 'pitches'}
        </span>
      </div>
    );
  }
  if (status.kind === 'resting') {
    const back = backOnLabel(status.backOnDay);
    return (
      <div className="cell">
        <span className="badge badge--amber">{back === 'Done' ? 'Done' : 'Rest'}</span>
        {back !== 'Done' && <span className="cell__sub">back {back}</span>}
      </div>
    );
  }
  return (
    <div className="cell">
      <span className="badge badge--green">
        <span className="badge__dot" />
        Available
      </span>
    </div>
  );
}

export function RosterTable() {
  const { gamesByDay, availability } = useDerivedPlan();

  return (
    <div className="roster__scroll">
      <table className="rtable">
        <thead>
          <tr>
            <th className="col-name">Pitcher</th>
            {DAYS.map((d) => (
              <th key={d.index} className="col-day">
                <div className="dayhead__top">
                  <span className="dayhead__day">{d.label}</span>
                  <span className="dayhead__date">{d.weekday}</span>
                </div>
                <div className="dayhead__games">
                  {gamesByDay[d.index].length === 0 ? (
                    <span className="dayhead__empty">—</span>
                  ) : (
                    gamesByDay[d.index].map((pg) => (
                      <span
                        key={pg.game.id}
                        className={`gchip ${pg.role === 'projected' ? 'gchip--projected' : ''}`}
                        title={`${pg.game.time} · ${gameMatchupShort(pg.game)} · ${pg.game.field}${
                          pg.game.isChampionship ? ' · Championship' : ''
                        }`}
                      >
                        {pg.game.isChampionship && '🏆 '}
                        <span className="gchip__time">{shortTime(pg.game.time)}</span>{' '}
                        {gameMatchupShort(pg.game)}
                      </span>
                    ))
                  )}
                </div>
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
                {DAYS.map((d) => (
                  <td key={d.index} className="col-day">
                    <StatusCell status={st[d.index - 1]} />
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
