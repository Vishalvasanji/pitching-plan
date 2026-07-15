import { useState } from 'react';
import { useStore } from '../state/store';
import { useGamesByDate } from '../state/selectors';
import { MatchupCard } from './MatchupCard';
import { AddGameSheet } from './AddGameSheet';
import { formatDateLabel } from '../lib/engine/innings';

export function GamesView() {
  const dated = useGamesByDate();
  const tournamentName = useStore((s) => s.tournamentName);
  const setTournamentName = useStore((s) => s.setTournamentName);
  const [addOpen, setAddOpen] = useState(false);

  return (
    <section className="section">
      <input
        className="field__input tourney-name"
        type="text"
        placeholder="Tournament name (optional)"
        value={tournamentName}
        onChange={(e) => setTournamentName(e.target.value)}
        aria-label="Tournament name"
      />

      <div className="games-head">
        <h2 className="section__title" style={{ border: 'none', margin: 0, paddingBottom: 0 }}>
          Games
        </h2>
        <button className="btn btn--primary" onClick={() => setAddOpen(true)}>
          + Add game
        </button>
      </div>

      {dated.length === 0 ? (
        <div className="empty-note">No games yet. Tap “Add game” to enter your first matchup.</div>
      ) : (
        dated.map(({ date, games }) => (
          <div key={date} className="dategroup">
            <div className="dategroup__head">{formatDateLabel(date)}</div>
            <div className="card day__games">
              {games.map((g) => (
                <MatchupCard key={g.id} game={g} />
              ))}
            </div>
          </div>
        ))
      )}

      <AddGameSheet open={addOpen} onClose={() => setAddOpen(false)} />
    </section>
  );
}
