import type { ScenarioPlan, Feasibility } from '../lib/engine/scenarios';
import { roundLabel, TIER_BY_ID, GAME_PITCHES } from '../lib/engine/scenarios';
import { PLAYER_BY_ID } from '../data/roster';
import { useStore } from '../state/store';
import { weekdayForDay } from '../lib/engine/format';
import { gameNumber } from '../data/games';

const FEAS_LABEL: Record<Feasibility, string> = {
  comfortable: 'Rotation covers it',
  covered: 'Covered — no margin',
  tight: 'Leaning on a hurt arm',
  short: 'Not enough arms',
};
const FEAS_CLASS: Record<Feasibility, string> = {
  comfortable: 'badge--green',
  covered: 'badge--amber',
  tight: 'badge--amber',
  short: 'badge--red',
};

function firstName(id: string): string {
  return PLAYER_BY_ID.get(id)?.firstName ?? id;
}
function fullName(id: string): string {
  const p = PLAYER_BY_ID.get(id);
  return p ? `#${p.number} ${p.firstName} ${p.lastName}` : id;
}

export function ScenarioCard({ plan }: { plan: ScenarioPlan }) {
  const setScenarioArms = useStore((s) => s.setScenarioArms);
  const { scenario, games } = plan;
  const reserves = [...plan.reserveFront, ...plan.reserveEater];

  return (
    <div className="card scn">
      <div className="scn__head">
        <div className="scn__title">{scenario.title}</div>
        <div className="scn__sub">{scenario.subtitle}</div>
      </div>

      <div className="scn__games">
        {games.map((pg) => {
          const champ = pg.game.isChampionship || pg.game.winnerTo === 'champion';
          const arm = pg.arms[0];
          const opts =
            arm && !pg.candidates.includes(arm.playerId)
              ? [arm.playerId, ...pg.candidates]
              : pg.candidates;
          return (
            <div key={pg.gameId} className={`scn__game ${champ ? 'scn__game--champ' : ''}`}>
              <div className="scn__gleft">
                <span className="scn__gtime">
                  {weekdayForDay(pg.game.day)} {pg.game.time}
                </span>
                <span className="scn__ground">
                  {champ ? '🏆 ' : ''}G{gameNumber(pg.gameId)} · {roundLabel(pg.game)}
                  {pg.result === 'L' && <span className="scn__loss">you lose this</span>}
                </span>
              </div>
              <div className="scn__garm">
                <select
                  className="scn__select"
                  value={arm?.playerId ?? ''}
                  aria-label={`Pitcher for game ${gameNumber(pg.gameId)}`}
                  onChange={(e) => {
                    const v = e.target.value;
                    setScenarioArms(
                      scenario.id,
                      pg.gameId,
                      v ? [{ playerId: v, pitches: arm?.pitches ?? GAME_PITCHES }] : [],
                    );
                  }}
                >
                  {!arm && <option value="">— none left —</option>}
                  {opts.map((id) => (
                    <option key={id} value={id}>
                      {fullName(id)}
                      {TIER_BY_ID.get(id)?.role === 'emergency' ? ' (hurt)' : ''}
                    </option>
                  ))}
                </select>
                <span className="scn__pitches">{arm ? `~${arm.pitches}` : ''}</span>
                {pg.overridden && (
                  <button
                    className="scn__auto"
                    title="Back to the suggested arm"
                    onClick={() => setScenarioArms(scenario.id, pg.gameId, [])}
                  >
                    auto
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="scn__foot">
        <span className={`badge ${FEAS_CLASS[plan.feasibility]}`}>{FEAS_LABEL[plan.feasibility]}</span>
        <span className="scn__reserve">
          {reserves.length
            ? `Reserve: ${reserves.map(firstName).join(', ')}`
            : 'No fresh arms in reserve'}
          {plan.reserveEmergency.length
            ? ` · hurt: ${plan.reserveEmergency.map(firstName).join(', ')}`
            : ''}
        </span>
      </div>
    </div>
  );
}
