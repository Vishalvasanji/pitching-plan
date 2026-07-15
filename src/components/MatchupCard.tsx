import { useState } from 'react';
import { useStore } from '../state/store';
import { useGameAssignments } from '../state/selectors';
import { PitcherRow } from './PitcherRow';
import { PitcherSheet } from './PitcherSheet';
import { AddGameSheet } from './AddGameSheet';
import { formatClock } from '../lib/engine/innings';
import type { Game } from '../types';

export function MatchupCard({ game }: { game: Game }) {
  const assignments = useGameAssignments(game.id);
  const removeGame = useStore((s) => s.removeGame);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const time = formatClock(game.time);

  return (
    <div className="gamecard">
      <div className="gamecard__body">
        <div className="gamecard__top">
          <span className="gamecard__time">{time || 'Time TBD'}</span>
          <div className="gamecard__actions">
            <button className="btn btn--plain" onClick={() => setEditOpen(true)}>
              Edit
            </button>
            <button
              className="btn btn--plain btn--danger"
              onClick={() => {
                if (window.confirm('Delete this game and its pitching?')) removeGame(game.id);
              }}
            >
              Delete
            </button>
          </div>
        </div>
        <div className="gamecard__matchup">{game.opponent ? `vs ${game.opponent}` : 'Game'}</div>

        {assignments.length > 0 && (
          <div className="gamecard__pitchers">
            {assignments.map((a) => (
              <PitcherRow key={a.id} a={a} />
            ))}
          </div>
        )}

        <button className="add-pitcher" onClick={() => setAddOpen(true)}>
          + Add pitcher
        </button>
      </div>

      <PitcherSheet open={addOpen} gameId={game.id} date={game.date} onClose={() => setAddOpen(false)} />
      <AddGameSheet open={editOpen} game={game} onClose={() => setEditOpen(false)} />
    </div>
  );
}
