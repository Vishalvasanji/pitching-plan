import { useDerivedPlan } from '../state/selectors';

export function WorstCaseSummary() {
  const { worstAhead, worstTotalAhead, outcome, trace } = useDerivedPlan();

  if (outcome === 'champion') {
    return (
      <div className="card outcome-banner outcome-banner--champ">🏆 Champions — you ran the table on this path.</div>
    );
  }
  if (outcome === 'eliminated') {
    return (
      <div className="card outcome-banner outcome-banner--out">Eliminated — no games left to plan on this path.</div>
    );
  }

  const played = trace.played.length;

  return (
    <div className="card summary">
      <div className="summary__lead">
        <div className="summary__eyebrow">Worst case from here</div>
        <div className="summary__headline">
          {worstTotalAhead} game{worstTotalAhead === 1 ? '' : 's'} left to win it all
        </div>
        {played > 0 && (
          <div className="caption" style={{ margin: '4px 0 0' }}>
            {played} game{played === 1 ? '' : 's'} played so far
          </div>
        )}
      </div>
      <div className="summary__stats">
        {([3, 4] as const).map((d) => (
          <div key={d} className={`stat ${worstAhead[d] >= 3 ? 'stat--hot' : ''}`}>
            <div className="stat__num">{worstAhead[d]}</div>
            <div className="stat__label">Day {d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
