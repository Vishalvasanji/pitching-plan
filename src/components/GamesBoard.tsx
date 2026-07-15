import { useState } from 'react';
import { DAYS } from '../data/tournament';
import { useDerivedPlan } from '../state/selectors';
import { GameCard } from './GameCard';
import { AddPitcherSheet } from './AddPitcherSheet';
import type { DayIndex } from '../types';

/** Renders the game cards for a subset of days (e.g. pool [1,2] or bracket [3,4]). */
export function GamesBoard({ days }: { days: DayIndex[] }) {
  const { gamesByDay } = useDerivedPlan();
  const [addFor, setAddFor] = useState<{ gameId: string; day: DayIndex } | null>(null);
  const shown = DAYS.filter((d) => days.includes(d.index));

  return (
    <>
      <div className="board">
        {shown.map((day) => (
          <div className="day" key={day.index}>
            <div className="day__header">
              <span className="day__title">{day.label}</span>
              <span className="day__date">
                {day.weekday} {day.date}
              </span>
            </div>
            <div className="day__games">
              {gamesByDay[day.index].length === 0 ? (
                <div className="empty-note">No games on this path.</div>
              ) : (
                gamesByDay[day.index].map((pg) => (
                  <GameCard
                    key={pg.game.id}
                    pg={pg}
                    onAdd={() => setAddFor({ gameId: pg.game.id, day: day.index })}
                  />
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      <AddPitcherSheet
        open={!!addFor}
        gameId={addFor?.gameId ?? ''}
        day={addFor?.day ?? 1}
        onClose={() => setAddFor(null)}
      />
    </>
  );
}
