import { describe, it, expect, beforeEach } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { App } from '../App';
import { useStore } from '../state/store';

beforeEach(() => {
  localStorage.clear();
  useStore.getState().resetPlan();
});

describe('App — end-to-end wiring', () => {
  it('opens on the Plan tab with the Red worst-case headline (6 games)', () => {
    render(<App />);
    expect(screen.getByText('Pitching Plan')).toBeInTheDocument();
    expect(screen.getByText('Pool Play')).toBeInTheDocument();
    expect(screen.getByText('Bracket Play')).toBeInTheDocument();
    // Red #6 worst case = 6 total games to win it all.
    expect(screen.getByText(/6 games left to win it all/i)).toBeInTheDocument();
    expect(screen.getByText('#6 seed')).toBeInTheDocument();
  });

  it('shows the roster on the Availability tab', () => {
    render(<App />);
    // Roster lives on the Availability tab, not the default Plan tab.
    expect(screen.queryByText('Alek Biletnikoff')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: 'Availability' }));
    expect(screen.getByText('Alek Biletnikoff')).toBeInTheDocument();
    expect(screen.getByText('Brayden Yarnall')).toBeInTheDocument();
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
    fireEvent.click(screen.getAllByRole('button', { name: 'Won' })[0]);
    expect(screen.getByText(/5 games left to win it all/i)).toBeInTheDocument();
  });

  it('adding a pitcher on the Plan tab flows to the Availability table', () => {
    render(<App />);
    // Add 25 pitches to the first game (Day 1 pool) on the Plan tab.
    fireEvent.click(screen.getAllByText('+ Add pitcher')[0]);
    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByText('Alek Biletnikoff'));
    fireEvent.click(within(dialog).getByRole('button', { name: /Add 25 pitches/i }));
    // Verify it on the Availability tab.
    fireEvent.click(screen.getByRole('tab', { name: 'Availability' }));
    expect(screen.getAllByText('25').length).toBeGreaterThan(0);
    expect(screen.getAllByText('pitches').length).toBeGreaterThan(0);
  });
});
