import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { App } from '../App';
import { useStore } from '../state/store';
import { DEFAULT_ROSTER } from '../data/roster';

beforeEach(() => {
  localStorage.clear();
  useStore.setState({
    userName: 'Coach',
    theme: 'system',
    tournamentName: '',
    roster: DEFAULT_ROSTER,
    games: [],
    assignments: [],
  });
});

describe('tournament app', () => {
  it('shows the three tabs and the seeded, editable roster', () => {
    render(<App />);
    expect(screen.getByRole('tab', { name: 'Games' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Availability' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Roster' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add game/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Roster' }));
    expect(screen.getByDisplayValue('Campbell Jones')).toBeInTheDocument();
  });

  it('assigns innings to a game and reflects them in availability', () => {
    useStore.setState({
      games: [{ id: 'g1', date: '2026-06-13', time: '10:30', opponent: 'Drillers' }],
    });
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /Add pitcher/i }));
    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByText('Campbell Jones'));
    fireEvent.click(within(dialog).getByRole('button', { name: /Add 3 IP/i }));

    fireEvent.click(screen.getByRole('tab', { name: 'Availability' }));
    expect(screen.getByTitle(/3 IP/)).toBeInTheDocument();
  });
});
