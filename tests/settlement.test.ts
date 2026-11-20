import { describe, expect, it } from 'vitest';
import {
  BOLETO_DUE_DATE_LAW,
  BOLETO_DUE_DATE_SOURCE,
  SETTLEMENT_SOURCE,
  boletoDueDateAdjust,
  settlementD1,
  settlementD2,
  settlementDate,
  toISO,
} from '../src/index.js';

describe('boletoDueDateAdjust', () => {
  it('moves a non-business due date to the next business day', () => {
    expect(toISO(boletoDueDateAdjust('2026-12-25'))).toBe('2026-12-28'); // Christmas
    expect(toISO(boletoDueDateAdjust('2026-11-21'))).toBe('2026-11-23'); // Saturday
    expect(toISO(boletoDueDateAdjust('2026-11-20'))).toBe('2026-11-23'); // Zumbi holiday
  });

  it('keeps a due date that is already a business day', () => {
    expect(toISO(boletoDueDateAdjust('2026-11-19'))).toBe('2026-11-19');
    expect(toISO(boletoDueDateAdjust('2026-12-24'))).toBe('2026-12-24');
  });

  it('uses the banking calendar and honours extra holidays', () => {
    expect(toISO(boletoDueDateAdjust('2026-02-17'))).toBe('2026-02-18'); // Carnaval Tuesday
    expect(toISO(boletoDueDateAdjust('2026-11-19', { extraHolidays: ['2026-11-19'] }))).toBe(
      '2026-11-23',
    );
  });

  it('cites the real norm and official source', () => {
    expect(BOLETO_DUE_DATE_LAW).toContain('Lei nº 7.089');
    expect(BOLETO_DUE_DATE_SOURCE).toContain('planalto.gov.br');
    expect(SETTLEMENT_SOURCE).toContain('febraban.org.br');
  });
});

describe('settlement helpers', () => {
  it('computes D+1 and D+2 in banking business days', () => {
    expect(toISO(settlementD1('2026-11-19'))).toBe('2026-11-23');
    expect(toISO(settlementD2('2026-11-19'))).toBe('2026-11-24');
    expect(toISO(settlementDate('2026-02-13', 3))).toBe('2026-02-20');
    expect(toISO(settlementDate('2026-02-13', 3, { calendar: 'civil' }))).toBe('2026-02-18');
  });

  it('rolls a non-business payment date forward for D+0', () => {
    expect(toISO(settlementDate('2026-11-21', 0))).toBe('2026-11-23');
  });

  it('rejects negative or non-integer offsets', () => {
    expect(() => settlementDate('2026-11-19', -1)).toThrow(RangeError);
    expect(() => settlementDate('2026-11-19', 1.5)).toThrow(RangeError);
  });
});
