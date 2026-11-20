/**
 * Geographic registry for the 27 Brazilian federative units and their capitals.
 *
 * The capital names are the canonical spellings accepted by the `city` option.
 * Matching is accent- and case-insensitive (see `cityKey`) so both
 * "Sao Paulo" and "São Paulo" resolve to the same calendar.
 */

/** The 27 Brazilian federative units (26 states + Distrito Federal). */
export const UF_LIST = [
  'AC',
  'AL',
  'AM',
  'AP',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MG',
  'MS',
  'MT',
  'PA',
  'PB',
  'PE',
  'PI',
  'PR',
  'RJ',
  'RN',
  'RO',
  'RR',
  'RS',
  'SC',
  'SE',
  'SP',
  'TO',
] as const;

/** A Brazilian federative unit code. */
export type UF = (typeof UF_LIST)[number];

const ufSet: ReadonlySet<string> = new Set<string>(UF_LIST);

/** True when `value` is one of the 27 UF codes. */
export function isUF(value: unknown): value is UF {
  return typeof value === 'string' && ufSet.has(value);
}

/** Canonical capital of each UF. */
export const CAPITAL_BY_UF: Readonly<Record<UF, string>> = {
  AC: 'Rio Branco',
  AL: 'Maceió',
  AM: 'Manaus',
  AP: 'Macapá',
  BA: 'Salvador',
  CE: 'Fortaleza',
  DF: 'Brasília',
  ES: 'Vitória',
  GO: 'Goiânia',
  MA: 'São Luís',
  MG: 'Belo Horizonte',
  MS: 'Campo Grande',
  MT: 'Cuiabá',
  PA: 'Belém',
  PB: 'João Pessoa',
  PE: 'Recife',
  PI: 'Teresina',
  PR: 'Curitiba',
  RJ: 'Rio de Janeiro',
  RN: 'Natal',
  RO: 'Porto Velho',
  RR: 'Boa Vista',
  RS: 'Porto Alegre',
  SC: 'Florianópolis',
  SE: 'Aracaju',
  SP: 'São Paulo',
  TO: 'Palmas',
};

/** Lowercase, unaccented lookup key for a city name. */
export function cityKey(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

const capitalKeyToName = new Map<string, string>();
const cityToUF = new Map<string, UF>();
for (const uf of UF_LIST) {
  const capital = CAPITAL_BY_UF[uf];
  capitalKeyToName.set(cityKey(capital), capital);
  cityToUF.set(cityKey(capital), uf);
}

/** All 27 canonical capital names. */
export const CAPITALS: readonly string[] = UF_LIST.map((uf) => CAPITAL_BY_UF[uf]);

/** Resolve a user-supplied city name to its canonical capital spelling. */
export function canonicalCapital(value: string): string | undefined {
  return capitalKeyToName.get(cityKey(value));
}

/** UF of a capital city, or `undefined` when the name is not a capital. */
export function ufOfCapital(value: string): UF | undefined {
  return cityToUF.get(cityKey(value));
}
