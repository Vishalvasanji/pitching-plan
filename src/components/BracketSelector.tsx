import { useStore } from '../state/store';
import { useActivePlan } from '../state/selectors';
import { ASSUMED_SEED, BRACKET_LABELS, BRACKET_SEED_RANGE } from '../data/brackets';
import type { BracketId } from '../types';

const ORDER: BracketId[] = ['red', 'blue', 'white'];

export function BracketSelector() {
  const bracket = useActivePlan().selectedBracket;
  const setBracket = useStore((s) => s.setBracket);

  return (
    <div>
      <div className="segmented" role="tablist" aria-label="Bracket">
        {ORDER.map((b) => (
          <button
            key={b}
            role="tab"
            aria-selected={bracket === b}
            className={`segmented__option ${bracket === b ? 'segmented__option--active' : ''}`}
            onClick={() => setBracket(b)}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span className={`dot dot--${b}`} /> {BRACKET_LABELS[b]} Bracket
            </span>
            <small>{BRACKET_SEED_RANGE[b]}</small>
          </button>
        ))}
      </div>
      <p className="caption">
        Worst case · assuming the <strong>#{ASSUMED_SEED[bracket]} seed</strong> — the lowest seed, which
        plays the opening game and has the most games to grind out to win it all.
      </p>
    </div>
  );
}
