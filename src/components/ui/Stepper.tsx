interface StepperProps {
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
}

export function Stepper({ value, onChange, step = 5, min = 0, max = 130 }: StepperProps) {
  return (
    <div className="stepper">
      <button
        className="stepper__btn"
        onClick={() => onChange(Math.max(min, value - step))}
        disabled={value <= min}
        aria-label="Decrease pitches"
      >
        −
      </button>
      <span className="stepper__val">{value}</span>
      <button
        className="stepper__btn"
        onClick={() => onChange(Math.min(max, value + step))}
        disabled={value >= max}
        aria-label="Increase pitches"
      >
        +
      </button>
    </div>
  );
}
