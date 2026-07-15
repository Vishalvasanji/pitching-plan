import { useStore } from '../state/store';
import { usePlayerMap } from '../state/selectors';
import { InningsStepper } from './InningsStepper';
import type { Assignment } from '../types';

export function PitcherRow({ a }: { a: Assignment }) {
  const update = useStore((s) => s.updateAssignmentOuts);
  const remove = useStore((s) => s.removeAssignment);
  const p = usePlayerMap().get(a.playerId);

  return (
    <div className="assignrow">
      <div className="assignrow__id">
        {p?.number != null && <span className="assignrow__num">#{p.number}</span>}
        <span className="assignrow__name">{p?.name ?? 'Unknown'}</span>
      </div>
      <InningsStepper value={a.outs} onChange={(v) => update(a.id, v)} />
      <button className="iconbtn" aria-label="Remove pitcher" onClick={() => remove(a.id)}>
        ✕
      </button>
    </div>
  );
}
