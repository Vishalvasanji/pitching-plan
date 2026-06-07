# Pitching Plan Simulator — 14U PG Gulf Coast World Series

A mobile-first, Apple-style web app that helps a youth baseball coach plan pitching across the
four-day [PG Gulf Coast World Series](https://www.perfectgame.org/) (Jun 10–13, 2026) under the
Gulf Coast World Series pitch-count rest rules — so you never get caught short of arms when a
loser's-bracket run stacks games onto the final day.

## What it does

- **Pick your bracket** (Red / Blue / White). The app assumes the **worst case** for that bracket —
  a low seed that has to play the opening game — and projects the **longest road to win it all**.
- **Mark each game Won or Lost.** Winning prunes the loser's-bracket games you'd only play after a
  loss; losing reroutes you into the loser's bracket where you must win out. The displayed games and
  the "max games per day" update live.
- **Assign pitchers and pitch counts** to any game (multiple pitchers per game allowed).
- **Pitcher availability table** — every player × all four days — recomputed in real time from the
  rest rules, with that day's games pinned above each column.

## The rules it enforces

Rest scales with pitches thrown in a day (GCWS 14U):

| Pitches | Rest |
| --- | --- |
| 1–20 | 0 days |
| 21–35 | 1 day |
| 36–50 | 2 days |
| 51–65 | 3 days |
| 66+ | 4 days |

Plus a **95-pitch daily max** and **no pitcher may throw three days in a row**. The app *warns* on
illegal assignments (red badges) rather than blocking them, so you can model what-ifs. Counts are
**per pitcher per day**, summed across games.

> Confirm the enforced rules with the tournament director before the first game.

## Worst-case loads (assumed seed)

| Bracket | Assumed seed | Max games | Day 3 / Day 4 |
| --- | --- | --- | --- |
| Red | #6 | 6 | 2 / 4 |
| Blue | #11 (play-in) | 5 | 1 / 4 |
| White | #15 | 4 | 1 / 3 |

The assumed seed is one constant (`ASSUMED_SEED` in `src/data/brackets.ts`) — easy to change.

## Tech

React + Vite + TypeScript, [Zustand](https://github.com/pmndrs/zustand) for state (persisted to
`localStorage`). The rules/bracket logic lives in pure, unit-tested functions under
`src/lib/engine/`.

```bash
npm install
npm run dev        # local dev server
npm test           # Vitest (engine + end-to-end app tests)
npm run build      # type-check + production build
```

### Architecture

- `src/data/` — static roster, pool schedule, and the verified double-elimination bracket graph.
- `src/lib/engine/restRules.ts` — pitch-count → rest-days table.
- `src/lib/engine/availability.ts` — the single source of truth for pitcher status each day.
- `src/lib/engine/bracket.ts` — path tracing + `worstCasePath` (longest road to the title).
- `src/state/` — Zustand store + memoized derived selectors.
- `src/components/` — Apple-styled UI (bracket selector, day board, roster table, sheets).

## Deploy

A GitHub Actions workflow (`.github/workflows/deploy.yml`) builds and publishes to **GitHub Pages**
on push to `main`. Enable it once in **Settings → Pages → Source: GitHub Actions**; the site serves
at `https://<user>.github.io/pitching-plan/` (the Vite `base` is already set).
