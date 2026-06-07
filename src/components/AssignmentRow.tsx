import { useStore } from '../state/store';
import { Stepper } from './ui/Stepper';
import { ROSTER } from '../data/roster';
import type { Assignment } from '../types';

const BY_ID = new Map(ROSTER.map((p) => [p.id, p]));

export function AssignmentRow({ a }: { a: Assignment }) {
  const update = useStore((s) => s.updateAssignmentPitches);
  const remove = useStore((s) => s.removeAssignment);
  const p = BY_ID.get(a.playerId);

  return (
    <div className="assignrow">
      <div className="assignrow__id">
        <span className="assignrow__num">#{p?.number}</span>
        <span className="assignrow__name">
          {p?.firstName} {p?.lastName}
        </span>
      </div>
      <Stepper value={a.pitches} onChange={(v) => update(a.id, v)} />
      <button className="iconbtn" aria-label="Remove pitcher" onClick={() => remove(a.id)}>
        ✕
      </button>
    </div>
  );
}
