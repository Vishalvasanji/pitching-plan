import { useEffect, useState } from 'react';
import { useStore } from './state/store';
import { useActivePlan } from './state/selectors';
import { TOURNAMENT_DATES, TOURNAMENT_NAME } from './data/tournament';
import { ASSUMED_SEED, BRACKET_LABELS } from './data/brackets';
import { BracketSelector } from './components/BracketSelector';
import { WorstCaseSummary } from './components/WorstCaseSummary';
import { RosterTable } from './components/RosterTable';
import { GamesBoard } from './components/GamesBoard';
import { ThemeToggle } from './components/ThemeToggle';
import { NameGate } from './components/NameGate';

type Tab = 'plan' | 'availability';

export function App() {
  const theme = useStore((s) => s.theme);
  const currentUser = useStore((s) => s.currentUser);
  const users = useStore((s) => s.users);
  const signOut = useStore((s) => s.signOut);
  const resetPlan = useStore((s) => s.resetPlan);
  const bracket = useActivePlan().selectedBracket;
  const [tab, setTab] = useState<Tab>('plan');

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);
  }, [theme]);

  if (!currentUser) {
    return (
      <div className="container">
        <NameGate />
      </div>
    );
  }

  return (
    <div className="container">
      <header className="app__header">
        <div>
          <h1 className="app__title">Pitching Plan</h1>
          <p className="app__subtitle">
            {TOURNAMENT_NAME} · {TOURNAMENT_DATES}
          </p>
        </div>
        <div className="app__actions">
          <button className="userchip" onClick={signOut} title="Switch user">
            <span className="userchip__name">👤 {users[currentUser]?.name}</span>
            <span className="userchip__switch">Switch</span>
          </button>
          <ThemeToggle />
        </div>
      </header>

      <div className="tabs">
        <div className="segmented" role="tablist" aria-label="View">
          <button
            role="tab"
            aria-selected={tab === 'plan'}
            className={`segmented__option ${tab === 'plan' ? 'segmented__option--active' : ''}`}
            onClick={() => setTab('plan')}
          >
            Plan
          </button>
          <button
            role="tab"
            aria-selected={tab === 'availability'}
            className={`segmented__option ${tab === 'availability' ? 'segmented__option--active' : ''}`}
            onClick={() => setTab('availability')}
          >
            Availability
          </button>
        </div>
      </div>

      {tab === 'plan' ? (
        <>
          <section className="section">
            <h2 className="section__title">Pool Play</h2>
            <GamesBoard days={[1, 2]} />
          </section>

          <section className="section">
            <h2 className="section__title">Bracket Play</h2>
            <div className="stack">
              <BracketSelector />
              <WorstCaseSummary />
              <GamesBoard days={[3, 4]} />
            </div>
          </section>
        </>
      ) : (
        <section className="section">
          <h2 className="section__title">Pitcher availability</h2>
          <p className="caption" style={{ margin: '0 4px 12px' }}>
            Reflecting the <strong>{BRACKET_LABELS[bracket]} bracket</strong> · assuming the #
            {ASSUMED_SEED[bracket]} seed. Pool days are fixed; bracket days follow your marked path.
          </p>
          <RosterTable />
          <div className="legend">
            <span>
              <i style={{ background: 'var(--green)' }} />
              Available
            </span>
            <span>
              <i style={{ background: 'var(--red)' }} />
              Not available (resting or pitching)
            </span>
            <span>Number in a cell = pitches thrown that day</span>
          </div>
        </section>
      )}

      <footer style={{ marginTop: 32, textAlign: 'center' }}>
        <button
          className="btn btn--plain"
          onClick={() => {
            if (window.confirm("Reset this plan? This clears all results and pitch assignments for the current name.")) {
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
