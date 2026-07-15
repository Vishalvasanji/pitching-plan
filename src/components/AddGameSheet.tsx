import { useEffect, useState } from 'react';
import { Sheet } from './ui/Sheet';
import { useStore } from '../state/store';
import type { Game } from '../types';

interface Props {
  open: boolean;
  game?: Game; // present when editing
  defaultDate?: string;
  onClose: () => void;
}

export function AddGameSheet({ open, game, defaultDate, onClose }: Props) {
  const addGame = useStore((s) => s.addGame);
  const updateGame = useStore((s) => s.updateGame);

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [opponent, setOpponent] = useState('');

  useEffect(() => {
    if (!open) return;
    setDate(game?.date ?? defaultDate ?? '');
    setTime(game?.time ?? '');
    setOpponent(game?.opponent ?? '');
  }, [open, game, defaultDate]);

  const save = () => {
    if (!date) return;
    const patch = { date, time: time || undefined, opponent: opponent.trim() || undefined };
    if (game) updateGame(game.id, patch);
    else addGame(patch);
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose}>
      <h3 className="sheet__title">{game ? 'Edit game' : 'Add game'}</h3>
      <p className="sheet__sub">Set the date, time, and opponent.</p>

      <label className="field">
        <span className="field__label">Date</span>
        <input
          className="field__input"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </label>

      <label className="field">
        <span className="field__label">Time (optional)</span>
        <input
          className="field__input"
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
      </label>

      <label className="field">
        <span className="field__label">Opponent (optional)</span>
        <input
          className="field__input"
          type="text"
          placeholder="e.g. River Valley Drillers"
          value={opponent}
          onChange={(e) => setOpponent(e.target.value)}
          enterKeyHint="done"
        />
      </label>

      <button
        className="btn btn--primary btn--full"
        style={{ marginTop: 16 }}
        disabled={!date}
        onClick={save}
      >
        {game ? 'Save game' : 'Add game'}
      </button>
    </Sheet>
  );
}
