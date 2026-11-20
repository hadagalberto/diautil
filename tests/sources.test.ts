import { describe, expect, it } from 'vitest';
import {
  BANKING_GOOD_FRIDAY_SOURCE,
  BANKING_SOURCE,
  CUSTOMARY_GOOD_FRIDAY_SOURCE,
  CAPITALS,
  UF_LIST,
  municipalRulesByCapital,
  nationalRules,
  stateRulesByUF,
  type HolidayRule,
} from '../src/index.js';

/** URL fragments that identify news, events or one-off date-changing decrees. */
const WEAK_SOURCE_MARKERS = [
  '/noticia',
  '/noticias',
  'covid',
  'eventos.shtml',
  'calendario-eventos',
  'agencia.',
  'detalhar/6624',
];

function assertOfficialSource(rule: HolidayRule): void {
  expect(rule.law.length, `${rule.id} must cite a law`).toBeGreaterThan(0);
  expect(rule.source, `${rule.id} must cite a source URL`).toBeDefined();
  const source = rule.source ?? '';
  expect(source, `${rule.id} must use http(s)`).toMatch(/^https?:\/\//);
  for (const marker of WEAK_SOURCE_MARKERS) {
    expect(source.toLowerCase(), `${rule.id} source contains weak marker ${marker}`).not.toContain(
      marker,
    );
  }
}

describe('source audit — official law texts only', () => {
  it('gives every national rule a law and a non-weak official source', () => {
    for (const rule of nationalRules) {
      assertOfficialSource(rule);
    }
  });

  it('gives every state and municipal rule a law and a non-weak official source', () => {
    for (const uf of UF_LIST) {
      for (const rule of stateRulesByUF[uf]) {
        assertOfficialSource(rule);
      }
    }
    for (const city of CAPITALS) {
      for (const rule of municipalRulesByCapital[city] ?? []) {
        assertOfficialSource(rule);
      }
    }
  });

  it('keeps the audited subnational coverage counts', () => {
    const stateCount = UF_LIST.reduce((sum, uf) => sum + stateRulesByUF[uf].length, 0);
    const municipalCount = CAPITALS.reduce(
      (sum, city) => sum + (municipalRulesByCapital[city] ?? []).length,
      0,
    );
    expect(stateCount).toBe(47);
    expect(municipalCount).toBe(73);
  });

  it('uses identifiable official domains for the financial-calendar sources', () => {
    expect(BANKING_SOURCE).toContain('febraban.org.br');
    expect(BANKING_GOOD_FRIDAY_SOURCE).toContain('b3.com.br');
    expect(CUSTOMARY_GOOD_FRIDAY_SOURCE).toContain('planalto.gov.br');
  });
});
