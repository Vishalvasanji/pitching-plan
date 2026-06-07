import { useGameAssignments, type PathGame } from '../state/selectors';
import { AssignmentRow } from './AssignmentRow';
import { ResultToggle } from './ResultToggle';
import { gameMatchup } from '../lib/engine/format';

export function GameCard({ pg, onAdd }: { pg: PathGame; onAdd: () => void }) {
  const { game, role, result } = pg;
  const assignments = useGameAssignments(game.id);
  const isBracket = game.phase === 'bracket';
  const projected = role === 'projected';
  const showToggle = isBracket && (role === 'current' || role === 'played');

  return (
    <div className={`gamecard ${projected ? 'gamecard--projected' : ''}`}>
      <div className="gamecard__body">
        <div className="gamecard__top">
          <span className="gamecard__time">{game.time}</span>
          {showToggle ? (
            <ResultToggle gameId={game.id} value={result} />
          ) : projected ? (
            <span className="gamecard__rolepill">Projected</span>
          ) : null}
        </div>
        <div className="gamecard__matchup">{gameMatchup(game)}</div>
        <div className="gamecard__meta">{game.field}</div>

        {assignments.length > 0 && (
          <div className="gamecard__pitchers">
            {assignments.map((a) => (
              <AssignmentRow key={a.id} a={a} />
            ))}
          </div>
        )}

        <button className="add-pitcher" onClick={onAdd}>
          + Add pitcher
        </button>
      </div>
    </div>
  );
}
