import { useEffect, useState } from 'react';

interface StepperProps {
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
}

export function Stepper({ value, onChange, step = 5, min = 0, max = 130 }: StepperProps) {
  const clamp = (n: number) => Math.max(min, Math.min(max, n));
  // Local text state so you can type an exact number (and clear it to retype).
  const [text, setText] = useState(String(value));

  useEffect(() => {
    setText(String(value));
  }, [value]);

  const onType = (raw: string) => {
    setText(raw);
    const n = parseInt(raw, 10);
    if (!Number.isNaN(n)) onChange(clamp(n));
  };

  return (
    <div className="stepper">
      <button
        className="stepper__btn"
        onClick={() => onChange(clamp(value - step))}
        disabled={value <= min}
        aria-label="Decrease pitches"
      >
        −
      </button>
      <input
        className="stepper__input"
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={text}
        onChange={(e) => onType(e.target.value)}
        onBlur={() => setText(String(value))}
        aria-label="Pitches"
      />
      <button
        className="stepper__btn"
        onClick={() => onChange(clamp(value + step))}
        disabled={value >= max}
        aria-label="Increase pitches"
      >
        +
      </button>
    </div>
  );
}
