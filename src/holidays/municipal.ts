/**
 * Capital-city municipal holiday rules — every entry verified against an
 * official prefeitura/câmara source. Each comment records the exact norm and
 * the official URL that was checked. Pontos facultativos are excluded.
 *
 * Brasília has no entry: the Distrito Federal is not a municipality (CF art.
 * 32), so its local feriados are district law and live in `state.ts` under DF.
 */
import { municipalEaster, municipalFixed } from './factory.js';
import type { HolidayRule } from './types.js';

/** Verified municipal holiday rules, keyed by canonical capital name. */
export const municipalRulesByCapital: Readonly<Record<string, readonly HolidayRule[]>> = {
  'Rio Branco': [
    // Lei Municipal nº 1.557, de 05/12/2005 + parágrafo único acrescentado pela
    // Lei nº 1.609, de 25/10/2006. Confederação pelo calendário oficial RBPREV.
    // https://portalcgm.riobranco.ac.gov.br/lai/institucional/prefeito/
    municipalFixed('Rio Branco', {
      id: 'aniversario',
      month: 12,
      day: 28,
      namePt: 'Aniversário do Município de Rio Branco',
      nameEn: 'Anniversary of Rio Branco',
      law: 'Lei Municipal nº 1.557, de 5 de dezembro de 2005; Lei Municipal nº 1.609, de 25 de outubro de 2006',
      source: 'https://portalcgm.riobranco.ac.gov.br/lai/institucional/prefeito/',
      since: 2006,
    }),
  ],

  Maceió: [
    // Lei Municipal nº 1.391, de 16/05/1967; Decreto nº 10.234/2025.
    // https://maceio.al.gov.br/feriados-municipais
    municipalEaster('Maceió', {
      id: 'sexta-feira-santa',
      offset: -2,
      namePt: 'Sexta-Feira da Paixão',
      nameEn: 'Good Friday',
      law: 'Lei Municipal nº 1.391, de 16 de maio de 1967; Decreto Municipal nº 10.234, de 2025',
      source: 'https://maceio.al.gov.br/feriados-municipais',
    }),
    // Lei Municipal nº 1.391/1967. (same official source)
    municipalEaster('Maceió', {
      id: 'corpus-christi',
      offset: 60,
      namePt: 'Corpus Christi',
      nameEn: 'Corpus Christi',
      law: 'Lei Municipal nº 1.391, de 16 de maio de 1967; Decreto Municipal nº 10.234, de 2025',
      source: 'https://maceio.al.gov.br/feriados-municipais',
    }),
    // Lei Municipal nº 1.391/1967. (same official source)
    municipalFixed('Maceió', {
      id: 'marechal-floriano',
      month: 6,
      day: 29,
      namePt: 'Marechal Floriano Peixoto',
      nameEn: 'Marshal Floriano Peixoto Day',
      law: 'Lei Municipal nº 1.391, de 16 de maio de 1967',
      source: 'https://maceio.al.gov.br/feriados-municipais',
    }),
    // Lei Municipal nº 1.391/1967. (same official source)
    municipalFixed('Maceió', {
      id: 'padroeira',
      month: 8,
      day: 27,
      namePt: 'Nossa Senhora dos Prazeres, Padroeira de Maceió',
      nameEn: 'Our Lady of Pleasures, Patroness of Maceió',
      law: 'Lei Municipal nº 1.391, de 16 de maio de 1967',
      source: 'https://maceio.al.gov.br/feriados-municipais',
    }),
    // Lei Municipal nº 1.391/1967. (same official source)
    municipalFixed('Maceió', {
      id: 'conceicao',
      month: 12,
      day: 8,
      namePt: 'Nossa Senhora da Conceição',
      nameEn: 'Immaculate Conception',
      law: 'Lei Municipal nº 1.391, de 16 de maio de 1967',
      source: 'https://maceio.al.gov.br/feriados-municipais',
    }),
  ],

  Manaus: [
    // Lei nº 448, de 11/11/1998.
    // https://www.manaus.am.gov.br/prefeitura/feriados-municipais
    municipalEaster('Manaus', {
      id: 'terca-carnaval',
      offset: -47,
      namePt: 'Terça-feira de Carnaval',
      nameEn: 'Carnaval Tuesday',
      law: 'Lei nº 448, de 11 de novembro de 1998',
      source: 'https://www.manaus.am.gov.br/prefeitura/feriados-municipais',
    }),
    // Lei nº 1.001, de 10/06/2006. (same official source)
    municipalEaster('Manaus', {
      id: 'paixao-cristo',
      offset: -2,
      namePt: 'Paixão de Cristo',
      nameEn: 'Good Friday',
      law: 'Lei nº 1.001, de 10 de junho de 2006',
      source: 'https://www.manaus.am.gov.br/prefeitura/feriados-municipais',
    }),
    // Lei nº 970, de 11/05/2006. (same official source)
    municipalEaster('Manaus', {
      id: 'corpus-christi',
      offset: 60,
      namePt: 'Corpus Christi',
      nameEn: 'Corpus Christi',
      law: 'Lei nº 970, de 11 de maio de 2006',
      source: 'https://www.manaus.am.gov.br/prefeitura/feriados-municipais',
    }),
    // Lei Orgânica do Município de Manaus, art. 437, I. (same official source)
    municipalFixed('Manaus', {
      id: 'elevacao-provincia',
      month: 9,
      day: 5,
      namePt: 'Elevação do Amazonas à categoria de Província',
      nameEn: 'Elevation of Amazonas to Province',
      law: 'Lei Orgânica do Município de Manaus, art. 437, I',
      source: 'https://www.manaus.am.gov.br/prefeitura/feriados-municipais',
    }),
    // Lei Orgânica do Município de Manaus, art. 437, II. (same official source)
    municipalFixed('Manaus', {
      id: 'elevacao-cidade',
      month: 10,
      day: 24,
      namePt: 'Elevação de Manaus à categoria de Cidade',
      nameEn: 'Anniversary of Manaus',
      law: 'Lei Orgânica do Município de Manaus, art. 437, II',
      source: 'https://www.manaus.am.gov.br/prefeitura/feriados-municipais',
    }),
    // Lei nº 496, de 05/10/1999. (same official source)
    municipalFixed('Manaus', {
      id: 'conceicao',
      month: 12,
      day: 8,
      namePt: 'Nossa Senhora da Conceição, Padroeira de Manaus',
      nameEn: 'Immaculate Conception, Patron Saint of Manaus',
      law: 'Lei nº 496, de 5 de outubro de 1999',
      source: 'https://www.manaus.am.gov.br/prefeitura/feriados-municipais',
    }),
  ],

  Macapá: [
    // Lei nº 128/80 — lei confirmada pela Prefeitura de Macapá em comunicado oficial.
    // https://agencia.macapa.ap.gov.br/prefeitura-decreta-feriado-de-nossa-senhora-da-conceicao-nesta-segunda-feira-8-veja-como-funcionara-o-atendimento-publico
    municipalFixed('Macapá', {
      id: 'conceicao',
      month: 12,
      day: 8,
      namePt: 'Nossa Senhora da Conceição',
      nameEn: 'Immaculate Conception',
      law: 'Lei Municipal nº 128, de 1980',
      source:
        'https://agencia.macapa.ap.gov.br/prefeitura-decreta-feriado-de-nossa-senhora-da-conceicao-nesta-segunda-feira-8-veja-como-funcionara-o-atendimento-publico',
    }),
  ],

  Salvador: [
    // Lei Municipal nº 1.997, de 21/06/1967 — tabela oficial INPI.
    // https://www.gov.br/inpi/pt-br/central-de-conteudo/legislacao/arquivos/documentos/2024pr-11-divulga-os-dias-de-feriados-e-estabelece-os-dias-de-ponto-facultativo-regionais-no-ano-de-2024.pdf
    municipalFixed('Salvador', {
      id: 'sao-joao',
      month: 6,
      day: 24,
      namePt: 'Dia de São João',
      nameEn: "St. John's Day",
      law: 'Lei Municipal nº 1.997, de 21 de junho de 1967',
      source:
        'https://www.gov.br/inpi/pt-br/central-de-conteudo/legislacao/arquivos/documentos/2024pr-11-divulga-os-dias-de-feriados-e-estabelece-os-dias-de-ponto-facultativo-regionais-no-ano-de-2024.pdf',
    }),
    // Lei Municipal nº 1.997/1967. (same official source)
    municipalFixed('Salvador', {
      id: 'conceicao',
      month: 12,
      day: 8,
      namePt: 'Nossa Senhora da Conceição',
      nameEn: 'Immaculate Conception',
      law: 'Lei Municipal nº 1.997, de 21 de junho de 1967',
      source:
        'https://www.gov.br/inpi/pt-br/central-de-conteudo/legislacao/arquivos/documentos/2024pr-11-divulga-os-dias-de-feriados-e-estabelece-os-dias-de-ponto-facultativo-regionais-no-ano-de-2024.pdf',
    }),
  ],

  Fortaleza: [
    // Lei Municipal nº 8.796, de 09/12/2003, art. 1º, "a" — fetched.
    // https://sapl.fortaleza.ce.leg.br/ta/2208/text
    municipalFixed('Fortaleza', {
      id: 'sao-jose',
      month: 3,
      day: 19,
      namePt: 'Dia de São José',
      nameEn: "Saint Joseph's Day",
      law: 'Lei Municipal nº 8.796, de 9 de dezembro de 2003, art. 1º, "a"',
      source: 'https://sapl.fortaleza.ce.leg.br/ta/2208/text',
    }),
    // Lei Municipal nº 8.796/2003, art. 1º, "a". (same official source)
    municipalFixed('Fortaleza', {
      id: 'assuncao',
      month: 8,
      day: 15,
      namePt: 'Nossa Senhora da Assunção, Padroeira de Fortaleza',
      nameEn: 'Our Lady of the Assumption, Patroness of Fortaleza',
      law: 'Lei Municipal nº 8.796, de 9 de dezembro de 2003, art. 1º, "a"',
      source: 'https://sapl.fortaleza.ce.leg.br/ta/2208/text',
    }),
    // Lei Municipal nº 8.796/2003, art. 1º, "b". (same official source)
    municipalEaster('Fortaleza', {
      id: 'sexta-feira-santa',
      offset: -2,
      namePt: 'Sexta-Feira Santa',
      nameEn: 'Good Friday',
      law: 'Lei Municipal nº 8.796, de 9 de dezembro de 2003, art. 1º, "b"',
      source: 'https://sapl.fortaleza.ce.leg.br/ta/2208/text',
    }),
    // Lei Municipal nº 8.796/2003, art. 1º, "b". (same official source)
    municipalEaster('Fortaleza', {
      id: 'corpus-christi',
      offset: 60,
      namePt: 'Corpus Christi',
      nameEn: 'Corpus Christi',
      law: 'Lei Municipal nº 8.796, de 9 de dezembro de 2003, art. 1º, "b"',
      source: 'https://sapl.fortaleza.ce.leg.br/ta/2208/text',
    }),
  ],

  // O Distrito Federal não é município (CF art. 32): não há lei municipal.
  Brasília: [],

  Vitória: [
    // Lei nº 1.732, de 1967 — calendário oficial da Prefeitura de Vitória.
    // https://www.vitoria.es.gov.br/servidor/calendario-de-feriados-do-municipio
    municipalEaster('Vitória', {
      id: 'sexta-feira-santa',
      offset: -2,
      namePt: 'Sexta-Feira da Paixão',
      nameEn: 'Good Friday',
      law: 'Lei nº 1.732, de 1967',
      source: 'https://www.vitoria.es.gov.br/servidor/calendario-de-feriados-do-municipio',
    }),
    // Lei nº 1.732/1967 + Lei Estadual nº 11.010/2019. (same official source)
    municipalEaster('Vitória', {
      id: 'penha',
      offset: 8,
      namePt: 'Nossa Senhora da Penha',
      nameEn: 'Our Lady of Penha',
      law: 'Lei nº 1.732, de 1967; Lei Estadual nº 11.010, de 3 de julho de 2019',
      source: 'https://www.vitoria.es.gov.br/servidor/calendario-de-feriados-do-municipio',
    }),
    // Lei nº 1.732/1967. (same official source)
    municipalEaster('Vitória', {
      id: 'corpus-christi',
      offset: 60,
      namePt: 'Corpus Christi',
      nameEn: 'Corpus Christi',
      law: 'Lei nº 1.732, de 1967',
      source: 'https://www.vitoria.es.gov.br/servidor/calendario-de-feriados-do-municipio',
    }),
    // Lei nº 1.732/1967. (same official source)
    municipalFixed('Vitória', {
      id: 'aniversario',
      month: 9,
      day: 8,
      namePt: 'Nossa Senhora da Vitória (Aniversário de Vitória)',
      nameEn: 'Our Lady of Victory / Vitória Anniversary',
      law: 'Lei nº 1.732, de 1967',
      source: 'https://www.vitoria.es.gov.br/servidor/calendario-de-feriados-do-municipio',
    }),
  ],

  Goiânia: [
    // Lei nº 701/1956. https://www.goiania.go.gov.br/shtml/guarda/eventos.shtml
    municipalFixed('Goiânia', {
      id: 'padroeira',
      month: 5,
      day: 24,
      namePt: 'Nossa Senhora Auxiliadora, Padroeira de Goiânia',
      nameEn: 'Our Lady of Help, Patron Saint of Goiânia',
      law: 'Lei nº 701, de 1956',
      source: 'https://www.goiania.go.gov.br/shtml/guarda/eventos.shtml',
    }),
    // Lei nº 6.968, de 19/06/1991.
    // https://www.goiania.go.gov.br/html/gabinete_civil/sileg/dados/legis/1991/lo_19910619_000006968.html
    municipalFixed('Goiânia', {
      id: 'aniversario',
      month: 10,
      day: 24,
      namePt: 'Aniversário de Goiânia',
      nameEn: 'Anniversary of Goiânia',
      law: 'Lei nº 6.968, de 19 de junho de 1991',
      source:
        'https://www.goiania.go.gov.br/html/gabinete_civil/sileg/dados/legis/1991/lo_19910619_000006968.html',
    }),
    // Lei nº 100, de 11/12/1951.
    // https://www.goiania.go.gov.br/html/gabinete_civil/sileg/dados/legis/2008/decreto12102008.pdf
    municipalEaster('Goiânia', {
      id: 'paixao-cristo',
      offset: -2,
      namePt: 'Paixão de Cristo',
      nameEn: 'Good Friday',
      law: 'Lei nº 100, de 11 de dezembro de 1951',
      source:
        'https://www.goiania.go.gov.br/html/gabinete_civil/sileg/dados/legis/2008/decreto12102008.pdf',
    }),
    // Lei nº 100/1951. (same official source)
    municipalEaster('Goiânia', {
      id: 'corpus-christi',
      offset: 60,
      namePt: 'Corpus Christi',
      nameEn: 'Corpus Christi',
      law: 'Lei nº 100, de 11 de dezembro de 1951',
      source:
        'https://www.goiania.go.gov.br/html/gabinete_civil/sileg/dados/legis/2008/decreto12102008.pdf',
    }),
  ],

  'São Luís': [
    // Lei Municipal nº 3.432, de 06/02/1996.
    // https://diariooficial.saoluis.ma.gov.br/portal/calendario
    municipalFixed('São Luís', {
      id: 'sao-pedro',
      month: 6,
      day: 29,
      namePt: 'Dia de São Pedro',
      nameEn: "Saint Peter's Day",
      law: 'Lei Municipal nº 3.432, de 6 de fevereiro de 1996',
      source: 'https://diariooficial.saoluis.ma.gov.br/portal/calendario',
    }),
    // Decreto nº 62.168, de 24/12/2025 (calendário oficial). (same official source)
    municipalFixed('São Luís', {
      id: 'aniversario',
      month: 9,
      day: 8,
      namePt: 'Natividade de Nossa Senhora / Aniversário de São Luís',
      nameEn: 'Nativity of Our Lady / Anniversary of São Luís',
      law: 'Decreto Municipal nº 62.168, de 24 de dezembro de 2025',
      source: 'https://diariooficial.saoluis.ma.gov.br/portal/calendario',
    }),
    // Lei Municipal nº 3.432/1996. (same official source)
    municipalFixed('São Luís', {
      id: 'conceicao',
      month: 12,
      day: 8,
      namePt: 'Dia de Nossa Senhora da Conceição',
      nameEn: 'Immaculate Conception Day',
      law: 'Lei Municipal nº 3.432, de 6 de fevereiro de 1996',
      source: 'https://diariooficial.saoluis.ma.gov.br/portal/calendario',
    }),
  ],

  'Belo Horizonte': [
    // Lei Municipal nº 1.327, de 08/02/1967 — Diário Oficial do Município.
    // https://prefeitura.pbh.gov.br/sites/default/files/estrutura-de-governo/controladoria/2018/documentos/FERIADOS/DOM%20-%20Di%C3%A1rio%20Oficial%20do%20Munic%C3%ADpio%20_FERIADOS_2018.pdf
    municipalEaster('Belo Horizonte', {
      id: 'sexta-feira-santa',
      offset: -2,
      namePt: 'Sexta-Feira da Paixão',
      nameEn: 'Good Friday',
      law: 'Lei Municipal nº 1.327, de 8 de fevereiro de 1967',
      source:
        'https://prefeitura.pbh.gov.br/sites/default/files/estrutura-de-governo/controladoria/2018/documentos/FERIADOS/DOM%20-%20Di%C3%A1rio%20Oficial%20do%20Munic%C3%ADpio%20_FERIADOS_2018.pdf',
    }),
    // Lei Municipal nº 1.327/1967. (same official source)
    municipalEaster('Belo Horizonte', {
      id: 'corpus-christi',
      offset: 60,
      namePt: 'Corpus Christi',
      nameEn: 'Corpus Christi',
      law: 'Lei Municipal nº 1.327, de 8 de fevereiro de 1967',
      source:
        'https://prefeitura.pbh.gov.br/sites/default/files/estrutura-de-governo/controladoria/2018/documentos/FERIADOS/DOM%20-%20Di%C3%A1rio%20Oficial%20do%20Munic%C3%ADpio%20_FERIADOS_2018.pdf',
    }),
    // Lei Municipal nº 1.327/1967. (same official source)
    municipalFixed('Belo Horizonte', {
      id: 'assuncao',
      month: 8,
      day: 15,
      namePt: 'Assunção de Nossa Senhora',
      nameEn: 'Assumption of Our Lady',
      law: 'Lei Municipal nº 1.327, de 8 de fevereiro de 1967',
      source:
        'https://prefeitura.pbh.gov.br/sites/default/files/estrutura-de-governo/controladoria/2018/documentos/FERIADOS/DOM%20-%20Di%C3%A1rio%20Oficial%20do%20Munic%C3%ADpio%20_FERIADOS_2018.pdf',
    }),
    // Lei Municipal nº 1.327/1967. (same official source)
    municipalFixed('Belo Horizonte', {
      id: 'conceicao',
      month: 12,
      day: 8,
      namePt: 'Imaculada Conceição',
      nameEn: 'Immaculate Conception',
      law: 'Lei Municipal nº 1.327, de 8 de fevereiro de 1967',
      source:
        'https://prefeitura.pbh.gov.br/sites/default/files/estrutura-de-governo/controladoria/2018/documentos/FERIADOS/DOM%20-%20Di%C3%A1rio%20Oficial%20do%20Munic%C3%ADpio%20_FERIADOS_2018.pdf',
    }),
  ],

  'Campo Grande': [
    // Lei Municipal nº 3.901, de 29/10/2001.
    // https://www.campogrande.ms.gov.br/cgnoticias/noticia/no-dia-do-padroeiro-missa-campal-reune-5-mil-fieis-na-praca-do-radio/
    municipalFixed('Campo Grande', {
      id: 'santo-antonio',
      month: 6,
      day: 13,
      namePt: 'Dia de Santo Antônio, Padroeiro de Campo Grande',
      nameEn: "St. Anthony's Day, Patron Saint of Campo Grande",
      law: 'Lei Municipal nº 3.901, de 29 de outubro de 2001',
      source:
        'https://www.campogrande.ms.gov.br/cgnoticias/noticia/no-dia-do-padroeiro-missa-campal-reune-5-mil-fieis-na-praca-do-radio/',
    }),
    // Lei Municipal nº 1.019, de 16/05/1967, art. 1º — texto oficial no TRT24.
    // https://www.trt24.jus.br/documents/20182/3304070/Lei+municipal+Campo+Grande+anivers%C3%A1rio+e+Corpus+Christi.pdf/228c4212-ef65-4b92-aea3-7da039be2d58
    municipalFixed('Campo Grande', {
      id: 'aniversario',
      month: 8,
      day: 26,
      namePt: 'Aniversário de Campo Grande',
      nameEn: 'Anniversary of Campo Grande',
      law: 'Lei Municipal nº 1.019, de 16 de maio de 1967, art. 1º',
      source:
        'https://www.trt24.jus.br/documents/20182/3304070/Lei+municipal+Campo+Grande+anivers%C3%A1rio+e+Corpus+Christi.pdf/228c4212-ef65-4b92-aea3-7da039be2d58',
    }),
    // Lei Municipal nº 1.019/1967. (same official source)
    municipalEaster('Campo Grande', {
      id: 'corpus-christi',
      offset: 60,
      namePt: 'Corpus Christi',
      nameEn: 'Corpus Christi',
      law: 'Lei Municipal nº 1.019, de 16 de maio de 1967, art. 1º',
      source:
        'https://www.trt24.jus.br/documents/20182/3304070/Lei+municipal+Campo+Grande+anivers%C3%A1rio+e+Corpus+Christi.pdf/228c4212-ef65-4b92-aea3-7da039be2d58',
      note: 'Decreto municipal anual pode tratá-la como ponto facultativo; a lei a classifica como feriado.',
    }),
  ],

  Cuiabá: [
    // Lei Municipal nº 1.077, de 02/04/1968 — Câmara Municipal de Cuiabá.
    // https://legislativo.camaracuiaba.mt.gov.br/Arquivo/Documents/legislacao/html/L10771968.html
    municipalFixed('Cuiabá', {
      id: 'fundacao',
      month: 4,
      day: 8,
      namePt: 'Fundação da Cidade de Cuiabá',
      nameEn: 'Foundation of Cuiabá',
      law: 'Lei Municipal nº 1.077, de 2 de abril de 1968',
      source:
        'https://legislativo.camaracuiaba.mt.gov.br/Arquivo/Documents/legislacao/html/L10771968.html',
    }),
    // Lei Municipal nº 1.077/1968. (same official source)
    municipalEaster('Cuiabá', {
      id: 'corpus-christi',
      offset: 60,
      namePt: 'Corpus Christi',
      nameEn: 'Corpus Christi',
      law: 'Lei Municipal nº 1.077, de 2 de abril de 1968',
      source:
        'https://legislativo.camaracuiaba.mt.gov.br/Arquivo/Documents/legislacao/html/L10771968.html',
    }),
    // Lei Municipal nº 5.576, de 24/08/2012.
    // https://www.cuiaba.mt.gov.br/upload/arquivo/lei_municipal.pdf
    municipalFixed('Cuiabá', {
      id: 'conceicao',
      month: 12,
      day: 8,
      namePt: 'Imaculada Conceição de Maria',
      nameEn: 'Immaculate Conception',
      law: 'Lei Municipal nº 5.576, de 24 de agosto de 2012',
      source: 'https://www.cuiaba.mt.gov.br/upload/arquivo/lei_municipal.pdf',
    }),
  ],

  Belém: [
    // Decreto nº 113.488, de 14/02/2025 (calendário oficial da Prefeitura).
    // https://pgm.belem.pa.gov.br/legislacao/calendario-eventos
    municipalFixed('Belém', {
      id: 'aniversario',
      month: 1,
      day: 12,
      namePt: 'Aniversário de Belém',
      nameEn: 'Anniversary of Belém',
      law: 'Decreto Municipal nº 113.488, de 14 de fevereiro de 2025',
      source: 'https://pgm.belem.pa.gov.br/legislacao/calendario-eventos',
      note: 'Lei municipal instituidora original não localizada; data confirmada no calendário oficial.',
    }),
    // Decreto nº 113.488/2025. (same official source)
    municipalFixed('Belém', {
      id: 'pos-cirio',
      month: 10,
      day: 12,
      namePt: 'Pós-Círio',
      nameEn: 'Post-Círio',
      law: 'Decreto Municipal nº 113.488, de 14 de fevereiro de 2025',
      source: 'https://pgm.belem.pa.gov.br/legislacao/calendario-eventos',
      note: 'Lei municipal instituidora original não localizada; data confirmada no calendário oficial.',
    }),
    // Decreto nº 113.488/2025. (same official source)
    municipalFixed('Belém', {
      id: 'conceicao',
      month: 12,
      day: 8,
      namePt: 'Nossa Senhora da Conceição',
      nameEn: 'Immaculate Conception',
      law: 'Decreto Municipal nº 113.488, de 14 de fevereiro de 2025',
      source: 'https://pgm.belem.pa.gov.br/legislacao/calendario-eventos',
      note: 'Lei municipal instituidora original não localizada; data confirmada no calendário oficial.',
    }),
  ],

  'João Pessoa': [
    // Lei Ordinária nº 13.768, de 04/07/2019, art. 5º, II.
    // https://sapl.joaopessoa.pb.leg.br/media/sapl/public/normajuridica/2019/18034/lei_no_13.768_-2019.pdf
    municipalFixed('João Pessoa', {
      id: 'sao-joao',
      month: 6,
      day: 24,
      namePt: 'Dia de São João',
      nameEn: "St. John's Day",
      law: 'Lei Ordinária nº 13.768, de 4 de julho de 2019, art. 5º, II',
      source:
        'https://sapl.joaopessoa.pb.leg.br/media/sapl/public/normajuridica/2019/18034/lei_no_13.768_-2019.pdf',
    }),
    // Lei Ordinária nº 13.768/2019, art. 5º, III. (same official source)
    municipalFixed('João Pessoa', {
      id: 'neves',
      month: 8,
      day: 5,
      namePt: 'Dia de Nossa Senhora das Neves',
      nameEn: 'Our Lady of the Snows Day',
      law: 'Lei Ordinária nº 13.768, de 4 de julho de 2019, art. 5º, III',
      source:
        'https://sapl.joaopessoa.pb.leg.br/media/sapl/public/normajuridica/2019/18034/lei_no_13.768_-2019.pdf',
    }),
  ],

  Recife: [
    // Lei Municipal nº 9.777, de 06/06/1967 — texto oficial na Alepe.
    // https://legis.alepe.pe.gov.br/texto.aspx?id=87016
    municipalEaster('Recife', {
      id: 'sexta-feira-santa',
      offset: -2,
      namePt: 'Sexta-Feira Santa',
      nameEn: 'Good Friday',
      law: 'Lei Municipal nº 9.777, de 6 de junho de 1967',
      source: 'https://legis.alepe.pe.gov.br/texto.aspx?id=87016',
    }),
    // Lei Municipal nº 9.777/1967. (same official source)
    municipalFixed('Recife', {
      id: 'sao-joao',
      month: 6,
      day: 24,
      namePt: 'Dia de São João',
      nameEn: "St. John's Day",
      law: 'Lei Municipal nº 9.777, de 6 de junho de 1967',
      source: 'https://legis.alepe.pe.gov.br/texto.aspx?id=87016',
    }),
    // Lei Municipal nº 9.777/1967. (same official source)
    municipalFixed('Recife', {
      id: 'carmo',
      month: 7,
      day: 16,
      namePt: 'Nossa Senhora do Carmo, Padroeira do Recife',
      nameEn: 'Our Lady of Mount Carmel, Patroness of Recife',
      law: 'Lei Municipal nº 9.777, de 6 de junho de 1967',
      source: 'https://legis.alepe.pe.gov.br/texto.aspx?id=87016',
    }),
    // Lei Municipal nº 9.777/1967. (same official source)
    municipalFixed('Recife', {
      id: 'conceicao',
      month: 12,
      day: 8,
      namePt: 'Dia de Nossa Senhora da Conceição',
      nameEn: 'Immaculate Conception Day',
      law: 'Lei Municipal nº 9.777, de 6 de junho de 1967',
      source: 'https://legis.alepe.pe.gov.br/texto.aspx?id=87016',
    }),
  ],

  Teresina: [
    // Lei Municipal nº 2.275, de 11/01/1994, § 1º (redação Lei nº 2.847/1999).
    // https://pmt.pi.gov.br/wp-content/uploads/sites/34/2020/06/Lei-n%C2%BA-5.510-de-14.04.2020-Covid-19-Antecipa-Feriado-Anivers%C3%A1rio-de-Teresina....pdf
    municipalEaster('Teresina', {
      id: 'sexta-feira-santa',
      offset: -2,
      namePt: 'Sexta-Feira Santa',
      nameEn: 'Good Friday',
      law: 'Lei Municipal nº 2.275, de 11 de janeiro de 1994, § 1º (Lei nº 2.847, de 1999)',
      source:
        'https://pmt.pi.gov.br/wp-content/uploads/sites/34/2020/06/Lei-n%C2%BA-5.510-de-14.04.2020-Covid-19-Antecipa-Feriado-Anivers%C3%A1rio-de-Teresina....pdf',
    }),
    // Lei Municipal nº 2.275/1994. (same official source)
    municipalEaster('Teresina', {
      id: 'corpus-christi',
      offset: 60,
      namePt: 'Corpus Christi',
      nameEn: 'Corpus Christi',
      law: 'Lei Municipal nº 2.275, de 11 de janeiro de 1994, § 1º (Lei nº 2.847, de 1999)',
      source:
        'https://pmt.pi.gov.br/wp-content/uploads/sites/34/2020/06/Lei-n%C2%BA-5.510-de-14.04.2020-Covid-19-Antecipa-Feriado-Anivers%C3%A1rio-de-Teresina....pdf',
    }),
    // Lei Municipal nº 2.275/1994. (same official source)
    municipalFixed('Teresina', {
      id: 'finados',
      month: 11,
      day: 2,
      namePt: 'Dia de Finados',
      nameEn: "All Souls' Day",
      law: 'Lei Municipal nº 2.275, de 11 de janeiro de 1994, § 1º (Lei nº 2.847, de 1999)',
      source:
        'https://pmt.pi.gov.br/wp-content/uploads/sites/34/2020/06/Lei-n%C2%BA-5.510-de-14.04.2020-Covid-19-Antecipa-Feriado-Anivers%C3%A1rio-de-Teresina....pdf',
    }),
    // Lei Municipal nº 2.275/1994. (same official source)
    municipalFixed('Teresina', {
      id: 'conceicao',
      month: 12,
      day: 8,
      namePt: 'Nossa Senhora da Conceição',
      nameEn: 'Immaculate Conception',
      law: 'Lei Municipal nº 2.275, de 11 de janeiro de 1994, § 1º (Lei nº 2.847, de 1999)',
      source:
        'https://pmt.pi.gov.br/wp-content/uploads/sites/34/2020/06/Lei-n%C2%BA-5.510-de-14.04.2020-Covid-19-Antecipa-Feriado-Anivers%C3%A1rio-de-Teresina....pdf',
    }),
    // Lei Municipal nº 2.275/1994. (same official source)
    municipalFixed('Teresina', {
      id: 'aniversario',
      month: 8,
      day: 16,
      namePt: 'Aniversário de Teresina',
      nameEn: 'Anniversary of Teresina',
      law: 'Lei Municipal nº 2.275, de 11 de janeiro de 1994, § 1º (Lei nº 2.847, de 1999)',
      source:
        'https://pmt.pi.gov.br/wp-content/uploads/sites/34/2020/06/Lei-n%C2%BA-5.510-de-14.04.2020-Covid-19-Antecipa-Feriado-Anivers%C3%A1rio-de-Teresina....pdf',
    }),
  ],

  Curitiba: [
    // Lei Municipal nº 3.015, de 24/08/1967 — Decreto nº 2.385/2025, art. 1º, IX.
    // https://legisladocexterno.curitiba.pr.gov.br/VisualizarHTML.aspx?id=458542
    municipalEaster('Curitiba', {
      id: 'corpus-christi',
      offset: 60,
      namePt: 'Corpus Christi',
      nameEn: 'Corpus Christi',
      law: 'Lei Municipal nº 3.015, de 24 de agosto de 1967',
      source: 'https://legisladocexterno.curitiba.pr.gov.br/VisualizarHTML.aspx?id=458542',
      note: 'Feriado religioso municipal; órgãos municipais funcionam em regime de ponto facultativo.',
    }),
    // Lei Municipal nº 3.015/1967 — Decreto nº 2.385/2025, art. 1º, XII. (same official source)
    municipalFixed('Curitiba', {
      id: 'nossa-senhora-luz',
      month: 9,
      day: 8,
      namePt: 'Nossa Senhora da Luz',
      nameEn: 'Our Lady of Light',
      law: 'Lei Municipal nº 3.015, de 24 de agosto de 1967',
      source: 'https://legisladocexterno.curitiba.pr.gov.br/VisualizarHTML.aspx?id=458542',
      note: 'Feriado religioso municipal; órgãos municipais funcionam em regime de ponto facultativo.',
    }),
  ],

  'Rio de Janeiro': [
    // Lei Orgânica do Município do Rio de Janeiro, art. 26.
    // https://www.rio.rj.gov.br/dlstatic/10112/151679/DLFE-4322.pdf/LeiOrganica.pdf
    municipalFixed('Rio de Janeiro', {
      id: 'sao-sebastiao',
      month: 1,
      day: 20,
      namePt: 'Dia de São Sebastião, Padroeiro da Cidade',
      nameEn: "Saint Sebastian's Day (city patron)",
      law: 'Lei Orgânica do Município do Rio de Janeiro, art. 26',
      source: 'https://www.rio.rj.gov.br/dlstatic/10112/151679/DLFE-4322.pdf/LeiOrganica.pdf',
    }),
  ],

  Natal: [
    // Lei nº 1.617, de 1967, art. 1º, "a" — Câmara Municipal de Natal.
    // https://sapl.natal.rn.leg.br/media/sapl/public/normajuridica/1967/3397/lei01617-67.pdf
    municipalFixed('Natal', {
      id: 'reis-magos',
      month: 1,
      day: 6,
      namePt: 'Dia de Reis Magos',
      nameEn: 'Epiphany / Three Kings Day',
      law: 'Lei nº 1.617, de 1967, art. 1º, "a"',
      source:
        'https://sapl.natal.rn.leg.br/media/sapl/public/normajuridica/1967/3397/lei01617-67.pdf',
    }),
    // Lei nº 1.617/1967, art. 1º, "b". (same official source)
    municipalEaster('Natal', {
      id: 'sexta-feira-paixao',
      offset: -2,
      namePt: 'Sexta-Feira da Paixão',
      nameEn: 'Good Friday',
      law: 'Lei nº 1.617, de 1967, art. 1º, "b"',
      source:
        'https://sapl.natal.rn.leg.br/media/sapl/public/normajuridica/1967/3397/lei01617-67.pdf',
    }),
  ],

  'Porto Velho': [
    // Lei Municipal nº 190, de 14/10/1980.
    // https://www.portovelho.ro.gov.br/artigo/18561/feriado-24-de-maio-dia-de-nossa-senhora-auxiliadora-padroeira-do-municipio
    municipalFixed('Porto Velho', {
      id: 'instalacao-municipio',
      month: 1,
      day: 24,
      namePt: 'Instalação do Município / São Francisco de Sales',
      nameEn: 'Installation of Porto Velho / St. Francis de Sales',
      law: 'Lei Municipal nº 190, de 14 de outubro de 1980',
      source:
        'https://www.portovelho.ro.gov.br/artigo/18561/feriado-24-de-maio-dia-de-nossa-senhora-auxiliadora-padroeira-do-municipio',
    }),
    // Lei Municipal nº 190/1980. (same official source)
    municipalFixed('Porto Velho', {
      id: 'padroeira',
      month: 5,
      day: 24,
      namePt: 'Nossa Senhora Auxiliadora, Padroeira do Município',
      nameEn: 'Our Lady of Help, Patron Saint of Porto Velho',
      law: 'Lei Municipal nº 190, de 14 de outubro de 1980',
      source:
        'https://www.portovelho.ro.gov.br/artigo/18561/feriado-24-de-maio-dia-de-nossa-senhora-auxiliadora-padroeira-do-municipio',
    }),
    // Lei Municipal nº 190/1980. (same official source)
    municipalFixed('Porto Velho', {
      id: 'criacao-municipio',
      month: 10,
      day: 2,
      namePt: 'Criação do Município de Porto Velho',
      nameEn: 'Creation of Porto Velho',
      law: 'Lei Municipal nº 190, de 14 de outubro de 1980',
      source:
        'https://www.portovelho.ro.gov.br/artigo/18561/feriado-24-de-maio-dia-de-nossa-senhora-auxiliadora-padroeira-do-municipio',
    }),
  ],

  'Boa Vista': [
    // Lei Municipal nº 104/84 — Prefeitura de Boa Vista.
    // https://boavista.rr.gov.br/noticias/2026/1/prefeitura-garante-servicos-essenciais-durante-feriado-prolongado-de-sao-sebastiao
    municipalFixed('Boa Vista', {
      id: 'sao-sebastiao',
      month: 1,
      day: 20,
      namePt: 'Dia de São Sebastião, Padroeiro de Boa Vista',
      nameEn: 'St. Sebastian, Patron Saint of Boa Vista',
      law: 'Lei Municipal nº 104, de 1984',
      source:
        'https://boavista.rr.gov.br/noticias/2026/1/prefeitura-garante-servicos-essenciais-durante-feriado-prolongado-de-sao-sebastiao',
    }),
    // Lei Municipal nº 104/84.
    // https://boavista.rr.gov.br/noticias/2026/6/comunicado-servicos-essenciais-funcionarao-normalmente-durante-feriado-de-sao-pedro
    municipalFixed('Boa Vista', {
      id: 'sao-pedro',
      month: 6,
      day: 29,
      namePt: 'Dia de São Pedro',
      nameEn: "St. Peter's Day",
      law: 'Lei Municipal nº 104, de 1984',
      source:
        'https://boavista.rr.gov.br/noticias/2026/6/comunicado-servicos-essenciais-funcionarao-normalmente-durante-feriado-de-sao-pedro',
    }),
    // Lei Municipal nº 1.705/2016.
    // https://boavista.rr.gov.br/noticias/2026/7/prefeitura-mantera-funcionamento-dos-servicos-essenciais-durante-feriadao-de-aniversario-de-boa-vista
    municipalFixed('Boa Vista', {
      id: 'aniversario',
      month: 7,
      day: 9,
      namePt: 'Aniversário de Boa Vista',
      nameEn: 'Boa Vista Anniversary',
      law: 'Lei Municipal nº 1.705, de 2016',
      source:
        'https://boavista.rr.gov.br/noticias/2026/7/prefeitura-mantera-funcionamento-dos-servicos-essenciais-durante-feriadao-de-aniversario-de-boa-vista',
    }),
  ],

  'Porto Alegre': [
    // Lei Municipal nº 3.033, de 1967 — Prefeitura de Porto Alegre.
    // https://prefeitura.poa.br/gcs/noticias/aniversario-de-porto-alegre-nao-e-feriado-municipal
    municipalFixed('Porto Alegre', {
      id: 'navegantes',
      month: 2,
      day: 2,
      namePt: 'Dia de Nossa Senhora dos Navegantes e Iemanjá',
      nameEn: 'Our Lady of Navigators / Iemanjá Day',
      law: 'Lei Municipal nº 3.033, de 1967',
      source:
        'https://prefeitura.poa.br/gcs/noticias/aniversario-de-porto-alegre-nao-e-feriado-municipal',
    }),
    // Lei Municipal nº 3.033/1967. (same official source)
    municipalEaster('Porto Alegre', {
      id: 'sexta-feira-santa',
      offset: -2,
      namePt: 'Sexta-Feira da Paixão',
      nameEn: 'Good Friday',
      law: 'Lei Municipal nº 3.033, de 1967',
      source:
        'https://prefeitura.poa.br/gcs/noticias/aniversario-de-porto-alegre-nao-e-feriado-municipal',
    }),
    // Lei Municipal nº 3.033/1967 (redação Lei nº 4.453/1978). (same official source)
    municipalEaster('Porto Alegre', {
      id: 'corpus-christi',
      offset: 60,
      namePt: 'Corpus Christi',
      nameEn: 'Corpus Christi',
      law: 'Lei Municipal nº 3.033, de 1967 (Lei nº 4.453, de 1978)',
      source:
        'https://prefeitura.poa.br/gcs/noticias/aniversario-de-porto-alegre-nao-e-feriado-municipal',
    }),
    // Lei Municipal nº 3.033/1967 (redação Lei nº 13.591/2023). (same official source)
    municipalFixed('Porto Alegre', {
      id: 'finados',
      month: 11,
      day: 2,
      namePt: 'Dia de Finados',
      nameEn: "All Souls' Day",
      law: 'Lei Municipal nº 3.033, de 1967 (Lei nº 13.591, de 2023)',
      source:
        'https://prefeitura.poa.br/gcs/noticias/aniversario-de-porto-alegre-nao-e-feriado-municipal',
    }),
  ],

  Florianópolis: [
    // Lei Municipal nº 832, de 27/06/1967, art. 2º — Decreto nº 28.928/2026.
    // https://www.cmf.sc.gov.br/proposicoes/decretos-executivos/0/1/0/117819
    municipalFixed('Florianópolis', {
      id: 'emancipacao',
      month: 3,
      day: 23,
      namePt: 'Emancipação Política de Florianópolis',
      nameEn: 'Florianópolis Emancipation / Anniversary',
      law: 'Lei Municipal nº 832, de 27 de junho de 1967, art. 2º',
      source: 'https://www.cmf.sc.gov.br/proposicoes/decretos-executivos/0/1/0/117819',
    }),
    // Lei Municipal nº 832/1967. (same official source)
    municipalEaster('Florianópolis', {
      id: 'sexta-feira-santa',
      offset: -2,
      namePt: 'Sexta-Feira Santa',
      nameEn: 'Good Friday',
      law: 'Lei Municipal nº 832, de 27 de junho de 1967',
      source: 'https://www.cmf.sc.gov.br/proposicoes/decretos-executivos/0/1/0/117819',
    }),
    // Lei Municipal nº 832/1967 (reclassificado pelo Decreto nº 28.187/2025).
    // https://www.cmf.sc.gov.br/proposicoes/Decretos-Executivos/2025/1/0/106606
    municipalEaster('Florianópolis', {
      id: 'corpus-christi',
      offset: 60,
      namePt: 'Corpus Christi',
      nameEn: 'Corpus Christi',
      law: 'Lei Municipal nº 832, de 27 de junho de 1967',
      source: 'https://www.cmf.sc.gov.br/proposicoes/Decretos-Executivos/2025/1/0/106606',
    }),
    // Lei Municipal nº 832/1967, art. 2º, "d".
    // https://www.cmf.sc.gov.br/proposicoes/decretos-executivos/0/1/0/117819
    municipalFixed('Florianópolis', {
      id: 'finados',
      month: 11,
      day: 2,
      namePt: 'Dia de Finados',
      nameEn: "All Souls' Day",
      law: 'Lei Municipal nº 832, de 27 de junho de 1967, art. 2º, "d"',
      source: 'https://www.cmf.sc.gov.br/proposicoes/decretos-executivos/0/1/0/117819',
    }),
  ],

  Aracaju: [
    // Lei Orgânica do Município de Aracaju, art. 336; Lei nº 1.358/1988.
    // https://www.aracaju.se.leg.br/institucional/legislacao/LeiOrgnicaAtualizada.pdf
    municipalFixed('Aracaju', {
      id: 'aniversario',
      month: 3,
      day: 17,
      namePt: 'Mudança da Capital / Aniversário de Aracaju',
      nameEn: 'Transfer of the Capital / Aracaju Anniversary',
      law: 'Lei Orgânica do Município de Aracaju, art. 336; Lei Municipal nº 1.358, de 9 de maio de 1988',
      source: 'https://www.aracaju.se.leg.br/institucional/legislacao/LeiOrgnicaAtualizada.pdf',
    }),
    // Lei Orgânica do Município de Aracaju, art. 337; Lei nº 1.358/1988. (same official source)
    municipalFixed('Aracaju', {
      id: 'padroeira',
      month: 12,
      day: 8,
      namePt: 'Nossa Senhora da Conceição, Padroeira de Aracaju',
      nameEn: 'Immaculate Conception, Patroness of Aracaju',
      law: 'Lei Orgânica do Município de Aracaju, art. 337; Lei Municipal nº 1.358, de 9 de maio de 1988',
      source: 'https://www.aracaju.se.leg.br/institucional/legislacao/LeiOrgnicaAtualizada.pdf',
    }),
  ],

  'São Paulo': [
    // Lei Municipal nº 14.485, de 19/07/2007, art. 10 — catálogo oficial.
    // http://legislacao.prefeitura.sp.gov.br/lei-20000-de-19-de-julho-de-2007
    municipalEaster('São Paulo', {
      id: 'sexta-feira-santa',
      offset: -2,
      namePt: 'Sexta-Feira Santa',
      nameEn: 'Good Friday',
      law: 'Lei Municipal nº 14.485, de 19 de julho de 2007, art. 10',
      source: 'http://legislacao.prefeitura.sp.gov.br/lei-20000-de-19-de-julho-de-2007',
    }),
    // Lei Municipal nº 14.485/2007, art. 10. (same official source)
    municipalEaster('São Paulo', {
      id: 'corpus-christi',
      offset: 60,
      namePt: 'Corpus Christi',
      nameEn: 'Corpus Christi',
      law: 'Lei Municipal nº 14.485, de 19 de julho de 2007, art. 10',
      source: 'http://legislacao.prefeitura.sp.gov.br/lei-20000-de-19-de-julho-de-2007',
    }),
    // Lei Municipal nº 14.485/2007, art. 10. (same official source)
    municipalFixed('São Paulo', {
      id: 'aniversario',
      month: 1,
      day: 25,
      namePt: 'Aniversário da Cidade de São Paulo',
      nameEn: 'São Paulo Anniversary',
      law: 'Lei Municipal nº 14.485, de 19 de julho de 2007, art. 10',
      source: 'http://legislacao.prefeitura.sp.gov.br/lei-20000-de-19-de-julho-de-2007',
      note: 'A comemoração pode ser antecipada à 4ª segunda-feira de janeiro por decreto municipal.',
    }),
    // Lei Municipal nº 14.485/2007, art. 9. (same official source)
    municipalFixed('São Paulo', {
      id: 'consciencia-negra',
      month: 11,
      day: 20,
      namePt: 'Dia da Consciência Negra',
      nameEn: 'Black Consciousness Day',
      law: 'Lei Municipal nº 14.485, de 19 de julho de 2007, art. 9',
      source: 'http://legislacao.prefeitura.sp.gov.br/lei-20000-de-19-de-julho-de-2007',
    }),
  ],

  Palmas: [
    // Lei nº 577, de 02/04/1996, art. 1º, III.
    // https://legislativo.palmas.to.gov.br/media/leis/LEI%20ORDINARIA%20N%C2%BA%20577%20de%2002-04-1996%2013-18-58.pdf
    municipalFixed('Palmas', {
      id: 'sao-jose',
      month: 3,
      day: 19,
      namePt: 'Dia de São José, Padroeiro de Palmas',
      nameEn: 'St. Joseph, Patron Saint of Palmas',
      law: 'Lei nº 577, de 2 de abril de 1996, art. 1º, III',
      source:
        'https://legislativo.palmas.to.gov.br/media/leis/LEI%20ORDINARIA%20N%C2%BA%20577%20de%2002-04-1996%2013-18-58.pdf',
    }),
    // Lei nº 577/1996, art. 2º. (same official source)
    municipalFixed('Palmas', {
      id: 'aniversario',
      month: 5,
      day: 20,
      namePt: 'Aniversário de Palmas',
      nameEn: 'Anniversary of Palmas',
      law: 'Lei nº 577, de 2 de abril de 1996, art. 2º',
      source:
        'https://legislativo.palmas.to.gov.br/media/leis/LEI%20ORDINARIA%20N%C2%BA%20577%20de%2002-04-1996%2013-18-58.pdf',
    }),
    // Lei nº 577/1996, art. 1º, I. (same official source)
    municipalEaster('Palmas', {
      id: 'sexta-feira-santa',
      offset: -2,
      namePt: 'Sexta-Feira Santa',
      nameEn: 'Good Friday',
      law: 'Lei nº 577, de 2 de abril de 1996, art. 1º, I',
      source:
        'https://legislativo.palmas.to.gov.br/media/leis/LEI%20ORDINARIA%20N%C2%BA%20577%20de%2002-04-1996%2013-18-58.pdf',
    }),
    // Lei nº 577/1996, art. 1º, II. (same official source)
    municipalFixed('Palmas', {
      id: 'finados',
      month: 11,
      day: 2,
      namePt: 'Dia de Finados',
      nameEn: "All Souls' Day",
      law: 'Lei nº 577, de 2 de abril de 1996, art. 1º, II',
      source:
        'https://legislativo.palmas.to.gov.br/media/leis/LEI%20ORDINARIA%20N%C2%BA%20577%20de%2002-04-1996%2013-18-58.pdf',
    }),
  ],
};
