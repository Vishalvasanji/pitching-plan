import { useState, type FormEvent } from 'react';
import { useStore } from '../state/store';
import { TOURNAMENT_NAME } from '../data/tournament';

export function NameGate({
  initialName = '',
  onSaved,
}: {
  initialName?: string;
  onSaved?: () => void;
}) {
  const setUser = useStore((s) => s.setUser);
  const [name, setName] = useState(initialName);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setUser(name);
    onSaved?.();
  };

  return (
    <div className="gate">
      <div className="gate__card card">
        <h1 className="gate__title">Pitching Plan</h1>
        <p className="gate__sub">{TOURNAMENT_NAME}</p>
        <p className="gate__prompt">What's your first name?</p>
        <form className="gate__form" onSubmit={submit}>
          <input
            className="gate__input"
            placeholder="First name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            enterKeyHint="done"
            aria-label="First name"
          />
        </form>
        <p className="gate__hint">Press enter to save</p>
      </div>
    </div>
  );
}
