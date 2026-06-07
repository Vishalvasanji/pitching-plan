import { describe, it, expect } from 'vitest';
import { restDays } from '../lib/engine/restRules';

describe('restDays thresholds', () => {
  it('maps pitch counts to required rest days', () => {
    expect(restDays(0)).toBe(0);
    expect(restDays(1)).toBe(0);
    expect(restDays(20)).toBe(0);
    expect(restDays(21)).toBe(1);
    expect(restDays(35)).toBe(1);
    expect(restDays(36)).toBe(2);
    expect(restDays(50)).toBe(2);
    expect(restDays(51)).toBe(3);
    expect(restDays(65)).toBe(3);
    expect(restDays(66)).toBe(4);
    expect(restDays(95)).toBe(4);
    expect(restDays(120)).toBe(4);
  });
});
