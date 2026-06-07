import { useEffect } from 'react';
import { useStore } from './state/store';
import { TOURNAMENT_DATES, TOURNAMENT_NAME } from './data/tournament';
import { BracketSelector } from './components/BracketSelector';
import { WorstCaseSummary } from './components/WorstCaseSummary';
import { RosterTable } from './components/RosterTable';
import { DayBoard } from './components/DayBoard';
import { ThemeToggle } from './components/ThemeToggle';

export function App() {
  const theme = useStore((s) => s.theme);
  const resetPlan = useStore((s) => s.resetPlan);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div className="container">
      <header className="app__header">
        <div>
          <h1 className="app__title">Pitching Plan</h1>
          <p className="app__subtitle">
            {TOURNAMENT_NAME} · {TOURNAMENT_DATES}
          </p>
        </div>
        <ThemeToggle />
      </header>

      <BracketSelector />

      <div className="section">
        <WorstCaseSummary />
      </div>

      <div className="section">
        <h2 className="section__title">Pitcher availability</h2>
        <RosterTable />
        <div className="legend">
          <span>
            <i style={{ background: 'var(--green)' }} />
            Available
          </span>
          <span>
            <i style={{ background: 'var(--fill-strong)' }} />
            Pitched (count)
          </span>
          <span>
            <i style={{ background: 'var(--orange)' }} />
            Resting
          </span>
          <span>
            <i style={{ background: 'var(--red)' }} />
            Rule violation
          </span>
        </div>
      </div>

      <div className="section">
        <h2 className="section__title">Games &amp; pitching plan</h2>
        <DayBoard />
      </div>

      <footer style={{ marginTop: 32, textAlign: 'center' }}>
        <button
          className="btn btn--plain"
          onClick={() => {
            if (window.confirm('Reset the whole plan? This clears all results and pitch assignments.')) {
              resetPlan();
            }
          }}
        >
          Reset plan
        </button>
      </footer>
    </div>
  );
}
