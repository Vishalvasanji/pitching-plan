import { DAILY_CAP_OUTS, formatInnings } from '../lib/engine/innings';

interface Props {
  value: number; // outs
  onChange: (outs: number) => void;
  max?: number; // outs
}

/** Steps innings by ⅓ (one out) at a time. */
export function InningsStepper({ value, onChange, max = DAILY_CAP_OUTS }: Props) {
  const clamp = (n: number) => Math.max(0, Math.min(max, n));
  return (
    <div className="stepper">
      <button
        className="stepper__btn"
        onClick={() => onChange(clamp(value - 1))}
        disabled={value <= 0}
        aria-label="Fewer outs"
      >
        −
      </button>
      <span className="stepper__reading" aria-label={`${formatInnings(value)} innings`}>
        {formatInnings(value)}
        <small>IP</small>
      </span>
      <button
        className="stepper__btn"
        onClick={() => onChange(clamp(value + 1))}
        disabled={value >= max}
        aria-label="More outs"
      >
        +
      </button>
    </div>
  );
}
