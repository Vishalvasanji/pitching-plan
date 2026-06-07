import { useState, type FormEvent } from 'react';
import { useStore } from '../state/store';
import { TOURNAMENT_NAME } from '../data/tournament';

export function NameGate() {
  const setUser = useStore((s) => s.setUser);
  const users = useStore((s) => s.users);
  const [name, setName] = useState('');
  const profiles = Object.entries(users);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (name.trim()) setUser(name);
  };

  return (
    <div className="gate">
      <div className="gate__card card">
        <h1 className="gate__title">Pitching Plan</h1>
        <p className="gate__sub">{TOURNAMENT_NAME}</p>
        <p className="gate__prompt">Who's planning?</p>
        <form className="gate__form" onSubmit={submit}>
          <input
            className="gate__input"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            aria-label="Your name"
          />
          <button type="submit" className="btn btn--primary" disabled={!name.trim()}>
            Start
          </button>
        </form>

        {profiles.length > 0 && (
          <>
            <p className="gate__resume">Or resume</p>
            <div className="gate__profiles">
              {profiles.map(([slug, u]) => (
                <button key={slug} className="btn" onClick={() => setUser(u.name)}>
                  👤 {u.name}
                </button>
              ))}
            </div>
          </>
        )}

        <p className="gate__note">Saved on this device only — no account or password.</p>
      </div>
    </div>
  );
}
