import { useMemo } from 'react';
import { useStore } from '../state/store';
import {
  buildScenarios,
  planScenario,
  effectiveStatus,
  PITCHER_TIERS,
} from '../lib/engine/scenarios';
import { PLAYER_BY_ID } from '../data/roster';
import { ScenarioCard } from './ScenarioCard';
import type { ArmStatus } from '../types';

const STATUS_OPTS: { value: ArmStatus; label: string }[] = [
  { value: 'available', label: 'Avail' },
  { value: 'emergency', label: 'Emerg' },
  { value: 'out', label: 'Out' },
];

const ROLE_LABEL: Record<string, string> = {
  ace: '1a/1b',
  starter: 'Starter',
  eater: 'Inning eater',
  emergency: 'Hurt',
  'no-pitch': '—',
};

function ArmsPanel() {
  const armStatus = useStore((s) => s.armStatus);
  const setArmStatus = useStore((s) => s.setArmStatus);
  const resetScenarios = useStore((s) => s.resetScenarios);

  return (
    <div className="card arms">
      <div className="arms__head">
        <div>
          <div className="arms__title">Available arms</div>
          <div className="arms__hint">Emergency arms are used only if the available ones run out.</div>
        </div>
        <button className="arms__reset" onClick={resetScenarios}>
          Reset
        </button>
      </div>
      <div className="arms__list">
        {PITCHER_TIERS.map((t) => {
          const p = PLAYER_BY_ID.get(t.playerId);
          if (!p) return null;
          const cur = effectiveStatus(t.playerId, armStatus);
          return (
            <div key={t.playerId} className="arms__row">
              <div className="arms__who">
                <span className="player__num">#{p.number}</span>
                <span className="arms__name">
                  {p.firstName} {p.lastName}
                </span>
                <span className="arms__role">{ROLE_LABEL[t.role]}</span>
              </div>
              {t.role === 'no-pitch' ? (
                <span className="badge badge--neutral">Can’t pitch</span>
              ) : (
                <div className="arms__seg" role="group" aria-label={`${p.firstName} status`}>
                  {STATUS_OPTS.map((o) => (
                    <button
                      key={o.value}
                      className={`arms__segbtn ${cur === o.value ? `is-on arms__segbtn--${o.value}` : ''}`}
                      onClick={() => setArmStatus(t.playerId, o.value)}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Scenarios() {
  const armStatus = useStore((s) => s.armStatus);
  const scenarioArms = useStore((s) => s.scenarioArms);
  const scenarios = useMemo(() => buildScenarios('blue'), []);
  const plans = useMemo(
    () => scenarios.map((s) => planScenario(s, armStatus, scenarioArms[s.id])),
    [scenarios, armStatus, scenarioArms],
  );

  return (
    <section className="section">
      <h2 className="section__title">Scenarios — road to the Blue title</h2>
      <p className="caption" style={{ margin: '0 4px 14px' }}>
        Blue bracket · assuming the <strong>#11 seed</strong> (the toughest road). At ~85 pitches a
        game a starter needs four days’ rest — so <strong>whoever throws Friday is done for Saturday</strong>.
        Each road shows the suggested arm per game; tap a name to change it.
      </p>
      <ArmsPanel />
      <div className="scn__grid">
        {plans.map((plan) => (
          <ScenarioCard key={plan.scenario.id} plan={plan} />
        ))}
      </div>
    </section>
  );
}
