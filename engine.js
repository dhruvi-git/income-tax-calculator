// Tax and social security rules, one block per tax year.
//
// To add a year (e.g. 2027): copy the latest block, change every figure, source and check,
// and the page picks it up: it switches to the new year on 1 January and shows a year switch.
// Every figure here is set by law for the whole year, so they are updated by hand once a year.
const RULES_BY_YEAR = {
  2026: {
    year: 2026, asOf: 'October 2026',
    // Income tax formula, section 32a EStG: zone 2 is (a2·y + b2)·y, zone 3 is (a3·z + b3)·z + c3.
    tariff: { gfb: 12348, z2: 17799, z3: 69878, z4: 277825, a2: 914.51, b2: 1400, a3: 173.10, b3: 2397, c3: 1034.87, c4: 11135.63, c5: 19470.38 },
    werbungskosten: 1230, sonderausgaben: 36,
    entlastungAlleinerziehend: 4260,
    kinderfreibetrag: 9756, kindergeld: 259,
    soli: { rate: 0.055, freigrenze: 20350, milderung: 0.119 },
    bbg: { rv: 101400, kv: 69750 },
    midijob: { lower: 603, upper: 2000 }, // monthly; employee contributions are reduced in this band
    rates: { rv: 0.093, av: 0.013, kvGeneral: 0.073, kvReduced: 0.07, pv: 0.018, pvSaxony: 0.023, pvChildless: 0.006, pvChildDiscount: 0.0025, minijobRv: 0.036 },
    zusatzAverage: 2.9,
    vorsorgeCap: 1900,
    church: { BY: 0.08, BW: 0.08, other: 0.09 },
    blueCard: { standard: 50700, shortage: 45934.20 },
    // Not official yet: 50% and 45.3% of the 2027 pension ceiling in the cabinet draft (€106,200).
    // Set to null when there is no announced figure for the following year.
    blueCardNext: { year: 2027, standard: 53100, shortage: 48108.60 },
    ticket: 63, // Deutschlandticket, € a month
    sources: {
      tariff: ['finanz-tools.de, income tax formula 2026', 'https://www.finanz-tools.de/einkommensteuer/berechnung-formeln/2026'],
      bbg: ['Lohnsteuer kompakt, 2026 ceilings', 'https://www.lohnsteuer-kompakt.de/steuerwissen/beitragsbemessungsgrenzen-2026-diese-werte-gelten-ab-januar'],
      rates: ['Haufe, 2026 contribution rates', 'https://www.haufe.de/personal/entgelt/beitragssaetze-zur-sozialversicherung_78_493770.html'],
      soli: ['TK, Soli 2026', 'https://www.tk.de/firmenkunden/service/fachthemen/fachthema-beitraege/solidaritaetszuschlag-2075802'],
      kg: ['steuerschroeder.de, Kindergeld 2026', 'https://www.steuerschroeder.de/Steuerrechner/Kindergeld.html'],
      bc: ['The Local, Blue Card 2026', 'https://www.thelocal.de/20251217/the-salary-you-need-in-germany-in-2026-to-get-an-eu-blue-card'],
      bcNext: ['Schlun & Elseven, 2027 outlook', 'https://se-legal.de/category/residence-permit/?lang=en'],
      vp: ['steuerschroeder.de, Vorsorgepauschale 2026', 'https://www.steuerschroeder.de/blog/vorsorgepauschale-im-lohnsteuerabzugsverfahren-ab-2026/'],
      pap: ['BMF payroll tax flowchart 2026 (PAP, Anlage 1)', 'https://www.ihk-muenchen.de/ihk/documents/Recht-Steuern/Steuerrecht/Einkommensteuer/2025-11-12-PAP-2026-anlage-1.pdf'],
      ticket: ['Deutschlandticket price 2026', 'https://www.zdfheute.de/politik/deutschlandticket-dticket-verkehr-nahverkehr-preis-erhoehung-100.html']
    },
    // Official figures this year's rules must reproduce. p is passed to calcNet (field defaults
    // to incomeTax); zve is passed straight to the income tax formula.
    checks: [
      { label: 'Soli at €45,000, single', p: { gross: 45000, taxClass: 1 }, field: 'soli', expected: 0, note: 'Below €20,350 of tax' },
      { label: '€50,000, single: income tax', p: { gross: 50000, taxClass: 1 }, expected: 6788, note: 'BMF test table, PAP 2026' },
      { label: '€100,000, single: income tax', p: { gross: 100000, taxClass: 1 }, expected: 23248, note: 'BMF test table, PAP 2026' },
      { label: '€60,000, single parent: income tax', p: { gross: 60000, taxClass: 2, children: 1 }, expected: 8091, note: 'BMF test table, PAP 2026' },
      { label: '€110,000, married, class III: income tax', p: { gross: 110000, taxClass: 3 }, expected: 18252, note: 'BMF test table, PAP 2026' },
      { label: '€55,000, married, class III: income tax', p: { gross: 55000, taxClass: 3 }, expected: 3802, note: 'BMF calculator, PAP 2026' },
      { label: '€55,000, single parent, 3 children: income tax', p: { gross: 55000, taxClass: 2, children: 3 }, expected: 6893, note: 'BMF calculator, PAP 2026' },
      { label: 'Tax at the allowance, €12,348', zve: 12348, expected: 0, note: 'Income tax formula, first zone' },
      { label: 'Tax at €17,799 (zone edge)', zve: 17799, expected: 1034, note: 'Both formulas meet' }
    ]
  }
};
const YEARS = Object.keys(RULES_BY_YEAR).map(Number).sort((a, b) => a - b);
// The latest tax year that has started, or the first one we have.
const currentYear = (d = new Date()) => [...YEARS].reverse().find(y => y <= d.getFullYear()) ?? YEARS[0];
// The rules the page is showing. Functions below use them unless given another year's rules.
let RULES = RULES_BY_YEAR[currentYear()];
function useYear(y) { if (RULES_BY_YEAR[y]) RULES = RULES_BY_YEAR[y]; return RULES; }

function incomeTax(zve, rules = RULES) {
  const t = rules.tariff; zve = Math.floor(Math.max(0, zve));
  let tax;
  if (zve <= t.gfb) tax = 0;
  else if (zve <= t.z2) { const y = (zve - t.gfb) / 1e4; tax = (t.a2 * y + t.b2) * y; }
  else if (zve <= t.z3) { const z = (zve - t.z2) / 1e4; tax = (t.a3 * z + t.b3) * z + t.c3; }
  else if (zve <= t.z4) tax = 0.42 * zve - t.c4;
  else tax = 0.45 * zve - t.c5;
  return Math.floor(tax);
}
const tariff = (zve, split, rules) => split ? 2 * incomeTax(zve / 2, rules) : incomeTax(zve, rules);

// p: { gross, taxClass 1-4, children, age, state, church, zusatz (%) }
function calcNet(p, rules = RULES) {
  const RU = rules, R = RU.rates, g = Math.max(0, +p.gross || 0);
  const kids = Math.max(0, p.children | 0), III = p.taxClass === 3;
  const bRV = Math.min(g, RU.bbg.rv), bKV = Math.min(g, RU.bbg.kv);
  const zHalf = (p.zusatz ?? RU.zusatzAverage) / 200;
  let pvRate = p.state === 'SN' ? R.pvSaxony : R.pv;
  if (kids === 0 && (p.age ?? 30) >= 23) pvRate += R.pvChildless;
  if (kids >= 2) pvRate -= R.pvChildDiscount * Math.min(kids - 1, 4);

  // Übergangsbereich (§20 Abs. 2a SGB IV): between €603.01 and €2,000 a month the employee
  // pays on a reduced base, upper / (upper - lower) * (pay - lower). Far below both ceilings.
  // Up to €603 a month (mini-job) the employee pays only their pension share, 3.6%, unless they
  // opt out, and no health, care or unemployment insurance.
  const M = RU.midijob, gm = g / 12, mini = gm <= M.lower;
  const sb = gm > M.lower && gm < M.upper ? 12 * M.upper / (M.upper - M.lower) * (gm - M.lower) : null;
  const sRV = sb ?? bRV, sKV = sb ?? bKV;
  const rv = mini ? g * R.minijobRv : sRV * R.rv, av = mini ? 0 : sRV * R.av;
  const kv = mini ? 0 : sKV * (R.kvGeneral + zHalf), pv = mini ? 0 : sKV * pvRate;
  const social = rv + av + kv + pv;

  // Payroll tax (PAP) works out the deductible insurance from full gross pay, also in the band.
  const pvFull = bKV * pvRate, kvVor = bKV * (R.kvReduced + zHalf) + pvFull;
  const vorsorge = bRV * R.rv + Math.max(kvVor, Math.min(kvVor + bRV * R.av, RU.vorsorgeCap));
  // Payroll tax (PAP 2026): €36 in every class, and only the base single-parent relief.
  // The €240 per further child comes back through the yearly tax return.
  let zve = g - RU.werbungskosten - RU.sonderausgaben - vorsorge;
  if (p.taxClass === 2) zve -= RU.entlastungAlleinerziehend;
  zve = Math.max(0, zve);
  const incomeTaxAmt = tariff(zve, III, RU);

  const kfb = RU.kinderfreibetrag * kids * (III ? 1 : 0.5);
  const baseTax = kids ? tariff(Math.max(0, zve - kfb), III, RU) : incomeTaxAmt;
  const fg = RU.soli.freigrenze * (III ? 2 : 1);
  const soli = baseTax <= fg ? 0 : Math.min(baseTax * RU.soli.rate, (baseTax - fg) * RU.soli.milderung);
  const church = p.church ? baseTax * (RU.church[p.state] ?? RU.church.other) : 0;

  const tax = incomeTaxAmt + soli + church;
  return { gross: g, rv, av, kv, pv, social, incomeTax: incomeTaxAmt, soli, church, tax,
    net: g - social - tax, zve, kindergeld: kids * RU.kindergeld * 12 };
}
// Accuracy checks for one year: its official figures, plus two that follow from the rules
// themselves. Shown on the "How it's calculated" page and run by `node check.js`.
function runChecks(rules) {
  const e = n => '€' + n.toLocaleString('en-GB'), base = { taxClass: 1, children: 0, age: 30 };
  const R = rules.rates, mj = rules.midijob, bandPay = 20000;
  const fullRate = R.rv + R.av + R.kvGeneral + rules.zusatzAverage / 200 + R.pv + R.pvChildless;
  const rows = [
    ...rules.checks.map(c => ({ label: c.label, note: c.note, expected: c.expected,
      got: c.p ? Math.round(calcNet({ ...base, ...c.p }, rules)[c.field || 'incomeTax']) : incomeTax(c.zve, rules) })),
    { label: `Social security at ${e(bandPay)} (reduced band)`, note: `Pay of ${e(mj.lower)} to ${e(mj.upper)} a month`,
      got: Math.round(calcNet({ ...base, gross: bandPay }, rules).social),
      expected: Math.round(12 * mj.upper / (mj.upper - mj.lower) * (bandPay / 12 - mj.lower) * fullRate) },
    { label: `Social security at ${e(6000)} (mini-job)`, note: 'Pension share only', got: Math.round(calcNet({ ...base, gross: 6000 }, rules).social),
      expected: Math.round(6000 * R.minijobRv) },
    { label: `Health capped above ${e(rules.bbg.kv)}`, note: `${rules.year} pay limit`,
      got: Math.round(calcNet({ ...base, gross: rules.bbg.kv + 50000 }, rules).kv),
      expected: Math.round(rules.bbg.kv * (R.kvGeneral + rules.zusatzAverage / 200)) }
  ];
  return rows.map(r => ({ ...r, pass: Math.abs(r.got - r.expected) <= 1 }));
}
if (typeof module !== 'undefined') module.exports = { calcNet, incomeTax, runChecks, RULES_BY_YEAR, YEARS, currentYear, useYear };
