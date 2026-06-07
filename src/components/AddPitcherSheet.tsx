import { useEffect, useState } from 'react';
import { Sheet } from './ui/Sheet';
import { Stepper } from './ui/Stepper';
import { ROSTER } from '../data/roster';
import { useStore } from '../state/store';
import { useDerivedPlan } from '../state/selectors';
import { backOnLabel } from '../lib/engine/format';
import type { DayIndex } from '../types';

const QUICK = [20, 35, 50, 65];

interface Props {
  open: boolean;
  gameId: string;
  day: DayIndex;
  onClose: () => void;
}

export function AddPitcherSheet({ open, gameId, day, onClose }: Props) {
  const { availability } = useDerivedPlan();
  const assignments = useStore((s) => s.assignments);
  const add = useStore((s) => s.addAssignment);

  const [selected, setSelected] = useState<string | null>(null);
  const [pitches, setPitches] = useState(25);

  useEffect(() => {
    if (open) {
      setSelected(null);
      setPitches(25);
    }
  }, [open, gameId]);

  const inThisGame = new Set(
    assignments.filter((a) => a.gameId === gameId).map((a) => a.playerId),
  );
  const available = ROSTER.filter(
    (p) => !inThisGame.has(p.id) && availability.get(p.id)?.[day - 1].kind === 'available',
  );
  const resting = ROSTER.filter(
    (p) => !inThisGame.has(p.id) && availability.get(p.id)?.[day - 1].kind === 'resting',
  );

  const selectedPlayer = selected ? ROSTER.find((p) => p.id === selected) : undefined;

  const confirm = () => {
    if (!selected) return;
    add(gameId, selected, pitches);
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose}>
      <h3 className="sheet__title">Add pitcher</h3>
      <p className="sheet__sub">Day {day} · pick an available arm and set planned pitches.</p>

      {selectedPlayer ? (
        <>
          <div className="sheet__row">
            <div>
              <div className="assignrow__name">
                #{selectedPlayer.number} {selectedPlayer.firstName} {selectedPlayer.lastName}
              </div>
              <button
                className="btn btn--plain"
                style={{ paddingLeft: 0 }}
                onClick={() => setSelected(null)}
              >
                Change pitcher
              </button>
            </div>
            <Stepper value={pitches} onChange={setPitches} max={130} />
          </div>
          <div className="sheet__chips">
            {QUICK.map((q) => (
              <button
                key={q}
                className={`chip-quick ${pitches === q ? 'is-on' : ''}`}
                onClick={() => setPitches(q)}
              >
                {q}
              </button>
            ))}
          </div>
          <button className="btn btn--primary btn--full" style={{ marginTop: 16 }} onClick={confirm}>
            Add {pitches} pitches
          </button>
        </>
      ) : (
        <div className="picker">
          <div className="picker__group-label">Available ({available.length})</div>
          {available.length === 0 && (
            <div className="empty-note" style={{ padding: '4px 0' }}>
              No available pitchers for Day {day}.
            </div>
          )}
          {available.map((p) => (
            <button key={p.id} className="pickeritem" onClick={() => setSelected(p.id)}>
              <span className="player__num">#{p.number}</span>
              <span className="pickeritem__name">
                {p.firstName} {p.lastName}
              </span>
              <span className="player__pos">{p.position}</span>
            </button>
          ))}

          {resting.length > 0 && <div className="picker__group-label">Resting</div>}
          {resting.map((p) => {
            const back = backOnLabel(availability.get(p.id)![day - 1].backOnDay);
            return (
              <div key={p.id} className="pickeritem pickeritem--disabled">
                <span className="player__num">#{p.number}</span>
                <span className="pickeritem__name">
                  {p.firstName} {p.lastName}
                </span>
                <span className="badge badge--amber">{back === 'Done' ? 'Done' : `Back ${back}`}</span>
              </div>
            );
          })}
        </div>
      )}
    </Sheet>
  );
}
