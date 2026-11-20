import { describe, expect, it } from 'vitest';
import {
  CAPITALS,
  CAPITAL_BY_UF,
  UF_LIST,
  canonicalCapital,
  cityKey,
  holidays,
  isUF,
  rulesForOptions,
  ufOfCapital,
} from '../src/index.js';

describe('geographic registry', () => {
  it('lists exactly the 27 federative units and their capitals', () => {
    expect(UF_LIST).toHaveLength(27);
    expect(new Set(UF_LIST).size).toBe(27);
    expect(CAPITALS).toHaveLength(27);
    expect(Object.keys(CAPITAL_BY_UF)).toHaveLength(27);
    for (const uf of UF_LIST) {
      expect(isUF(uf)).toBe(true);
      expect(CAPITAL_BY_UF[uf]).toBeTypeOf('string');
      expect(ufOfCapital(CAPITAL_BY_UF[uf])).toBe(uf);
    }
  });

  it('matches capital names without regard to case or accents', () => {
    expect(cityKey('São Paulo')).toBe('sao paulo');
    expect(canonicalCapital('sao paulo')).toBe('São Paulo');
    expect(canonicalCapital('SAO PAULO')).toBe('São Paulo');
    expect(canonicalCapital('São Paulo')).toBe('São Paulo');
    expect(canonicalCapital('Belo Horizonte')).toBe('Belo Horizonte');
    expect(canonicalCapital('Rio de Janeiro')).toBe('Rio de Janeiro');
    expect(canonicalCapital('Nowhere')).toBeUndefined();
  });

  it('rejects unknown UF and city scopes', () => {
    expect(() => holidays(2026, { uf: 'XX' as 'SP' })).toThrow(RangeError);
    expect(() => holidays(2026, { city: 'Nowhere' })).toThrow(RangeError);
  });
});

describe('scope filters', () => {
  it('keeps the national-only default when no scope is selected', () => {
    expect(
      rulesForOptions().every((rule) => rule.type === 'national' || rule.type === 'optional'),
    ).toBe(true);
    expect(holidays(2026)).toHaveLength(9);
  });

  it('adds state rules only for the selected UF', () => {
    for (const uf of UF_LIST) {
      const rules = rulesForOptions({ uf });
      const stateRules = rules.filter((rule) => rule.type === 'state');
      expect(stateRules.every((rule) => rule.uf === uf)).toBe(true);
    }
  });

  it('adds municipal rules only for the selected capital', () => {
    for (const city of CAPITALS) {
      const rules = rulesForOptions({ city });
      const municipalRules = rules.filter((rule) => rule.type === 'municipal');
      expect(municipalRules.every((rule) => rule.city === city)).toBe(true);
    }
  });

  it('applies the type filter after selecting scopes', () => {
    expect(holidays(2026, { include: [] })).toEqual([]);
    expect(holidays(2026, { uf: 'SP', include: [] })).toEqual([]);
    expect(holidays(2026, { city: 'São Paulo', include: [] })).toEqual([]);
  });
});
