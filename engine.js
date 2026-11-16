// Tax and social security for one tax year. Yearly figures are in RULES.
const RULES = {
  year: 2026, asOf: 'October 2026',
  tariff: { gfb: 12348, z2: 17799, z3: 69878, z4: 277825, a2: 914.51, a3: 173.10, c3: 1034.87, c4: 11135.63, c5: 19470.38 },
  werbungskosten: 1230, sonderausgaben: 36,
  entlastungAlleinerziehend: 4260,
  kinderfreibetrag: 9756, kindergeld: 259,
  soli: { rate: 0.055, freigrenze: 20350, milderung: 0.119 },
  bbg: { rv: 101400, kv: 69750 },
  midijob: { lower: 603, upper: 2000 }, // monthly; employee contributions are reduced in this band
  rates: { rv: 0.093, av: 0.013, kvGeneral: 0.073, kvReduced: 0.07, pv: 0.018, pvSaxony: 0.023, pvChildless: 0.006, pvChildDiscount: 0.0025 },
  zusatzAverage: 2.9,
  vorsorgeCap: 1900,
  church: { BY: 0.08, BW: 0.08, other: 0.09 },
  blueCard: { standard: 50700, shortage: 45934.20 },
  // Not official yet: 50% and 45.3% of the 2027 pension ceiling in the cabinet draft (€106,200).
  blueCardNext: { year: 2027, standard: 53100, shortage: 48108.60 }
};

function incomeTax(zve) {
  const t = RULES.tariff; zve = Math.floor(Math.max(0, zve));
  let tax;
  if (zve <= t.gfb) tax = 0;
  else if (zve <= t.z2) { const y = (zve - t.gfb) / 1e4; tax = (t.a2 * y + 1400) * y; }
  else if (zve <= t.z3) { const z = (zve - t.z2) / 1e4; tax = (t.a3 * z + 2397) * z + t.c3; }
  else if (zve <= t.z4) tax = 0.42 * zve - t.c4;
  else tax = 0.45 * zve - t.c5;
  return Math.floor(tax);
}
const tariff = (zve, split) => split ? 2 * incomeTax(zve / 2) : incomeTax(zve);

// p: { gross, taxClass 1-4, children, age, state, church, zusatz (%) }
function calcNet(p) {
  const R = RULES.rates, g = Math.max(0, +p.gross || 0);
  const kids = Math.max(0, p.children | 0), III = p.taxClass === 3;
  const bRV = Math.min(g, RULES.bbg.rv), bKV = Math.min(g, RULES.bbg.kv);
  const zHalf = (p.zusatz ?? RULES.zusatzAverage) / 200;
  let pvRate = p.state === 'SN' ? R.pvSaxony : R.pv;
  if (kids === 0 && (p.age ?? 30) >= 23) pvRate += R.pvChildless;
  if (kids >= 2) pvRate -= R.pvChildDiscount * Math.min(kids - 1, 4);

  // Übergangsbereich (§20 Abs. 2a SGB IV): between €603.01 and €2,000 a month the employee
  // pays on a reduced base, upper / (upper - lower) * (pay - lower). Far below both ceilings.
  const M = RULES.midijob, gm = g / 12;
  const sb = gm > M.lower && gm < M.upper ? 12 * M.upper / (M.upper - M.lower) * (gm - M.lower) : null;
  const sRV = sb ?? bRV, sKV = sb ?? bKV;
  const rv = sRV * R.rv, av = sRV * R.av, kv = sKV * (R.kvGeneral + zHalf);
  const pv = sKV * pvRate, social = rv + av + kv + pv;

  // Payroll tax (PAP) works out the deductible insurance from full gross pay, also in the band.
  const pvFull = bKV * pvRate, kvVor = bKV * (R.kvReduced + zHalf) + pvFull;
  const vorsorge = bRV * R.rv + Math.max(kvVor, Math.min(kvVor + bRV * R.av, RULES.vorsorgeCap));
  // Payroll tax (PAP 2026): €36 in every class, and only the base single-parent relief.
  // The €240 per further child comes back through the yearly tax return.
  let zve = g - RULES.werbungskosten - RULES.sonderausgaben - vorsorge;
  if (p.taxClass === 2) zve -= RULES.entlastungAlleinerziehend;
  zve = Math.max(0, zve);
  const incomeTaxAmt = tariff(zve, III);

  const kfb = RULES.kinderfreibetrag * kids * (III ? 1 : 0.5);
  const baseTax = kids ? tariff(Math.max(0, zve - kfb), III) : incomeTaxAmt;
  const fg = RULES.soli.freigrenze * (III ? 2 : 1);
  const soli = baseTax <= fg ? 0 : Math.min(baseTax * RULES.soli.rate, (baseTax - fg) * RULES.soli.milderung);
  const church = p.church ? baseTax * (RULES.church[p.state] ?? RULES.church.other) : 0;

  const tax = incomeTaxAmt + soli + church;
  return { gross: g, rv, av, kv, pv, social, incomeTax: incomeTaxAmt, soli, church, tax,
    net: g - social - tax, zve, kindergeld: kids * RULES.kindergeld * 12 };
}
if (typeof module !== 'undefined') module.exports = { calcNet, incomeTax, RULES };
