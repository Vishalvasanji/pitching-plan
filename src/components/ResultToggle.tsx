import { useStore } from '../state/store';
import type { GameResult } from '../types';

export function ResultToggle({ gameId, value }: { gameId: string; value?: GameResult }) {
  const setResult = useStore((s) => s.setResult);
  const toggle = (r: GameResult) => setResult(gameId, value === r ? null : r);

  return (
    <div className="resulttoggle" role="group" aria-label="Game result">
      <button
        className={`resulttoggle__btn resulttoggle__btn--w ${value === 'W' ? 'is-on' : ''}`}
        onClick={() => toggle('W')}
      >
        Won
      </button>
      <button
        className={`resulttoggle__btn resulttoggle__btn--l ${value === 'L' ? 'is-on' : ''}`}
        onClick={() => toggle('L')}
      >
        Lost
      </button>
    </div>
  );
}
