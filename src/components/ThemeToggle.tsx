import { useStore } from '../state/store';
import type { Theme } from '../types';

const NEXT: Record<Theme, Theme> = { system: 'light', light: 'dark', dark: 'system' };
const ICON: Record<Theme, string> = { system: '◐', light: '☀', dark: '☾' };
const LABEL: Record<Theme, string> = { system: 'Auto', light: 'Light', dark: 'Dark' };

export function ThemeToggle() {
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);
  return (
    <button
      className="iconbtn"
      title={`Theme: ${LABEL[theme]}`}
      aria-label={`Theme: ${LABEL[theme]}`}
      onClick={() => setTheme(NEXT[theme])}
    >
      {ICON[theme]}
    </button>
  );
}
