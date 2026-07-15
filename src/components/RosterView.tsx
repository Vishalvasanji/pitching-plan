import { useState } from 'react';
import { useStore } from '../state/store';
import { useRoster } from '../state/selectors';

export function RosterView() {
  const roster = useRoster();
  const addPlayer = useStore((s) => s.addPlayer);
  const updatePlayer = useStore((s) => s.updatePlayer);
  const removePlayer = useStore((s) => s.removePlayer);
  const [newName, setNewName] = useState('');

  const add = () => {
    const n = newName.trim();
    if (!n) return;
    addPlayer(n);
    setNewName('');
  };

  return (
    <section className="section">
      <h2 className="section__title">Roster</h2>
      <div className="card rosterlist">
        {roster.map((p) => (
          <div key={p.id} className="rosteredit">
            <input
              className="field__input rosteredit__num"
              type="number"
              inputMode="numeric"
              placeholder="#"
              value={p.number ?? ''}
              aria-label={`${p.name} number`}
              onChange={(e) =>
                updatePlayer(p.id, {
                  number: e.target.value === '' ? null : parseInt(e.target.value, 10),
                })
              }
            />
            <input
              className="field__input rosteredit__name"
              type="text"
              value={p.name}
              aria-label="Player name"
              onChange={(e) => updatePlayer(p.id, { name: e.target.value })}
            />
            <button
              className="iconbtn"
              aria-label={`Remove ${p.name}`}
              onClick={() => {
                if (window.confirm(`Remove ${p.name || 'this player'}?`)) removePlayer(p.id);
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="rosteradd">
        <input
          className="field__input"
          type="text"
          placeholder="Add a player…"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') add();
          }}
          enterKeyHint="done"
          aria-label="New player name"
        />
        <button className="btn btn--primary" disabled={!newName.trim()} onClick={add}>
          Add
        </button>
      </div>
    </section>
  );
}
