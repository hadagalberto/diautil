/**
 * State (UF) holiday rules — every entry verified against an official source.
 *
 * Each comment records the exact norm and the official URL that was checked.
 * Only feriados are listed: pontos facultativos and commemorative dates are
 * excluded. where an annual decree merely moves the observance, the canonical
 * legal date is stored and the exception noted.
 */
import { stateEaster, stateFixed } from './factory.js';
import type { UF } from './geo.js';
import type { HolidayRule } from './types.js';

/** Verified state holiday rules, keyed by federative unit. */
export const stateRulesByUF: Readonly<Record<UF, readonly HolidayRule[]>> = {
  AC: [
    // Lei nº 3.137, de 23/05/2016; transferência prevista na Lei nº 2.126/2009.
    // https://legis.ac.gov.br/detalhar/6624
    stateFixed('AC', {
      id: 'catolico',
      month: 1,
      day: 20,
      namePt: 'Dia do Católico',
      nameEn: 'Catholic Day',
      law: 'Lei nº 3.137, de 23 de maio de 2016',
      source: 'https://legis.ac.gov.br/detalhar/6624',
      note: 'Transferível por decreto; data legal canônica 20/01.',
    }),
    // Lei nº 1.538, de 12/01/2004. https://legis.ac.gov.br/detalhar/6624
    stateFixed('AC', {
      id: 'evangelico',
      month: 1,
      day: 23,
      namePt: 'Dia do Evangélico',
      nameEn: 'Evangelical Day',
      law: 'Lei nº 1.538, de 12 de janeiro de 2004',
      source: 'https://legis.ac.gov.br/detalhar/6624',
    }),
    // Lei nº 1.411, de 04/07/2001. https://legis.ac.gov.br/detalhar/6624
    stateFixed('AC', {
      id: 'mulher',
      month: 3,
      day: 8,
      namePt: 'Dia Internacional da Mulher',
      nameEn: "International Women's Day",
      law: 'Lei nº 1.411, de 4 de julho de 2001',
      source: 'https://legis.ac.gov.br/detalhar/6624',
    }),
    // Lei nº 14, de 02/09/1964.
    // https://agencia.ac.gov.br/wp-content/uploads/2025/12/Calendario-1-1.pdf
    stateFixed('AC', {
      id: 'aniversario',
      month: 6,
      day: 15,
      namePt: 'Aniversário do Estado do Acre',
      nameEn: 'Anniversary of Acre State',
      law: 'Lei nº 14, de 2 de setembro de 1964',
      source: 'https://agencia.ac.gov.br/wp-content/uploads/2025/12/Calendario-1-1.pdf',
      since: 1964,
    }),
    // Lei nº 243, de 04/12/1968. https://legis.ac.gov.br/detalhar/6624
    stateFixed('AC', {
      id: 'amazonia',
      month: 9,
      day: 5,
      namePt: 'Dia da Amazônia',
      nameEn: 'Amazon Day',
      law: 'Lei nº 243, de 4 de dezembro de 1968',
      source: 'https://legis.ac.gov.br/detalhar/6624',
    }),
    // Lei nº 57, de 02/12/1965. https://legis.ac.gov.br/detalhar/6624
    stateFixed('AC', {
      id: 'tratado-petropolis',
      month: 11,
      day: 17,
      namePt: 'Tratado de Petrópolis',
      nameEn: 'Treaty of Petrópolis',
      law: 'Lei nº 57, de 2 de dezembro de 1965',
      source: 'https://legis.ac.gov.br/detalhar/6624',
      note: 'Transferível por decreto; data legal canônica 17/11.',
    }),
  ],

  AL: [
    // Lei nº 5.508, de 07/07/1993.
    // https://alagoas.al.gov.br/noticia/governo-de-alagoas-publica-decreto-com-feriados-e-pontos-facultativos-para-2026
    stateFixed('AL', {
      id: 'sao-joao',
      month: 6,
      day: 24,
      namePt: 'Dia de São João',
      nameEn: "St. John's Day",
      law: 'Lei nº 5.508, de 7 de julho de 1993',
      source:
        'https://alagoas.al.gov.br/noticia/governo-de-alagoas-publica-decreto-com-feriados-e-pontos-facultativos-para-2026',
    }),
    // Lei nº 5.509, de 07/07/1993. (same official source)
    stateFixed('AL', {
      id: 'sao-pedro',
      month: 6,
      day: 29,
      namePt: 'Dia de São Pedro',
      nameEn: "St. Peter's Day",
      law: 'Lei nº 5.509, de 7 de julho de 1993',
      source:
        'https://alagoas.al.gov.br/noticia/governo-de-alagoas-publica-decreto-com-feriados-e-pontos-facultativos-para-2026',
    }),
    // Lei nº 5.724, de 01/08/1995. (same official source)
    stateFixed('AL', {
      id: 'emancipacao',
      month: 9,
      day: 16,
      namePt: 'Emancipação Política de Alagoas',
      nameEn: 'Alagoas Political Emancipation',
      law: 'Lei nº 5.724, de 1º de agosto de 1995',
      source:
        'https://alagoas.al.gov.br/noticia/governo-de-alagoas-publica-decreto-com-feriados-e-pontos-facultativos-para-2026',
    }),
    // Lei nº 7.530, de 08/08/2013. (same official source)
    stateFixed('AL', {
      id: 'evangelico',
      month: 11,
      day: 30,
      namePt: 'Dia Estadual do Evangélico',
      nameEn: 'State Day of the Evangelical',
      law: 'Lei nº 7.530, de 8 de agosto de 2013',
      source:
        'https://alagoas.al.gov.br/noticia/governo-de-alagoas-publica-decreto-com-feriados-e-pontos-facultativos-para-2026',
    }),
  ],

  AM: [
    // Lei nº 25, de 21/12/1977 (Lei Promulgada).
    // https://legisla.imprensaoficial.am.gov.br/diario_am/12/1977/12/8777
    stateFixed('AM', {
      id: 'elevacao-provincia',
      month: 9,
      day: 5,
      namePt: 'Elevação do Amazonas à categoria de Província',
      nameEn: 'Elevation of Amazonas to Province',
      law: 'Lei nº 25, de 21 de dezembro de 1977',
      source: 'https://legisla.imprensaoficial.am.gov.br/diario_am/12/1977/12/8777',
    }),
  ],

  AP: [
    // Lei nº 667, de 16/04/2002, art. 1º, parágrafo único — fetched from eLegis.
    // https://elegis.al.ap.leg.br/portal/legislacao/649
    stateFixed('AP', {
      id: 'sao-jose',
      month: 3,
      day: 19,
      namePt: 'Dia de São José, Padroeiro do Amapá',
      nameEn: 'St. Joseph, Patron Saint of Amapá',
      law: 'Lei nº 667, de 16 de abril de 2002, art. 1º, parágrafo único',
      source: 'https://elegis.al.ap.leg.br/portal/legislacao/649',
    }),
    // Constituição do Estado do Amapá, art. 355.
    // https://www.al.ap.gov.br/constituicao_estadual_amapa.pdf
    stateFixed('AP', {
      id: 'data-magna',
      month: 9,
      day: 13,
      namePt: 'Criação do Território Federal do Amapá (Data Magna)',
      nameEn: 'Creation of Amapá Federal Territory (Statehood Day)',
      law: 'Constituição do Estado do Amapá, art. 355',
      source: 'https://www.al.ap.gov.br/constituicao_estadual_amapa.pdf',
    }),
  ],

  BA: [
    // Constituição do Estado da Bahia, art. 67, § 3º.
    // https://www.al.ba.gov.br/fserver/:imagensAlbanet:upload:Constituicao_EGBA_EC-36.pdf
    stateFixed('BA', {
      id: 'independencia',
      month: 7,
      day: 2,
      namePt: 'Independência da Bahia (Data Magna)',
      nameEn: 'Independence of Bahia (State Data Magna)',
      law: 'Constituição do Estado da Bahia, art. 67, § 3º',
      source: 'https://www.al.ba.gov.br/fserver/:imagensAlbanet:upload:Constituicao_EGBA_EC-36.pdf',
    }),
  ],

  CE: [
    // Emenda Constitucional nº 73, de 01/12/2011 (Constituição do Ceará).
    // https://www.al.ce.gov.br/noticias/ceara-comemora-data-magna-nesta-quarta-feira
    stateFixed('CE', {
      id: 'data-magna',
      month: 3,
      day: 25,
      namePt: 'Data Magna do Ceará',
      nameEn: 'Ceará State Data Magna',
      law: 'Emenda Constitucional nº 73, de 1º de dezembro de 2011',
      source: 'https://www.al.ce.gov.br/noticias/ceara-comemora-data-magna-nesta-quarta-feira',
      note: '19/03 é feriado municipal de Fortaleza, não feriado estadual.',
    }),
  ],

  DF: [
    // Lei nº 72, de 27/12/1989, art. 1º, I — fetched from SINJ.
    // https://www.sinj.df.gov.br/sinj/Norma/18459/Lei_72_27_12_1989.html
    stateFixed('DF', {
      id: 'fundacao-brasilia',
      month: 4,
      day: 21,
      namePt: 'Aniversário de Brasília',
      nameEn: 'Anniversary of Brasília',
      law: 'Lei nº 72, de 27 de dezembro de 1989, art. 1º, I',
      source: 'https://www.sinj.df.gov.br/sinj/Norma/18459/Lei_72_27_12_1989.html',
    }),
    // Lei nº 72, de 27/12/1989, art. 1º, II. (same official source)
    stateFixed('DF', {
      id: 'padroeira-brasilia',
      month: 10,
      day: 12,
      namePt: 'Nossa Senhora Aparecida, Padroeira de Brasília',
      nameEn: 'Our Lady of Aparecida, Patron Saint of Brasília',
      law: 'Lei nº 72, de 27 de dezembro de 1989, art. 1º, II',
      source: 'https://www.sinj.df.gov.br/sinj/Norma/18459/Lei_72_27_12_1989.html',
    }),
    // Lei nº 72, de 27/12/1989, parágrafo único. (same official source)
    stateEaster('DF', {
      id: 'sexta-feira-santa',
      offset: -2,
      namePt: 'Sexta-feira da Paixão',
      nameEn: 'Good Friday',
      law: 'Lei nº 72, de 27 de dezembro de 1989, parágrafo único',
      source: 'https://www.sinj.df.gov.br/sinj/Norma/18459/Lei_72_27_12_1989.html',
    }),
    // Lei nº 72, de 27/12/1989, parágrafo único. (same official source)
    stateEaster('DF', {
      id: 'corpus-christi',
      offset: 60,
      namePt: 'Corpus Christi',
      nameEn: 'Corpus Christi',
      law: 'Lei nº 72, de 27 de dezembro de 1989, parágrafo único',
      source: 'https://www.sinj.df.gov.br/sinj/Norma/18459/Lei_72_27_12_1989.html',
    }),
    // Lei nº 963, de 04/12/1995 (não Lei 2.102/1998, como em fontes terceiras).
    // https://www.sinj.df.gov.br/sinj/Norma/48922/Lei_963_04_12_1995.html
    stateFixed('DF', {
      id: 'evangelico',
      month: 11,
      day: 30,
      namePt: 'Dia do Evangélico',
      nameEn: 'Evangelical Day',
      law: 'Lei nº 963, de 4 de dezembro de 1995',
      source: 'https://www.sinj.df.gov.br/sinj/Norma/48922/Lei_963_04_12_1995.html',
    }),
  ],

  ES: [
    // Lei nº 11.010, de 03/07/2019, art. 1º e parágrafo único — fetched.
    // https://www3.al.es.gov.br/Arquivo/Documents/legislacao/html/LEI110102019.html
    stateEaster('ES', {
      id: 'penha',
      offset: 8,
      namePt: 'Nossa Senhora da Penha (Data Magna)',
      nameEn: 'Our Lady of Penha (State Grand Day)',
      law: 'Lei nº 11.010, de 3 de julho de 2019, art. 1º e parágrafo único',
      source: 'https://www3.al.es.gov.br/Arquivo/Documents/legislacao/html/LEI110102019.html',
      since: 2019,
    }),
  ],

  GO: [
    // Lei nº 20.756, de 28/01/2020, art. 269, II, 'a' — fetched from Casa Civil.
    // https://legisla.casacivil.go.gov.br/api/v2/pesquisa/legislacoes/100979
    stateFixed('GO', {
      id: 'fundacao-goias',
      month: 7,
      day: 26,
      namePt: 'Fundação da Cidade de Goiás',
      nameEn: 'Foundation of the City of Goiás',
      law: 'Lei nº 20.756, de 28 de janeiro de 2020, art. 269, II, "a"',
      source: 'https://legisla.casacivil.go.gov.br/api/v2/pesquisa/legislacoes/100979',
      note: 'Transferível por decreto; data legal canônica 26/07.',
    }),
    // Lei nº 20.756, de 28/01/2020, art. 269, II, 'b'. (same official source)
    stateFixed('GO', {
      id: 'pedra-fundamental-goiania',
      month: 10,
      day: 24,
      namePt: 'Lançamento da pedra fundamental de Goiânia',
      nameEn: 'Laying of the Foundation Stone of Goiânia',
      law: 'Lei nº 20.756, de 28 de janeiro de 2020, art. 269, II, "b"',
      source: 'https://legisla.casacivil.go.gov.br/api/v2/pesquisa/legislacoes/100979',
    }),
  ],

  MA: [
    // Lei nº 2.457, de 02/10/1964, art. 1º.
    // http://arquivos.al.ma.leg.br:8080/ged/legislacao/LEI_2457
    stateFixed('MA', {
      id: 'adesao-independencia',
      month: 7,
      day: 28,
      namePt: 'Adesão do Maranhão à Independência do Brasil',
      nameEn: "Maranhão's Accession to Brazilian Independence",
      law: 'Lei nº 2.457, de 2 de outubro de 1964, art. 1º',
      source: 'http://arquivos.al.ma.leg.br:8080/ged/legislacao/LEI_2457',
    }),
    // Lei nº 11.539, de 21/09/2021 — constitucionalidade confirmada pelo TJMA.
    // https://www.tjma.jus.br/midia/portal/noticia/512660/tjma-julga-constitucional-lei-que-tornou-corpus-christi-feriado-estadual
    stateEaster('MA', {
      id: 'corpus-christi',
      offset: 60,
      namePt: 'Corpus Christi',
      nameEn: 'Corpus Christi',
      law: 'Lei nº 11.539, de 21 de setembro de 2021',
      source:
        'https://www.tjma.jus.br/midia/portal/noticia/512660/tjma-julga-constitucional-lei-que-tornou-corpus-christi-feriado-estadual',
      since: 2021,
      note: 'Decreto executivo anual ainda trata a data como ponto facultativo na administração estadual.',
    }),
  ],

  // Minas Gerais não possui feriado estadual próprio: a "data magna" de 21/04
  // apenas repete Tiradentes (Lei federal) e 16/07 e 08/12 são datas cívicas.
  // https://www.almg.gov.br/atividade-parlamentar/leis/constituicao-estadual?aba=pesquisa&art=256&pesquisou=true
  MG: [],

  MS: [
    // Lei nº 10, de 29/10/1979 (denominação alterada pela Lei nº 5.412/2019).
    // https://al.ms.gov.br/upload/Pdf/LeiseResolu%C3%A7%C3%B5esdeConcess%C3%B5esdaALEMS.pdf
    stateFixed('MS', {
      id: 'criacao-estado',
      month: 10,
      day: 11,
      namePt: 'Criação do Estado de Mato Grosso do Sul',
      nameEn: 'Creation of Mato Grosso do Sul State',
      law: 'Lei nº 10, de 29 de outubro de 1979',
      source:
        'https://al.ms.gov.br/upload/Pdf/LeiseResolu%C3%A7%C3%B5esdeConcess%C3%B5esdaALEMS.pdf',
    }),
  ],

  MT: [
    // Lei nº 7.879, de 27/12/2002 — feriado estadual de 20/11, anterior à Lei federal 14.759/2023.
    // https://www.tre-mt.jus.br/legislacao/compilada/portaria/2025/portaria-pre-no-511-de-17-de-novembro-de-2025
    stateFixed('MT', {
      id: 'consciencia-negra',
      month: 11,
      day: 20,
      namePt: 'Dia da Consciência Negra',
      nameEn: 'Black Consciousness Day',
      law: 'Lei nº 7.879, de 27 de dezembro de 2002',
      source:
        'https://www.tre-mt.jus.br/legislacao/compilada/portaria/2025/portaria-pre-no-511-de-17-de-novembro-de-2025',
      since: 2003,
    }),
  ],

  PA: [
    // Lei nº 5.999, de 10/09/1996.
    // https://www.alepa.pa.gov.br/Comunicacao/Noticia/7352/adesao-do-para-celebra-a-independencia-e-destacase-como-data-magna-no-estado
    stateFixed('PA', {
      id: 'adesao-independencia',
      month: 8,
      day: 15,
      namePt: 'Adesão do Grão-Pará à Independência do Brasil',
      nameEn: "Pará's Accession to Brazilian Independence",
      law: 'Lei nº 5.999, de 10 de setembro de 1996',
      source:
        'https://www.alepa.pa.gov.br/Comunicacao/Noticia/7352/adesao-do-para-celebra-a-independencia-e-destacase-como-data-magna-no-estado',
    }),
  ],

  PB: [
    // Lei Ordinária nº 10.601, de 16/12/2015 — fetched from SAPL/ALPB.
    // https://sapl.al.pb.leg.br/norma/11988
    stateFixed('PB', {
      id: 'data-magna',
      month: 8,
      day: 5,
      namePt: 'Data Magna do Estado da Paraíba',
      nameEn: 'Paraíba State Data Magna',
      law: 'Lei Ordinária nº 10.601, de 16 de dezembro de 2015',
      source: 'https://sapl.al.pb.leg.br/norma/11988',
    }),
  ],

  PE: [
    // Lei nº 16.241, de 14/12/2017, art. 49 — fetched. A Lei 16.059/2017 foi revogada.
    // https://legis.alepe.pe.gov.br/?lo162412017
    stateFixed('PE', {
      id: 'data-magna',
      month: 3,
      day: 6,
      namePt: 'Data Magna de Pernambuco (Revolução de 1817)',
      nameEn: 'Pernambuco State Data Magna (1817 Revolution)',
      law: 'Lei nº 16.241, de 14 de dezembro de 2017, art. 49',
      source: 'https://legis.alepe.pe.gov.br/?lo162412017',
      note: 'A Lei nº 16.059/2017, citada em fontes antigas, foi expressamente revogada.',
    }),
  ],

  PI: [
    // Lei nº 176, de 30/08/1937. https://sapl.al.pi.leg.br/norma/5849
    stateFixed('PI', {
      id: 'dia-do-piauí',
      month: 10,
      day: 19,
      namePt: 'Dia do Piauí',
      nameEn: 'Piauí Day',
      law: 'Lei nº 176, de 30 de agosto de 1937',
      source: 'https://sapl.al.pi.leg.br/norma/5849',
    }),
  ],

  // Decreto nº 12.134/2025 do Paraná lista apenas feriados nacionais.
  // https://www.casacivil.pr.gov.br/Noticia/Governo-do-Estado-divulga-calendario-de-feriados-e-pontos-facultativos-de-2026
  PR: [],

  RJ: [
    // Lei nº 5.243, de 14/05/2008 (Alerj; ADI 4131-2 pendente).
    // http://alerjln1.alerj.rj.gov.br/contlei.nsf/f25edae7e64db53b032564fe005262ef/063f7c027766eab48325744a007a4ab0
    stateEaster('RJ', {
      id: 'terca-carnaval',
      offset: -47,
      namePt: 'Terça-feira de Carnaval',
      nameEn: 'Carnaval Tuesday',
      law: 'Lei nº 5.243, de 14 de maio de 2008',
      source:
        'http://alerjln1.alerj.rj.gov.br/contlei.nsf/f25edae7e64db53b032564fe005262ef/063f7c027766eab48325744a007a4ab0',
    }),
    // Lei nº 5.198, de 05/03/2008 — fetched from Alerj.
    // http://alerjln1.alerj.rj.gov.br/contlei.nsf/b24a2da5a077847c032564f4005d4bf2/1baf90ca125ff96f8325740a00776600?OpenDocument
    stateFixed('RJ', {
      id: 'sao-jorge',
      month: 4,
      day: 23,
      namePt: 'Dia de São Jorge',
      nameEn: 'Saint George Day',
      law: 'Lei nº 5.198, de 5 de março de 2008',
      source:
        'http://alerjln1.alerj.rj.gov.br/contlei.nsf/b24a2da5a077847c032564f4005d4bf2/1baf90ca125ff96f8325740a00776600?OpenDocument',
    }),
    // Lei nº 4.007, de 11/11/2002 (constitucionalidade confirmada pelo TJ-RJ).
    // http://alerjln1.alerj.rj.gov.br/contlei.nsf/cd6452c69efb093e03256b2a0061e63d/80a541c3a5a9d63183256c7d0057bf25?OpenDocument
    stateFixed('RJ', {
      id: 'zumbi',
      month: 11,
      day: 20,
      namePt: 'Dia de Zumbi dos Palmares',
      nameEn: 'Zumbi dos Palmares Day',
      law: 'Lei nº 4.007, de 11 de novembro de 2002',
      source:
        'http://alerjln1.alerj.rj.gov.br/contlei.nsf/cd6452c69efb093e03256b2a0061e63d/80a541c3a5a9d63183256c7d0057bf25?OpenDocument',
      since: 2003,
    }),
    // Lei nº 11.002, de 22/10/2025 (ADI 7898 julgada improcedente).
    // http://alerjln1.alerj.rj.gov.br/contlei.nsf/c8aa0900025feef6032564ec0060dfff/46837e4d22b01f3503258d2c0048abda?OpenDocument
    stateEaster('RJ', {
      id: 'corpus-christi',
      offset: 60,
      namePt: 'Corpus Christi',
      nameEn: 'Corpus Christi',
      law: 'Lei nº 11.002, de 22 de outubro de 2025',
      source:
        'http://alerjln1.alerj.rj.gov.br/contlei.nsf/c8aa0900025feef6032564ec0060dfff/46837e4d22b01f3503258d2c0048abda?OpenDocument',
      since: 2025,
    }),
  ],

  RN: [
    // Lei Ordinária nº 8.913, de 06/12/2006.
    // https://www.al.rn.leg.br/legislacao/legislacao-estadual
    stateFixed('RN', {
      id: 'protomartires',
      month: 10,
      day: 3,
      namePt: 'Memória dos Protomártires de Uruaçu e Cunhaú',
      nameEn: 'Memory of the Protomartyrs of Uruaçu and Cunhaú',
      law: 'Lei Ordinária nº 8.913, de 6 de dezembro de 2006',
      source: 'https://www.al.rn.leg.br/legislacao/legislacao-estadual',
    }),
  ],

  RO: [
    // Lei nº 2.291, de 22/04/2010. https://sapl.al.ro.leg.br/norma/4958
    stateFixed('RO', {
      id: 'instalacao-estado',
      month: 1,
      day: 4,
      namePt: 'Instalação do Estado de Rondônia',
      nameEn: 'Installation of Rondônia State',
      law: 'Lei nº 2.291, de 22 de abril de 2010',
      source: 'https://sapl.al.ro.leg.br/norma/4958',
    }),
    // Lei nº 1.026, de 20/12/2001. https://sapl.al.ro.leg.br/norma/3003
    stateFixed('RO', {
      id: 'evangelico',
      month: 6,
      day: 18,
      namePt: 'Dia do Evangélico',
      nameEn: 'Evangelical Day',
      law: 'Lei nº 1.026, de 20 de dezembro de 2001',
      source: 'https://sapl.al.ro.leg.br/norma/3003',
    }),
  ],

  RR: [
    // Constituição do Estado de Roraima, art. 9º (1991).
    // https://sapl.al.rr.leg.br/ta/564/text
    stateFixed('RR', {
      id: 'data-magna',
      month: 10,
      day: 5,
      namePt: 'Data Magna de Roraima',
      nameEn: 'Roraima Statehood Day',
      law: 'Constituição do Estado de Roraima, art. 9º',
      source: 'https://sapl.al.rr.leg.br/ta/564/text',
    }),
  ],

  RS: [
    // Constituição do Estado do RS, art. 6º, § 1º (EC nº 83/2023); Decreto nº 36.180/1995.
    // https://www.al.rs.gov.br/legis/M010/M0100099.ASP?Hid_Tipo=TEXTO&Hid_IDNorma=11624
    stateFixed('RS', {
      id: 'data-magna',
      month: 9,
      day: 20,
      namePt: 'Data Magna Estadual (Dia do Gaúcho)',
      nameEn: 'Rio Grande do Sul State Grand Day (Gaúcho Day)',
      law: 'Constituição do Estado do Rio Grande do Sul, art. 6º, § 1º; Decreto nº 36.180, de 18 de setembro de 1995',
      source: 'https://www.al.rs.gov.br/legis/M010/M0100099.ASP?Hid_Tipo=TEXTO&Hid_IDNorma=11624',
    }),
  ],

  SC: [
    // Lei nº 10.306/1996, alterada pelas Leis nº 12.906/2004 e 13.408/2005,
    // consolidada pela Lei nº 18.531, de 05/12/2022 — fetched.
    // https://leis.alesc.sc.gov.br/ato-normativo/14581
    stateFixed('SC', {
      id: 'dia-do-estado',
      month: 8,
      day: 11,
      namePt: 'Dia do Estado de Santa Catarina',
      nameEn: 'Santa Catarina State Day',
      law: 'Lei nº 10.306, de 26 de dezembro de 1996; Lei nº 18.531, de 5 de dezembro de 2022',
      source: 'https://leis.alesc.sc.gov.br/ato-normativo/14581',
      note: 'Transferido para o domingo seguinte quando cai em dia útil; data legal canônica 11/08.',
    }),
    // Mesma cadeia normativa. https://leis.alesc.sc.gov.br/ato-normativo/11819
    stateFixed('SC', {
      id: 'santa-catarina-alexandria',
      month: 11,
      day: 25,
      namePt: 'Dia de Santa Catarina de Alexandria',
      nameEn: 'Saint Catherine of Alexandria Day',
      law: 'Lei nº 10.306, de 26 de dezembro de 1996; Lei nº 18.531, de 5 de dezembro de 2022',
      source: 'https://leis.alesc.sc.gov.br/ato-normativo/11819',
      note: 'Transferido para o domingo seguinte quando cai em dia útil; data legal canônica 25/11.',
    }),
  ],

  SE: [
    // Constituição do Estado de Sergipe, art. 269 (EC nº 20/2000).
    // https://aleselegis.al.se.leg.br/Arquivo/Documents/legislacao/html/ce11989.html
    stateFixed('SE', {
      id: 'emancipacao',
      month: 7,
      day: 8,
      namePt: 'Emancipação Política de Sergipe',
      nameEn: 'Sergipe Political Emancipation',
      law: 'Constituição do Estado de Sergipe, art. 269 (EC nº 20, de 31 de maio de 2000)',
      source: 'https://aleselegis.al.se.leg.br/Arquivo/Documents/legislacao/html/ce11989.html',
    }),
  ],

  SP: [
    // Lei nº 9.497, de 05/03/1997, art. 1º (Alesp).
    // https://www.al.sp.gov.br/legislacao/norma/9458
    stateFixed('SP', {
      id: 'revolucao-constitucionalista',
      month: 7,
      day: 9,
      namePt: 'Revolução Constitucionalista de 1932',
      nameEn: 'Constitutionalist Revolution',
      law: 'Lei nº 9.497, de 5 de março de 1997, art. 1º',
      source: 'https://www.al.sp.gov.br/legislacao/norma/9458',
      since: 1997,
    }),
  ],

  TO: [
    // Lei nº 4.509, de 25/09/2024.
    // https://sapl.al.to.leg.br/media/sapl/public/normajuridica/2024/994/lei_4509-2024.pdf
    stateFixed('TO', {
      id: 'senhor-do-bonfim',
      month: 8,
      day: 15,
      namePt: 'Dia do Senhor do Bonfim',
      nameEn: 'Lord of Bonfim Day',
      law: 'Lei nº 4.509, de 25 de setembro de 2024',
      source:
        'https://sapl.al.to.leg.br/media/sapl/public/normajuridica/2024/994/lei_4509-2024.pdf',
      since: 2024,
    }),
    // Lei nº 627, de 28/12/1993. https://www.al.to.leg.br/arquivos/6883.pdf
    stateFixed('TO', {
      id: 'padroeira',
      month: 9,
      day: 8,
      namePt: 'Nossa Senhora da Natividade, Padroeira do Tocantins',
      nameEn: 'Our Lady of the Nativity, Patroness of Tocantins',
      law: 'Lei nº 627, de 28 de dezembro de 1993',
      source: 'https://www.al.to.leg.br/arquivos/6883.pdf',
    }),
    // Lei nº 098, de 17/11/1989. https://www.al.to.leg.br/arquivos/6358.pdf
    stateFixed('TO', {
      id: 'criacao-estado',
      month: 10,
      day: 5,
      namePt: 'Criação do Estado do Tocantins',
      nameEn: 'Tocantins Statehood Day',
      law: 'Lei nº 098, de 17 de novembro de 1989',
      source: 'https://www.al.to.leg.br/arquivos/6358.pdf',
    }),
  ],
};
