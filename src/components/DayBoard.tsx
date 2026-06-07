import { useState } from 'react';
import { DAYS } from '../data/tournament';
import { useDerivedPlan } from '../state/selectors';
import { GameCard } from './GameCard';
import { AddPitcherSheet } from './AddPitcherSheet';
import type { DayIndex } from '../types';

export function DayBoard() {
  const { gamesByDay } = useDerivedPlan();
  const [addFor, setAddFor] = useState<{ gameId: string; day: DayIndex } | null>(null);

  return (
    <>
      <div className="board">
        {DAYS.map((day) => (
          <div className="day" key={day.index}>
            <div className="day__header">
              <div>
                <span className="day__title">{day.label}</span>{' '}
                <span className="day__date">
                  {day.weekday} {day.date}
                </span>
              </div>
              <span className="day__phase">{day.phase}</span>
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
