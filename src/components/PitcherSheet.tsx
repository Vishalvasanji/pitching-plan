import { useEffect, useState } from 'react';
import { Sheet } from './ui/Sheet';
import { InningsStepper } from './InningsStepper';
import { useStore } from '../state/store';
import { useAvailability, useGameAssignments, useRoster } from '../state/selectors';
import { DAILY_CAP_OUTS, dateParts, formatInnings } from '../lib/engine/innings';
import type { DateStatus } from '../types';

const WHOLE = [1, 2, 3, 4, 5, 6, 7];

function restText(s?: DateStatus): string {
  if (!s) return 'Not available';
  const reason =
    s.restReason === 'four-in-a-row'
      ? '3 days straight'
      : s.restReason === 'post-long-outing'
        ? 'threw > 3 IP'
        : '8-inning limit';
  if (s.backOn) {
    const { wd, md } = dateParts(s.backOn);
    return `Rest · ${reason} · back ${wd} ${md}`;
  }
  return `Rest · ${reason}`;
}

interface Props {
  open: boolean;
  gameId: string;
  date: string;
  onClose: () => void;
}

export function PitcherSheet({ open, gameId, date, onClose }: Props) {
  const roster = useRoster();
  const availability = useAvailability();
  const inThisGame = new Set(useGameAssignments(gameId).map((a) => a.playerId));
  const add = useStore((s) => s.addAssignment);

  const [selected, setSelected] = useState<string | null>(null);
  const [outs, setOuts] = useState(9);

  useEffect(() => {
    if (open) {
      setSelected(null);
      setOuts(9);
    }
  }, [open, gameId]);

  const statusFor = (playerId: string) => availability.get(playerId)?.get(date);

  const candidates = roster.filter((p) => !inThisGame.has(p.id));
  const available = candidates.filter((p) => (statusFor(p.id)?.availableOuts ?? DAILY_CAP_OUTS) > 0);
  const resting = candidates.filter((p) => (statusFor(p.id)?.availableOuts ?? DAILY_CAP_OUTS) <= 0);

  const selectedPlayer = selected ? roster.find((p) => p.id === selected) : undefined;
  const remaining = selected ? (statusFor(selected)?.availableOuts ?? DAILY_CAP_OUTS) : DAILY_CAP_OUTS;

  const pick = (id: string) => {
    setSelected(id);
    const rem = statusFor(id)?.availableOuts ?? DAILY_CAP_OUTS;
    setOuts(Math.min(9, rem > 0 ? rem : 9));
  };

  const confirm = () => {
    if (!selected) return;
    add(gameId, selected, outs);
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose}>
      <h3 className="sheet__title">Add pitcher</h3>
      <p className="sheet__sub">Pick an arm and set innings pitched for this game.</p>

      {selectedPlayer ? (
        <>
          <div className="sheet__row">
            <div>
              <div className="assignrow__name">
                {selectedPlayer.number != null && `#${selectedPlayer.number} `}
                {selectedPlayer.name}
              </div>
              <button className="btn btn--plain" style={{ paddingLeft: 0 }} onClick={() => setSelected(null)}>
                Change pitcher
              </button>
            </div>
            <InningsStepper value={outs} onChange={setOuts} />
          </div>
          <p className="caption" style={{ margin: '0 2px' }}>
            {remaining > 0
              ? `${formatInnings(remaining)} innings left today before a violation.`
              : 'Already at the limit today — this will flag a violation.'}
          </p>
          <div className="sheet__chips">
            {WHOLE.map((ip) => (
              <button
                key={ip}
                className={`chip-quick ${outs === ip * 3 ? 'is-on' : ''}`}
                onClick={() => setOuts(ip * 3)}
              >
                {ip}
              </button>
            ))}
          </div>
          <button className="btn btn--primary btn--full" style={{ marginTop: 16 }} onClick={confirm}>
            Add {formatInnings(outs)} IP
          </button>
        </>
      ) : (
        <div className="picker">
          <div className="picker__group-label">Available ({available.length})</div>
          {available.length === 0 && (
            <div className="empty-note" style={{ padding: '4px 0' }}>
              No available pitchers for this date.
            </div>
          )}
          {available.map((p) => {
            const rem = statusFor(p.id)?.availableOuts ?? DAILY_CAP_OUTS;
            return (
              <button key={p.id} className="pickeritem" onClick={() => pick(p.id)}>
                {p.number != null && <span className="player__num">#{p.number}</span>}
                <span className="pickeritem__name">{p.name}</span>
                <span className="badge badge--green">{formatInnings(rem)} IP left</span>
              </button>
            );
          })}

          {resting.length > 0 && <div className="picker__group-label">Resting</div>}
          {resting.map((p) => (
            <div key={p.id} className="pickeritem pickeritem--disabled">
              {p.number != null && <span className="player__num">#{p.number}</span>}
              <span className="pickeritem__name">{p.name}</span>
              <span className="badge badge--amber">{restText(statusFor(p.id))}</span>
            </div>
          ))}
        </div>
      )}
    </Sheet>
  );
}
