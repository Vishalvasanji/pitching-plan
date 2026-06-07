import { describe, it, expect, beforeEach } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { App } from '../App';
import { useStore } from '../state/store';

beforeEach(() => {
  localStorage.clear();
  useStore.getState().resetPlan();
});

describe('App — end-to-end wiring', () => {
  it('renders the roster and the Red worst-case headline (6 games)', () => {
    render(<App />);
    expect(screen.getByText('Pitching Plan')).toBeInTheDocument();
    expect(screen.getByText('Alek Biletnikoff')).toBeInTheDocument();
    // Red #6 worst case = 6 total games to win it all.
    expect(screen.getByText(/6 games left to win it all/i)).toBeInTheDocument();
    // assumed seed caption (exact match → only the caption's <strong>, not a matchup)
    expect(screen.getByText('#6 seed')).toBeInTheDocument();
  });

  it('switching bracket re-projects the worst case (White #15 → 4 games)', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('tab', { name: /White/i }));
    expect(screen.getByText('#15 seed')).toBeInTheDocument();
    expect(screen.getByText(/4 games left to win it all/i)).toBeInTheDocument();
  });

  it('marking the opening game Won prunes a game from the worst case', () => {
    render(<App />);
    expect(screen.getByText(/6 games left to win it all/i)).toBeInTheDocument();
    // The current bracket game (GM32) is the only one with a live Won/Lost control
    // among the earliest; click the first "Won".
    fireEvent.click(screen.getAllByRole('button', { name: 'Won' })[0]);
    // Winning GM32 drops the worst case from 6 to 5 remaining (GM34 now current).
    expect(screen.getByText(/5 games left to win it all/i)).toBeInTheDocument();
  });

  it('adding a pitcher flows through to the availability table', () => {
    render(<App />);
    // Open the add-pitcher sheet for the first game (Day 1 pool).
    fireEvent.click(screen.getAllByText('+ Add pitcher')[0]);
    const dialog = screen.getByRole('dialog');
    // Pick an available pitcher.
    fireEvent.click(within(dialog).getByText('Alek Biletnikoff'));
    // Confirm 25 pitches.
    fireEvent.click(within(dialog).getByRole('button', { name: /Add 25 pitches/i }));
    // The roster table should now show the pitched count somewhere.
    expect(screen.getAllByText('25').length).toBeGreaterThan(0);
    expect(screen.getAllByText('pitches').length).toBeGreaterThan(0);
  });
});
