import { useEffect, useState } from 'react';
import { useStore } from './state/store';
import { ThemeToggle } from './components/ThemeToggle';
import { NameGate } from './components/NameGate';
import { GamesView } from './components/GamesView';
import { AvailabilityTable } from './components/AvailabilityTable';
import { RosterView } from './components/RosterView';

// NOTE: The Gulf Coast World Series build (bracket tracing, seeds, worst-case,
// pool/bracket boards) is preserved but dormant — its files are excluded from
// the build in tsconfig.json / vite.config.ts and are not imported here.

type Tab = 'games' | 'availability' | 'roster';

const TABS: { id: Tab; label: string }[] = [
  { id: 'games', label: 'Games' },
  { id: 'availability', label: 'Availability' },
  { id: 'roster', label: 'Roster' },
];

export function App() {
  const theme = useStore((s) => s.theme);
  const userName = useStore((s) => s.userName);
  const tournamentName = useStore((s) => s.tournamentName);
  const resetTournament = useStore((s) => s.resetTournament);
  const [tab, setTab] = useState<Tab>('games');
  const [editingName, setEditingName] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);
  }, [theme]);

  if (!userName || editingName) {
    return (
      <div className="container">
        <NameGate initialName={userName ?? ''} onSaved={() => setEditingName(false)} />
      </div>
    );
  }

  const initial = userName.trim().charAt(0).toUpperCase();

  return (
    <div className="container">
      <header className="app__header">
        <div>
          <h1 className="app__title">Pitching Plan</h1>
          <p className="app__subtitle">{tournamentName || 'Weekend tournament'}</p>
        </div>
        <div className="app__actions">
          <ThemeToggle />
          <button
            className="avatar"
            onClick={() => setEditingName(true)}
            title={`${userName} — tap to change name`}
            aria-label={`${userName} — change name`}
          >
            {initial}
          </button>
        </div>
      </header>

      <div className="tabs">
        <div className="segmented" role="tablist" aria-label="View">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              className={`segmented__option ${tab === t.id ? 'segmented__option--active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'games' && <GamesView />}

      {tab === 'availability' && (
        <section className="section">
          <h2 className="section__title">Pitcher availability</h2>
          <p className="caption" style={{ margin: '0 4px 12px' }}>
            USSSA (13U+): <strong>7 IP/day</strong> · throw <strong>&gt;3 IP</strong> → rest next day ·
            max <strong>8 IP</strong> over any 3 days · never <strong>4 days straight</strong>.
          </p>
          <AvailabilityTable />
          <div className="legend">
            <span>
              <i style={{ background: 'var(--green)' }} />
              Available
            </span>
            <span>
              <i style={{ background: 'var(--red)' }} />
              Resting
            </span>
            <span>Number = innings pitched that day</span>
            <span>Red outline = rule violation</span>
          </div>
        </section>
      )}

      {tab === 'roster' && <RosterView />}

      <footer style={{ marginTop: 32, textAlign: 'center' }}>
        <button
          className="btn btn--plain"
          onClick={() => {
            if (window.confirm('Start a new tournament? This clears all games and pitching (roster stays).')) {
              resetTournament();
            }
          }}
        >
          New tournament
        </button>
      </footer>
    </div>
  );
}
