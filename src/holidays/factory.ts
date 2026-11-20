/** Small builders that stamp scope metadata onto verified holiday rules. */
import { cityKey, type UF } from './geo.js';
import type { EasterOffsetRule, FixedRule } from './types.js';

interface CommonSpec {
  readonly id: string;
  readonly namePt: string;
  readonly nameEn: string;
  /** Exact law/decree number and article, copied from the official norm. */
  readonly law: string;
  /** Official URL where the norm can be checked. */
  readonly source: string;
  readonly since?: number;
  readonly until?: number;
  readonly note?: string;
}

interface FixedSpec extends CommonSpec {
  readonly month: number;
  readonly day: number;
}

interface EasterSpec extends CommonSpec {
  readonly offset: number;
}

function prefix(scope: string): string {
  return scope.length === 2 ? scope.toLowerCase() : cityKey(scope).replace(/\s+/g, '-');
}

function common(spec: CommonSpec, scope: string): CommonSpec {
  return {
    id: `${prefix(scope)}-${spec.id}`,
    namePt: spec.namePt,
    nameEn: spec.nameEn,
    law: spec.law,
    source: spec.source,
    ...(spec.since === undefined ? {} : { since: spec.since }),
    ...(spec.until === undefined ? {} : { until: spec.until }),
    ...(spec.note === undefined ? {} : { note: spec.note }),
  };
}

/** Build a fixed-date state holiday rule. */
export function stateFixed(uf: UF, spec: FixedSpec): FixedRule {
  return {
    ...common(spec, uf),
    kind: 'fixed',
    type: 'state',
    uf,
    month: spec.month,
    day: spec.day,
  };
}

/** Build an Easter-relative state holiday rule. */
export function stateEaster(uf: UF, spec: EasterSpec): EasterOffsetRule {
  return { ...common(spec, uf), kind: 'easter', type: 'state', uf, offset: spec.offset };
}

/** Build a fixed-date municipal holiday rule for a capital city. */
export function municipalFixed(city: string, spec: FixedSpec): FixedRule {
  return {
    ...common(spec, city),
    kind: 'fixed',
    type: 'municipal',
    city,
    month: spec.month,
    day: spec.day,
  };
}

/** Build an Easter-relative municipal holiday rule for a capital city. */
export function municipalEaster(city: string, spec: EasterSpec): EasterOffsetRule {
  return { ...common(spec, city), kind: 'easter', type: 'municipal', city, offset: spec.offset };
}
