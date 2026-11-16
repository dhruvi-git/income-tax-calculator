// Data
const RENT_SRC = {
  mc: { name: 'Miet-Check.de 2026, preliminary', url: 'https://www.miet-check.de/Mietblog/2026/07/28/mietpreise-deutschland-2026-staedte-ranking/' },
  ms: { name: 'mietspiegeltabelle.de 2026 ranking', url: 'https://www.mietspiegeltabelle.de' },
  iw: { name: 'immowelt Mietkompass Q3 2026', url: 'https://www.immowelt.de' }
};
// [id, display name, German name, €/m², source, state]
const CITY_ROWS = [
  ['augsburg','Augsburg','',14.70,'mc','BY'],['berlin','Berlin','',15.19,'mc','BE'],['bochum','Bochum','',9.50,'ms','NW'],
  ['bonn','Bonn','',13.86,'mc','NW'],['bottrop','Bottrop','',8.93,'ms','NW'],['bremen','Bremen','',10.54,'iw','HB'],
  ['bremerhaven','Bremerhaven','',8.21,'ms','HB'],['chemnitz','Chemnitz','',6.06,'ms','SN'],['darmstadt','Darmstadt','',14.97,'ms','HE'],
  ['dortmund','Dortmund','',8.34,'iw','NW'],['dresden','Dresden','',9.59,'iw','SN'],['duisburg','Duisburg','',8.55,'ms','NW'],
  ['duesseldorf','Düsseldorf','',15.57,'mc','NW'],['erlangen','Erlangen','',14.21,'ms','BY'],['essen','Essen','',9.11,'iw','NW'],
  ['frankfurt','Frankfurt','Frankfurt am Main',17.07,'mc','HE'],['freiburg','Freiburg','',13.99,'mc','BW'],['gelsenkirchen','Gelsenkirchen','',7.51,'ms','NW'],
  ['hagen','Hagen','',7.76,'ms','NW'],['halle','Halle (Saale)','',7.95,'ms','ST'],['hamburg','Hamburg','',15.30,'mc','HH'],
  ['hamm','Hamm','',8.41,'ms','NW'],['hannover','Hanover','Hannover',11.27,'iw','NI'],['heidelberg','Heidelberg','',15.96,'ms','BW'],
  ['herne','Herne','',8.06,'ms','NW'],['hildesheim','Hildesheim','',9.40,'ms','NI'],['ingolstadt','Ingolstadt','',13.76,'ms','BY'],
  ['karlsruhe','Karlsruhe','',13.78,'mc','BW'],['koeln','Cologne','Köln',15.13,'mc','NW'],['leipzig','Leipzig','',9.68,'iw','SN'],
  ['magdeburg','Magdeburg','',7.71,'ms','ST'],['mainz','Mainz','',14.96,'mc','RP'],['moers','Moers','',9.38,'ms','NW'],
  ['muenchen','Munich','München',19.68,'mc','BY'],['muenster','Münster','',14.17,'ms','NW'],['neuss','Neuss','',14.00,'mc','NW'],
  ['nuernberg','Nuremberg','Nürnberg',14.02,'mc','BY'],['oberhausen','Oberhausen','',8.91,'ms','NW'],['offenbach','Offenbach','Offenbach am Main',14.12,'ms','HE'],
  ['potsdam','Potsdam','',15.14,'ms','BB'],['recklinghausen','Recklinghausen','',8.19,'ms','NW'],['regensburg','Regensburg','',14.67,'ms','BY'],
  ['remscheid','Remscheid','',8.19,'ms','NW'],['salzgitter','Salzgitter','',7.27,'ms','NI'],['siegen','Siegen','',9.09,'ms','NW'],
  ['stuttgart','Stuttgart','',16.33,'mc','BW'],['wiesbaden','Wiesbaden','',14.45,'mc','HE'],['wolfsburg','Wolfsburg','',9.34,'ms','NI'],
  ['wuppertal','Wuppertal','',9.08,'ms','NW']
];
const CITIES = CITY_ROWS.map(([id, name, de, rate, src, state]) => ({ id, name, de, rate, src, state }));
const OTHER = { id: 'other', name: 'Other city', de: '', rate: null, src: null, state: null };
const findCity = id => CITIES.find(c => c.id === id) || OTHER;

// Everyday costs
const COST_SRC = {
  bk: { name: 'Deutscher Mieterbund, Betriebskostenspiegel (billing year 2024, Dec 2025)', url: 'https://mieterbund.de' },
  bdew: { name: 'BDEW electricity price analysis, Aug 2026', url: 'https://www.bdew.de' },
  get dt() { const [name, url] = RULES.sources.ticket; return { name, url }; },
  c24: { name: 'Check24 average 15 to 20 GB plan (2024)', url: 'https://www.check24.de' },
  dsl: { name: 'DSLWEB, Telekom 100 Mbit/s, Oct 2026', url: 'https://www.dslweb.de' },
  biallo: { name: 'Stiftung Warentest via biallo.de, May 2026', url: 'https://www.biallo.de' },
  rb: { name: 'Rundfunkbeitrag 2026', url: 'https://www.rundfunkbeitrag.de' },
  evs: { name: 'Destatis EVS 2023, single households', url: 'https://www.destatis.de' },
  ft: { name: 'Finanztip 2026, singles policy €20 to €30 a year', url: 'https://www.finanztip.de' },
  est: { name: 'Wings49 estimate', url: null }
};
const PER_M2 = { extra: 2.15, heat: 1.32 };
const LIFESTYLE = { frugal: { food: 200, personal: 80 }, typical: { food: 254, personal: 150 }, comfort: { food: 340, personal: 320 } };
const FLATMATES = 3;

const rulesFor = s => RULES_BY_YEAR[s.year] || RULES;
function costDefs(S, rate) {
  const wg = S.housing === 'wg', share = wg ? FLATMATES : 1, life = LIFESTYLE[S.lifestyle];
  return [
    { id: 'rent', name: 'Rent (cold)', note: `€${rate.toFixed(2)} per m² for ${S.size} m²`, v: rate * S.size, src: 'rent', locked: true },
    { id: 'extra', name: 'Service charges', note: `Water, waste, building: €${PER_M2.extra.toFixed(2)} per m²`, v: PER_M2.extra * S.size, src: 'bk', locked: true },
    { id: 'heat', name: 'Heating and hot water', note: `€${PER_M2.heat.toFixed(2)} per m²`, v: PER_M2.heat * S.size, src: 'bk', locked: true },
    { id: 'power', name: 'Electricity', note: '1,500 kWh a year at €0.37 per kWh', v: 0.37 * 1500 / 12, src: 'bdew' },
    { id: 'ticket', name: 'Deutschlandticket', note: 'All local and regional transport', v: rulesFor(S).ticket, src: 'dt' },
    { id: 'food', name: 'Food and drinks', note: 'Groceries, drinks and tobacco for one', v: life.food, src: S.lifestyle === 'typical' ? 'evs' : 'est' },
    { id: 'mobile', name: 'Mobile plan', note: 'SIM only, 15 to 20 GB', v: 10, src: 'c24' },
    { id: 'internet', name: 'Home internet', note: wg ? '100 Mbit/s, split 3 ways' : '100 Mbit/s line', v: 23.91 / share, src: 'dsl' },
    { id: 'tv', name: 'Broadcasting fee', note: wg ? 'Rundfunkbeitrag, split 3 ways' : 'Rundfunkbeitrag, one per household', v: 18.36 / share, src: 'rb' },
    { id: 'bank', name: 'Bank account', note: '€125 a year average; online banks often free', v: 125 / 12, src: 'biallo' },
    { id: 'insurance', name: 'Liability insurance', note: 'Optional, but almost everyone has it', v: 25 / 12, src: 'ft' },
    { id: 'personal', name: 'Personal spending', note: 'Eating out, clothes, gym, trips', v: life.personal, src: 'est' }
  ];
}

// Exchange rate: the European Central Bank reference rate, from the free Frankfurter API
// (no key needed). The last rate fetched is cached, so the page opens with it straight away.
const FX_URL = 'https://api.frankfurter.dev/v2/rates?base=EUR&quotes=INR';
const FX_BUILT_IN = { rate: 106.20, date: '2026-10-27', src: 'built-in' };
const validFx = x => x && Number.isFinite(x.rate) && x.rate >= 50 && x.rate <= 500 && typeof x.date === 'string';
let fxInfo = (() => { try { const c = JSON.parse(localStorage.getItem('w49calc.fxLive')); return validFx(c) ? { ...c, src: 'cached' } : FX_BUILT_IN; } catch { return FX_BUILT_IN; } })();

// State
const DEFAULTS = { gross: 60000, per: 'year', taxClass: 1, kids: 0, visa: 'standard', church: false, zusatz: 2.9, age: 28, state: 'BE',
  city: 'berlin', customRate: 9.75, housing: 'own', size: 45, lifestyle: 'typical', overrides: {}, show: 'month', cur: 'eur', fx: fxInfo.rate, fxCustom: false, year: currentYear() };
const EXAMPLES = [
  { id: 'ex1', example: true, label: 'Munich offer', S: { ...DEFAULTS, gross: 72000, city: 'muenchen', state: 'BY', size: 45 } },
  { id: 'ex2', example: true, label: 'Leipzig offer', S: { ...DEFAULTS, gross: 54000, city: 'leipzig', state: 'SN', size: 45 } }
];
const store = {
  get(k, d) { try { const v = localStorage.getItem('w49calc.' + k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem('w49calc.' + k, JSON.stringify(v)); } catch {} }
};
const MAX_GROSS = 10000000, MAX_SAVED = 5;
const STATES = ['BW', 'BY', 'BE', 'BB', 'HB', 'HH', 'HE', 'MV', 'NI', 'NW', 'RP', 'SL', 'SN', 'ST', 'SH', 'TH'];
const EDITABLE_COSTS = costDefs(DEFAULTS, 0).filter(c => !c.locked).map(c => c.id);
const clamp = (v, lo, hi, d) => Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d;
const oneOf = (v, list, d) => list.includes(v) ? v : d;
// Saved data may be old or edited by hand, so only valid values are kept.
function cleanState(raw) {
  const r = raw && typeof raw === 'object' ? raw : {}, D = DEFAULTS, overrides = {};
  EDITABLE_COSTS.forEach(id => { const v = r.overrides?.[id]; if (Number.isFinite(v) && v >= 0) overrides[id] = v; });
  const s = {
    gross: clamp(r.gross, 0, MAX_GROSS, D.gross), per: oneOf(r.per, ['year', 'month'], D.per),
    taxClass: oneOf(r.taxClass, [1, 2, 3, 4], D.taxClass), kids: Math.round(clamp(r.kids, 0, 8, D.kids)),
    visa: oneOf(r.visa, ['standard', 'shortage', 'none'], D.visa), church: r.church === true,
    zusatz: clamp(r.zusatz, 0, 5, D.zusatz), age: Math.round(clamp(r.age, 18, 67, D.age)), state: oneOf(r.state, STATES, D.state),
    city: oneOf(r.city, ['other', ...CITIES.map(c => c.id)], D.city), customRate: clamp(r.customRate, 0, 100, D.customRate),
    housing: oneOf(r.housing, ['own', 'wg'], D.housing), size: Math.round(clamp(r.size, 12, 110, D.size)),
    lifestyle: oneOf(r.lifestyle, Object.keys(LIFESTYLE), D.lifestyle), overrides,
    show: oneOf(r.show, ['month', 'year'], D.show), cur: oneOf(r.cur, ['eur', 'inr'], D.cur),
    fxCustom: r.fxCustom === true, fx: r.fxCustom === true ? clamp(r.fx, 50, 500, D.fx) : D.fx, year: oneOf(r.year, YEARS, D.year)
  };
  if (s.taxClass === 2 && s.kids === 0) s.kids = 1;
  return s;
}
function cleanScenarios(raw) {
  if (!Array.isArray(raw)) return EXAMPLES;
  return raw.filter(x => x && typeof x === 'object' && x.S).slice(-MAX_SAVED)
    .map((x, i) => ({ id: String(x.id ?? 's' + i), label: String(x.label ?? ''), example: x.example === true, S: cleanState(x.S) }));
}
let S = cleanState(store.get('state', null));
let scenarios = cleanScenarios(store.get('scenarios', null));

// Compute
function compute(s) {
  const city = findCity(s.city);
  const rate = city.id === 'other' ? (+s.customRate || 0) : city.rate;
  const rules = rulesFor(s);
  const r = calcNet({ gross: s.gross, taxClass: s.taxClass, children: s.kids, age: s.age, state: s.state, church: s.church, zusatz: s.zusatz }, rules);
  const costs = costDefs(s, rate).map(c => ({ ...c, val: (!c.locked && s.overrides[c.id] != null) ? s.overrides[c.id] : c.v }));
  const costM = costs.reduce((a, c) => a + (+c.val || 0), 0);
  const housingM = costs.filter(c => ['rent', 'extra', 'heat'].includes(c.id)).reduce((a, c) => a + c.val, 0);
  const netM = r.net / 12, kgM = r.kindergeld / 12, cashM = netM + kgM, leftM = cashM - costM;
  const share = cashM > 0 ? housingM / cashM : 0;
  const bcLimit = s.visa === 'none' ? null : rules.blueCard[s.visa];
  const bcNext = s.visa === 'none' || !rules.blueCardNext ? null : rules.blueCardNext[s.visa];
  return { rules, r, city, rate, costs, costM, housingM, netM, kgM, cashM, leftM, share, bcLimit, bcNext };
}

// Formatting
const $ = id => document.getElementById(id);
function fmt(n, opts = {}) {
  const cur = opts.cur || S.cur, d = opts.d ?? 0;
  const v = +(cur === 'inr' ? n * S.fx : n).toFixed(d); // round first to avoid −€0
  const s = Math.abs(v).toLocaleString(cur === 'inr' ? 'en-IN' : 'en-GB', { minimumFractionDigits: d, maximumFractionDigits: d });
  return (v < 0 ? '−' : '') + (cur === 'inr' ? '₹' : '€') + s;
}
const eur = (n, d = 0) => fmt(n, { cur: 'eur', d });
const inr = n => fmt(n, { cur: 'inr' });
const bcEur = n => eur(n, n % 1 ? 2 : 0); // visa limits are shown exactly, shortfalls round up
function lakh(nEur) { const v = nEur * S.fx; return Math.abs(v) >= 1e5 ? `₹${(v / 1e5).toLocaleString('en-IN', { maximumFractionDigits: 1 })} lakh` : inr(nEur); }
const other = n => S.cur === 'inr' ? eur(n) : inr(n);
// A "," or "." followed by a 3-digit (or Indian 2-digit) group is a thousands separator, so
// 60,000, 60.000 and 6,00,000 all work; any other one is the decimal point (4500.50, 4.500,50).
const parseNum = s => Number(String(s).replace(/[^0-9.,]/g, '').replace(/[.,](?=\d{3}(?:[.,]|$)|\d{2}[.,]\d)/g, '').replace(',', '.')) || 0;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const ICON = {
  ok: '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 6.5l2.5 2.5L10 3.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  warn: '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M6 2v5M6 9.3v.2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  bad: '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3 3l6 6M9 3l-6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'
};
const pill = (cls, text) => `<span class="pill ${cls}">${ICON[cls === 'good' ? 'ok' : cls] || ''}${text}</span>`;
function housingVerdict(share) {
  if (share < 0.3) return ['good', 'Comfortable'];
  if (share < 0.4) return ['warn', 'Stretching'];
  return ['bad', 'Hard to afford'];
}
// Defaults are not stored, so returning visitors pick up new yearly values and today's rate.
function save() {
  store.set('state', { ...S, fx: S.fxCustom ? S.fx : undefined, zusatz: S.zusatz === DEFAULTS.zusatz ? undefined : S.zusatz,
    year: S.year === currentYear() ? undefined : S.year });
}

// Calculator inputs
function pressGroup(el, val) { el.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === String(val)))); }
const grossText = () => (S.per === 'year' ? S.gross : S.gross / 12).toLocaleString('en-GB', { maximumFractionDigits: 2 });
function syncInputs() {
  $('gross').value = grossText();
  $('grossRange').value = S.gross;
  $('perYear').setAttribute('aria-pressed', S.per === 'year'); $('perMonth').setAttribute('aria-pressed', S.per === 'month');
  pressGroup($('taxClass'), S.taxClass); pressGroup($('housing'), S.housing); pressGroup($('lifestyle'), S.lifestyle);
  $('kids').value = S.kids; $('visa').value = S.visa; $('church').checked = S.church;
  $('zusatz').value = S.zusatz; $('age').value = S.age; $('state').value = S.state;
  $('customRate').value = S.customRate; $('size').value = S.size;
  const c = findCity(S.city); $('cityInput').value = c.name;
  $('customWrap').hidden = c.id !== 'other';
  $('curEUR').setAttribute('aria-pressed', S.cur === 'eur'); $('curINR').setAttribute('aria-pressed', S.cur === 'inr');
  $('showMonth').setAttribute('aria-pressed', S.show === 'month'); $('showYear').setAttribute('aria-pressed', S.show === 'year');
  $('fx').value = S.fx;
  renderSizePresets();
}

$('gross').addEventListener('input', () => { const v = parseNum($('gross').value); S.gross = Math.min(MAX_GROSS, S.per === 'year' ? v : v * 12); $('grossRange').value = S.gross; update(); });
$('gross').addEventListener('blur', () => { $('gross').value = grossText(); });
$('grossRange').addEventListener('input', () => { S.gross = +$('grossRange').value; $('gross').value = grossText(); update(); });
$('perYear').onclick = () => { S.per = 'year'; syncInputs(); update(); };
$('perMonth').onclick = () => { S.per = 'month'; syncInputs(); update(); };
$('taxClass').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return;
  S.taxClass = +b.dataset.v; if (S.taxClass === 2 && S.kids === 0) S.kids = 1; syncInputs(); update(); });
$('kidsMinus').onclick = () => { S.kids = Math.max(S.taxClass === 2 ? 1 : 0, S.kids - 1); syncInputs(); update(); };
$('kidsPlus').onclick = () => { S.kids = Math.min(8, S.kids + 1); syncInputs(); update(); };
$('visa').onchange = () => { S.visa = $('visa').value; update(); };
$('church').onchange = () => { S.church = $('church').checked; update(); };
$('zusatz').oninput = () => { S.zusatz = clamp(parseFloat($('zusatz').value), 0, 5, DEFAULTS.zusatz); update(); };
$('age').oninput = () => { S.age = Math.round(clamp(parseFloat($('age').value), 18, 67, DEFAULTS.age)); update(); };
$('state').onchange = () => { S.state = $('state').value; update(); };
$('customRate').oninput = () => { S.customRate = clamp(parseFloat($('customRate').value), 0, 100, 0); update(); };
['zusatz', 'age', 'customRate', 'fx'].forEach(id => { $(id).onchange = syncInputs; }); // show the value actually used
$('size').oninput = () => { S.size = +$('size').value; renderSizePresets(); update(); };
$('housing').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.v === S.housing) return;
  S.housing = b.dataset.v; S.size = S.housing === 'wg' ? 25 : 45; delete S.overrides.internet; delete S.overrides.tv; syncInputs(); update(); });
$('lifestyle').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.v === S.lifestyle) return;
  S.lifestyle = b.dataset.v; delete S.overrides.food; delete S.overrides.personal; syncInputs(); update(); });
$('resetCosts').onclick = () => { S.overrides = {}; update(); };
$('curEUR').onclick = () => { S.cur = 'eur'; syncInputs(); update(); };
$('curINR').onclick = () => { S.cur = 'inr'; syncInputs(); update(); };
$('showMonth').onclick = () => { S.show = 'month'; syncInputs(); update(); };
$('showYear').onclick = () => { S.show = 'year'; syncInputs(); update(); };
$('fx').oninput = () => { const v = parseFloat($('fx').value); if (v >= 50 && v <= 500) { S.fx = v; S.fxCustom = true; update(); } };
$('fxReset').onclick = () => { S.fxCustom = false; S.fx = fxInfo.rate; syncInputs(); update(); };
let fxLoading = true;
async function loadFx() {
  try {
    const res = await fetch(FX_URL, { cache: 'no-store', signal: AbortSignal.timeout?.(8000) });
    const j = await res.json(), row = Array.isArray(j) ? j.find(x => x.quote === 'INR') : null;
    const next = { rate: +row?.rate, date: row?.date };
    if (!res.ok || !validFx(next)) throw new Error('bad rate');
    fxInfo = { ...next, src: 'live' }; store.set('fxLive', next);
    if (!S.fxCustom) { S.fx = fxInfo.rate; $('fx').value = S.fx; }
  } catch {} // keep the cached or built-in rate
  fxLoading = false; update({ keepCosts: true });
}
function renderFx() {
  const d = new Date(fxInfo.date + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const ecb = `₹${fxInfo.rate.toFixed(2)} per euro`;
  $('fxInfo').textContent = S.fxCustom ? `You're using your own rate. The European Central Bank rate on ${d} was ${ecb}.`
    : fxLoading ? `Loading today's European Central Bank rate. Meanwhile using ${ecb} from ${d}.`
    : fxInfo.src === 'live' ? `European Central Bank reference rate on ${d}, updated every working day. Money transfer services usually give 1% to 3% less.`
    : `Today's rate couldn't be loaded, so this is the ${fxInfo.src === 'cached' ? 'last rate fetched' : 'built-in rate'}, from ${d}. Money transfer services usually give 1% to 3% less.`;
  $('fxReset').hidden = !S.fxCustom;
}

function renderSizePresets() {
  const P = S.housing === 'wg' ? [['Small room', 18], ['Room + share', 25], ['Large room', 32]]
    : [['Studio', 30], ['1 bedroom', 45], ['2 bedrooms', 65], ['Family', 85]];
  $('sizeLbl').textContent = S.housing === 'wg' ? 'Your share of the flat' : 'Flat size';
  $('sizeOut').textContent = S.size + ' m²';
  $('sizePresets').innerHTML = P.map(([n, v]) => `<button type="button" class="chip" data-size="${v}" aria-pressed="${S.size === v}">${n}<small>${v} m²</small></button>`).join('');
}
$('sizePresets').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; S.size = +b.dataset.size; syncInputs(); update(); });

// City combobox
let cityActive = -1, cityMatches = [];
// Düsseldorf, Dusseldorf and Duesseldorf all match.
const fold = s => s.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
function cityOptions(q) {
  q = fold(q.trim());
  const list = [...CITIES].sort((a, b) => a.name.localeCompare(b.name));
  const starts = c => [c.name, c.de, c.id].some(n => n && fold(n).startsWith(q));
  const m = q ? list.filter(c => fold(c.name + ' ' + c.de + ' ' + c.id).includes(q)).sort((a, b) => starts(b) - starts(a)) : list;
  return [...m, OTHER];
}
function openCities(q) {
  cityMatches = cityOptions(q); cityActive = -1;
  $('cityList').innerHTML = cityMatches.map((c, i) => `<li role="option" id="co-${i}" data-id="${c.id}" aria-selected="false">${esc(c.name)}${c.de ? ` <small style="color:var(--faint)">${esc(c.de)}</small>` : ''}<span>${c.rate ? '€' + c.rate.toFixed(2) + '/m²' : 'type your own'}</span></li>`).join('');
  $('cityList').hidden = false; $('cityInput').setAttribute('aria-expanded', 'true');
}
function closeCities() { $('cityList').hidden = true; $('cityInput').setAttribute('aria-expanded', 'false'); $('cityInput').removeAttribute('aria-activedescendant'); }
function pickCity(id) {
  S.city = id; const c = findCity(id);
  if (c.state) S.state = c.state;
  closeCities(); syncInputs(); update();
}
$('cityInput').addEventListener('focus', () => { $('cityInput').select(); openCities(''); });
$('cityInput').addEventListener('click', () => { if ($('cityList').hidden) { $('cityInput').select(); openCities(''); } });
$('cityInput').addEventListener('input', () => openCities($('cityInput').value));
$('cityInput').addEventListener('keydown', e => {
  if ($('cityList').hidden && e.key === 'ArrowDown') { openCities($('cityInput').value); return; }
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault(); cityActive = Math.max(0, Math.min(cityMatches.length - 1, cityActive + (e.key === 'ArrowDown' ? 1 : -1)));
    $('cityList').querySelectorAll('li').forEach((li, i) => li.setAttribute('aria-selected', i === cityActive));
    const li = $('co-' + cityActive); li?.scrollIntoView({ block: 'nearest' }); $('cityInput').setAttribute('aria-activedescendant', 'co-' + cityActive);
  } else if (e.key === 'Enter') {
    e.preventDefault(); if ($('cityList').hidden) return;
    // With nothing highlighted, take the top match only if the user typed something new.
    const typed = $('cityInput').value.trim(), changed = typed && typed !== findCity(S.city).name;
    const c = cityActive >= 0 ? cityMatches[cityActive] : changed ? cityMatches[0] : null;
    if (c) pickCity(c.id); else { closeCities(); syncInputs(); }
  }
  else if (e.key === 'Escape') { closeCities(); syncInputs(); }
});
$('cityList').addEventListener('mousedown', e => { const li = e.target.closest('li'); if (li) { e.preventDefault(); pickCity(li.dataset.id); } });
$('cityInput').addEventListener('blur', () => setTimeout(() => { if (!$('cityList').hidden) { closeCities(); syncInputs(); } }, 120));

// Costs list (rebuilt when the set of values changes, inputs keep focus otherwise)
$('costs').addEventListener('input', e => {
  const id = e.target.dataset.cost; if (!id) return;
  const v = e.target.value.trim(); if (v === '') delete S.overrides[id]; else S.overrides[id] = parseNum(v);
  update({ keepCosts: true });
});
$('costs').addEventListener('focusout', e => { const c = C.costs.find(x => x.id === e.target.dataset.cost); if (c && !c.locked) e.target.value = costText(c); });
const costText = c => c.val.toFixed(c.val % 1 && (c.val < 100 || S.overrides[c.id] != null) ? 2 : 0);
const costTag = c => S.overrides[c.id] != null && !c.locked ? '<span class="tag edit">Edited</span>' : c.src === 'est' ? '<span class="tag est">Estimate</span>' : '';
function renderCosts(C) {
  $('costs').innerHTML = C.costs.map(c => {
    const src = c.src === 'rent' ? (C.city.src ? RENT_SRC[C.city.src].name : 'Your own figure') : COST_SRC[c.src].name;
    return `<div class="cost"><div><b>${c.name}<span id="t_${c.id}">${costTag(c)}</span></b><span class="meta">${esc(c.note)}</span><span class="meta" style="color:var(--faint)">${esc(src)}</span></div>
      <label class="euro" for="c_${c.id}">€<input id="c_${c.id}" data-cost="${c.id}" inputmode="decimal" ${c.locked ? 'readonly' : ''} value="${costText(c)}" aria-label="${c.name} per month in euros"></label></div>`;
  }).join('') + `<div class="cost total"><div><b>Total per month</b><span class="meta" id="costTotalAlt"></span></div><strong id="costTotal"></strong></div>`;
}

// Calculator render
let C, srTimer;
function update(opt = {}) {
  useYear(S.year); C = compute(S); save(); renderYearText(); renderFx();
  const r = C.r, f = S.show === 'month' ? 1 / 12 : 1, unit = S.show;

  $('grossInr').textContent = S.cur === 'inr' ? `About ${lakh(S.gross)} a year at ₹${S.fx.toFixed(2)} per euro` : `About ${lakh(S.gross)} a year in rupees`;

  $('netLbl').textContent = `Take-home pay per ${unit}`;
  $('net').textContent = fmt(r.net * f);
  $('netSub').textContent = r.gross ? `${other(r.net * f)}. You keep ${(r.net / r.gross * 100).toFixed(0)}% of ${fmt(r.gross * f)} gross.` : 'Enter a salary to start';
  const w = v => r.gross ? `calc(${(v / r.gross * 100).toFixed(2)}% - 2px)` : '0';
  $('bNet').style.width = w(r.net); $('bTax').style.width = w(r.tax); $('bSoc').style.width = w(r.social);
  $('lNet').textContent = fmt(r.net * f); $('lTax').textContent = fmt(r.tax * f); $('lSoc').textContent = fmt(r.social * f);

  let hp = '';
  if (C.bcLimit) {
    const Y = C.rules.year, N = C.rules.blueCardNext?.year;
    hp += r.gross < C.bcLimit ? `<span class="pill onhero">${ICON.warn}${eur(Math.ceil(C.bcLimit - r.gross))} below the ${Y} Blue Card salary of ${bcEur(C.bcLimit)}</span>`
      : !C.bcNext ? `<span class="pill onhero">${ICON.ok}Meets the ${Y} Blue Card salary of ${bcEur(C.bcLimit)}</span>`
      : r.gross < C.bcNext ? `<span class="pill onhero">${ICON.warn}Meets the ${Y} Blue Card salary of ${bcEur(C.bcLimit)}, but is ${eur(Math.ceil(C.bcNext - r.gross))} below the ${bcEur(C.bcNext)} expected from January ${N}</span>`
      : `<span class="pill onhero">${ICON.ok}Meets the ${Y} Blue Card salary of ${bcEur(C.bcLimit)} and the ${bcEur(C.bcNext)} expected from January ${N}</span>`;
  }
  if (r.soli > 0) hp += `<span class="pill onhero">Solidarity surcharge applies</span>`;
  $('heroPills').innerHTML = hp;

  const lf = S.show === 'month' ? 1 : 12;
  $('leftLbl').textContent = `Left after living costs per ${unit}`;
  $('leftOver').textContent = fmt(C.leftM * lf);
  $('leftOver').style.color = C.leftM < 0 ? 'var(--bad)' : 'var(--fg)';
  $('leftSub').textContent = `${fmt(C.cashM)} take-home${C.kgM ? ' incl. child benefit' : ''} minus ${fmt(C.costM)} costs, per month. ` +
    (C.leftM > 0 ? `That is ${lakh(C.leftM * 12)} a year to save or send home.` : '');
  const [cls, word] = housingVerdict(C.share);
  $('leftPills').innerHTML = C.cashM > 0 ? pill(cls, `${word}: housing is ${(C.share * 100).toFixed(0)}% of take-home`) : '';

  // Waterfall
  const gm = r.gross / 12, rows = [
    { k: 'Gross pay', v: gm, from: 0, to: gm, col: 'var(--c-cost)', key: true },
    { k: 'Taxes', v: -r.tax / 12, from: gm - r.tax / 12, to: gm, col: 'var(--c-tax)' },
    { k: 'Social security', v: -r.social / 12, from: C.netM, to: gm - r.tax / 12, col: 'var(--c-soc)' },
    { k: 'Take-home', v: C.netM, from: 0, to: C.netM, col: 'var(--c-net)', key: true }
  ];
  let lvl = C.netM;
  if (C.kgM) { rows.push({ k: 'Child benefit', v: C.kgM, from: lvl, to: lvl + C.kgM, col: 'var(--good)' }); lvl += C.kgM; }
  rows.push({ k: 'Housing', v: -C.housingM, from: lvl - C.housingM, to: lvl, col: 'var(--c-cost)' }); lvl -= C.housingM;
  const rest = C.costM - C.housingM;
  rows.push({ k: 'Other costs', v: -rest, from: lvl - rest, to: lvl, col: 'var(--c-cost)' }); lvl -= rest;
  rows.push({ k: 'Left over', v: lvl, from: Math.min(0, lvl), to: Math.max(0, lvl), col: lvl < 0 ? 'var(--bad)' : 'var(--good)', key: true });
  const lo = Math.min(0, ...rows.map(x => x.from)), hi = Math.max(gm, C.cashM, 1), span = hi - lo;
  const P = v => ((v - lo) / span * 100).toFixed(2) + '%';
  $('wf').innerHTML = rows.map(x => `<div class="r ${x.key ? 'key' : ''}"><span>${x.k}</span><div class="trk"><i style="left:${P(Math.min(x.from, x.to))};width:max(2px,calc(${P(Math.max(x.from, x.to))} - ${P(Math.min(x.from, x.to))}));background:${x.col}"></i></div><b>${x.v < 0 && !x.key ? '−' + fmt(-x.v) : fmt(x.v)}</b></div>`).join('');

  const lines = [['Income tax', r.incomeTax], ['Solidarity surcharge', r.soli]];
  if (S.church) lines.push(['Church tax', r.church]);
  lines.push(['Pension insurance', r.rv], ['Health insurance', r.kv], ['Long-term care', r.pv], ['Unemployment insurance', r.av]);
  $('lines').innerHTML = lines.map(([k, v]) => `<div><span>${k}</span><b>${fmt(v * f)}</b></div>`).join('') +
    `<div><span><b style="color:var(--fg)">Total deductions</b></span><b>${fmt((r.tax + r.social) * f)}</b></div>`;

  // City info + costs
  const c = C.city;
  $('cityInfo').innerHTML = c.id === 'other' ? `<span>Using <b>€${C.rate.toFixed(2)}</b> per m² that you entered</span>` :
    `<span><b>€${c.rate.toFixed(2)}</b> per m² average asking rent</span><span>${esc(RENT_SRC[c.src].name)}</span>`;
  if (!opt.keepCosts) renderCosts(C);
  else C.costs.forEach(x => { $('t_' + x.id).innerHTML = costTag(x); });
  $('costTotal').textContent = eur(C.costM);
  $('costTotalAlt').textContent = S.cur === 'inr' ? `About ${inr(C.costM)}` : '';

  $('mNet').textContent = fmt(C.netM); $('mLeft').textContent = fmt(C.leftM);
  $('mLeft').style.color = C.leftM < 0 ? '#ffb4ab' : '#fff';

  // Announced to screen readers once typing pauses.
  clearTimeout(srTimer);
  srTimer = setTimeout(() => { $('srStatus').textContent = `Take-home ${fmt(C.netM)} a month. Left after living costs ${fmt(C.leftM)} a month.`; }, 700);

  renderVisible();
}

// Save / copy
function scenarioLabel(s) { return `${findCity(s.city).name}, ${eur(s.gross)}`; }
// At the limit, removes examples first, then the oldest offer. Returns a note if the user's offer was removed.
function addScenario() {
  const next = [...scenarios, { id: 's' + Date.now(), label: scenarioLabel(S), S: JSON.parse(JSON.stringify(S)) }];
  let dropped = null;
  if (next.length > MAX_SAVED) { const ex = next.findIndex(s => s.example); dropped = next.splice(ex >= 0 ? ex : 0, 1)[0]; }
  scenarios = next; store.set('scenarios', scenarios);
  return dropped && !dropped.example ? ` You can keep ${MAX_SAVED}, so the oldest offer (${dropped.label}) was removed.` : '';
}
$('saveScenario').onclick = () => { const note = addScenario(); $('toast').textContent = `Saved ${scenarioLabel(S)}. Open Compare offers to see it side by side.${note}`; };
$('saveScenario2').onclick = () => { const note = addScenario(); $('cmpToast').textContent = `Added ${scenarioLabel(S)}.${note}`; renderCompare(); };
$('copySummary').onclick = () => {
  const r = C.r, t = [
    `Wings49 salary estimate (tax year ${C.rules.year})`,
    `Offer: ${eur(r.gross)} gross a year, ${['', 'single', 'single parent', 'married (class III)', 'married (class IV)'][S.taxClass]}, ${S.kids} child${S.kids === 1 ? '' : 'ren'}`,
    `City: ${C.city.name}, ${S.housing === 'wg' ? 'shared flat' : 'own flat'} ${S.size} m²`,
    `Take-home: ${eur(C.netM)} a month (${inr(C.netM)})`,
    `Taxes ${eur(r.tax / 12)} and social security ${eur(r.social / 12)} a month`,
    C.kgM ? `Child benefit: ${eur(C.kgM)} a month, included in the left-over figure` : '',
    `Living costs: ${eur(C.costM)} a month, housing ${(C.share * 100).toFixed(0)}% of take-home`,
    `Left over: ${eur(C.leftM)} a month (${inr(C.leftM)})`,
    C.bcLimit ? (r.gross < C.bcLimit ? `Below the ${C.rules.year} EU Blue Card salary of ${bcEur(C.bcLimit)}` : `Meets the ${C.rules.year} EU Blue Card salary of ${bcEur(C.bcLimit)}`) : '',
    C.bcNext ? `${r.gross < C.bcNext ? 'Below' : 'Meets'} the ${bcEur(C.bcNext)} expected from January ${C.rules.blueCardNext.year} (not official yet)` : '',
    `Estimate only, not tax advice.`
  ].filter(Boolean).join('\n');
  const done = () => { $('toast').textContent = 'Summary copied.'; $('copyFallback').hidden = true; };
  const fallback = () => { const ta = $('copyFallback'); ta.hidden = false; ta.value = t; ta.focus(); ta.select(); $('toast').textContent = 'Select and copy the text below.'; };
  try { navigator.clipboard.writeText(t).then(done, fallback); } catch { fallback(); }
};

// Compare
function renderCompare() {
  const cols = [{ id: 'live', label: 'Current calculator', live: true, S }, ...scenarios];
  const R = cols.map(c => ({ ...c, C: compute(c.S) }));
  const best = Math.max(...R.map(x => x.C.leftM)), maxLeft = Math.max(1, ...R.map(x => x.C.leftM));
  const isBest = x => x.C.leftM === best && R.some(o => o.C.leftM !== best); // no winner when every offer ties
  const row = (label, fn, cls = '') => `<tr class="${cls}"><th scope="row">${label}</th>${R.map(fn).join('')}</tr>`;
  const hd = R.map(x => `<th scope="col"><div class="sc">${x.live ? '<span class="badge live">Live</span>' : x.example ? '<span class="badge">Example</span>' : ''}
      ${isBest(x) ? '<span class="badge win">Most left over</span>' : ''}
      <b>${esc(findCity(x.S.city).name)}</b><small>${eur(x.S.gross)} a year</small>
      ${x.live ? '' : `<button type="button" class="x" data-del="${esc(x.id)}" aria-label="Remove ${esc(x.label)}">Remove</button>`}</div></th>`).join('');
  $('cmpSwipe').hidden = !scenarios.length;
  $('cmp').innerHTML = `<table class="cmp"><thead><tr><td></td>${hd}</tr></thead><tbody>
    ${row('Family situation', x => `<td style="font-weight:400">${['', 'Single', 'Single parent', 'Married, I earn', 'Married, both earn'][x.S.taxClass]}${x.S.kids ? `, ${x.S.kids} child${x.S.kids > 1 ? 'ren' : ''}` : ''}</td>`)}
    ${row('Gross per month', x => `<td>${fmt(x.C.r.gross / 12)}</td>`)}
    ${row('Taxes', x => `<td>−${fmt(x.C.r.tax / 12)}</td>`)}
    ${row('Social security', x => `<td>−${fmt(x.C.r.social / 12)}</td>`)}
    ${row('Take-home', x => `<td>${fmt(x.C.netM)}</td>`, 'key')}
    ${row('Housing', x => `<td>−${fmt(x.C.housingM)}<div style="font-weight:400;font-size:12px;color:var(--muted)">${x.S.housing === 'wg' ? 'Shared flat' : 'Own flat'}, ${x.S.size} m², €${x.C.rate.toFixed(2)}/m²</div></td>`)}
    ${row('Other living costs', x => `<td>−${fmt(x.C.costM - x.C.housingM)}</td>`)}
    ${row('Left over per month', x => `<td class="${x.C.leftM < 0 ? 'neg' : isBest(x) ? 'best' : ''}">${fmt(x.C.leftM)}<div class="minibar" style="width:${Math.max(0, x.C.leftM / maxLeft * 100).toFixed(1)}%"></div></td>`, 'key')}
    ${row('Saved per year', x => `<td>${x.C.leftM > 0 ? lakh(x.C.leftM * 12) : 'None'}</td>`)}
    ${row('Housing share', x => { const [c, w] = housingVerdict(x.C.share); return `<td>${pill(c, `${w} (${(x.C.share * 100).toFixed(0)}%)`)}</td>`; })}
    ${row('EU Blue Card', x => `<td>${x.C.bcLimit ? (x.C.r.gross < x.C.bcLimit ? pill('warn', eur(Math.ceil(x.C.bcLimit - x.C.r.gross)) + ' short') : x.C.bcNext && x.C.r.gross < x.C.bcNext ? pill('warn', `${eur(Math.ceil(x.C.bcNext - x.C.r.gross))} short for ${x.C.rules.blueCardNext.year}`) : pill('good', 'Meets')) : '<span style="font-weight:400;color:var(--muted)">Not checked</span>'}</td>`)}
    ${row('<span class="sr-only">Actions</span>', x => x.live ? '<td></td>' : `<td><button type="button" class="linkbtn" data-load="${esc(x.id)}">Open in calculator</button></td>`)}
  </tbody></table>`;
}
$('cmp').addEventListener('click', e => {
  const del = e.target.closest('[data-del]'), load = e.target.closest('[data-load]');
  if (del) { scenarios = scenarios.filter(s => s.id !== del.dataset.del); store.set('scenarios', scenarios); renderCompare(); }
  if (load) { const sc = scenarios.find(s => s.id === load.dataset.load); if (sc) { S = { ...JSON.parse(JSON.stringify(sc.S)), cur: S.cur, fx: S.fx, fxCustom: S.fxCustom, show: S.show }; syncInputs(); location.hash = 'calculator'; update(); } }
});

// Explorer
let showAllCities = false;
$('raise').oninput = () => renderExplorer();
// Raises as they are usually talked about: yearly raises of a few percent, more for a promotion or a new job.
const RAISE_PRESETS = [[3, 'Yearly raise'], [5, 'Good yearly raise'], [10, 'Promotion'], [20, 'New job']];
$('raisePresets').innerHTML = RAISE_PRESETS.map(([p, n]) => `<button type="button" class="chip" data-raise="${p}">${p}%<small>${n}</small></button>`).join('');
$('raisePresets').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; $('raise').value = b.dataset.raise; renderExplorer(); });
$('crMore').onclick = () => { showAllCities = !showAllCities; renderExplorer(); };
const base = () => ({ taxClass: S.taxClass, children: S.kids, age: S.age, state: S.state, church: S.church, zusatz: S.zusatz });

function renderExplorer() {
  const fam = ['', 'single', 'single parent', 'married, class III', 'married, class IV'][S.taxClass];
  $('exIntro').textContent = `Using your settings: ${fam}${S.kids ? `, ${S.kids} child${S.kids > 1 ? 'ren' : ''}` : ''}, ${findCity(S.city).name}, ${S.housing === 'wg' ? 'shared flat' : 'own flat'} of ${S.size} m².`;
  // Line chart
  const pts = []; for (let g = 20000; g <= 150000; g += 1000) pts.push({ g, n: calcNet({ ...base(), gross: g }).net / 12 });
  const W = Math.max(300, Math.round($('lineChart').clientWidth || 680)), H = W < 500 ? 240 : 300, L = 54, Rm = 16, T = 18, B = 40;
  const k = S.cur === 'inr' ? S.fx : 1, topN = Math.max(...pts.map(p => p.n)), mag = 10 ** Math.floor(Math.log10(topN * k)), stepD = mag * ([1, 2, 5, 10].find(m => topN * k / (mag * m) <= 8) || 10);
  const ymax = Math.ceil(topN * k / stepD) * stepD / k;
  const X = g => L + (g - 20000) / 130000 * (W - L - Rm), Y = v => T + (1 - v / ymax) * (H - T - B);
  const yt = []; for (let d = 0; d <= ymax * k + 1; d += stepD) yt.push(d / k);
  const xt = W < 500 ? [20000, 60000, 100000, 140000] : [20000, 40000, 60000, 80000, 100000, 120000, 140000];
  const path = pts.map((p, i) => (i ? 'L' : 'M') + X(p.g).toFixed(1) + ' ' + Y(p.n).toFixed(1)).join('');
  const area = path + `L${X(150000)} ${Y(0)}L${X(20000)} ${Y(0)}Z`;
  // A salary off the chart: dot at the edge, real pay in the label.
  const cur = Math.min(150000, Math.max(20000, S.gross)), curN = calcNet({ ...base(), gross: cur }).net / 12;
  const offChart = S.gross > 150000 ? ' (above chart)' : S.gross < 20000 ? ' (below chart)' : '';
  const bc = C.bcLimit;
  const ylab = v => S.cur === 'inr' ? '₹' + Math.round(v * S.fx / 1e5) + 'L' : '€' + Math.round(v / 1000) + 'k';
  $('lineChart').innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Net pay per month rises from ${eur(pts[0].n)} at €20,000 to ${eur(pts.at(-1).n)} at €150,000 gross">
    ${yt.map(v => `<line x1="${L}" x2="${W - Rm}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--grid)"/><text x="${L - 8}" y="${Y(v) + 4}" text-anchor="end">${ylab(v)}</text>`).join('')}
    ${xt.map(g => `<text x="${X(g)}" y="${H - B + 18}" text-anchor="middle">€${g / 1000}k</text>`).join('')}
    <text x="${(L + W - Rm) / 2}" y="${H - 4}" text-anchor="middle">Gross salary per year</text>
    ${bc && bc >= 20000 ? `<line x1="${X(bc)}" x2="${X(bc)}" y1="${T}" y2="${Y(0)}" stroke="var(--c-tax)" stroke-dasharray="4 4"/><text x="${X(bc) + 6}" y="${T + 10}" style="fill:var(--gold-ink)">Blue Card ${RULES.year}: ${bcEur(bc)}</text>` : ''}
    <path d="${area}" fill="var(--c-net)" opacity=".1"/>
    <path d="${path}" fill="none" stroke="var(--c-net)" stroke-width="2.25" stroke-linejoin="round"/>
    <line x1="${L}" x2="${W - Rm}" y1="${Y(0)}" y2="${Y(0)}" stroke="var(--axis)"/>
    <circle cx="${X(cur)}" cy="${Y(curN)}" r="6" fill="var(--c-net)" stroke="var(--surface)" stroke-width="2"/>
    <text x="${X(cur) + (cur > 110000 ? -12 : 12)}" y="${Y(curN) + 22}" text-anchor="${cur > 110000 ? 'end' : 'start'}" style="fill:var(--fg);font-weight:700">You: ${fmt(C.netM)}${offChart}</text>
    <g id="hov" style="display:none"><line id="hovL" y1="${T}" y2="${Y(0)}" stroke="var(--axis)"/><circle id="hovC" r="5" fill="var(--surface)" stroke="var(--c-net)" stroke-width="2"/></g>
    <rect x="${L}" y="${T}" width="${W - L - Rm}" height="${H - T - B}" fill="transparent" id="hit"/>
  </svg><div class="tip" id="tip" hidden></div>`;
  const svg = $('lineChart').querySelector('svg'), hit = $('hit'), tip = $('tip');
  const showTip = e => {
    const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    const g = Math.round(Math.min(150000, Math.max(20000, 20000 + (p.x - L) / (W - L - Rm) * 130000)) / 1000) * 1000;
    const r = calcNet({ ...base(), gross: g }), n = r.net / 12;
    $('hov').style.display = ''; $('hovL').setAttribute('x1', X(g)); $('hovL').setAttribute('x2', X(g));
    $('hovC').setAttribute('cx', X(g)); $('hovC').setAttribute('cy', Y(n));
    const box = svg.getBoundingClientRect(), sx = box.width / W;
    tip.hidden = false; tip.style.left = Math.min(box.width - 90, Math.max(90, X(g) * sx)) + 'px'; tip.style.top = (Y(n) * sx - 8) + 'px';
    tip.innerHTML = `${eur(g)} gross is <b>${fmt(n)}</b> a month<br><span style="color:var(--muted)">Deductions ${((1 - r.net / g) * 100).toFixed(1)}%</span>`;
  };
  hit.addEventListener('pointermove', showTip);
  hit.addEventListener('pointerdown', showTip); // touch screens have no hover
  hit.addEventListener('pointerleave', e => { if (e.pointerType === 'touch') return; $('hov').style.display = 'none'; tip.hidden = true; }); // lifting a finger also fires this

  // Raise
  const pct = +$('raise').value, raise = S.gross * pct / 100;
  $('raiseOut').textContent = pct + '%';
  $('raisePresets').querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(+x.dataset.raise === pct)));
  $('raiseHint').textContent = `${fmt(S.gross)} becomes ${fmt(S.gross + raise)} a year, ${fmt(raise)} more before deductions.`;
  const a = calcNet({ ...base(), gross: S.gross }), b = calcNet({ ...base(), gross: S.gross + raise });
  const dn = (b.net - a.net) / 12, keep = raise ? (b.net - a.net) / raise : 0;
  const dedA = 1 - a.net / Math.max(1, a.gross), dedB = 1 - b.net / Math.max(1, b.gross);
  const p1 = v => (v * 100).toFixed(1) + '%';
  $('raiseStats').innerHTML = S.gross ? `
    <div class="stat"><div class="v">+${fmt(dn)}</div><div class="k">more take-home per month</div></div>
    <div class="stat"><div class="v">+${p1(a.net ? (b.net - a.net) / a.net : 0)}</div><div class="k">more take-home pay from a ${pct}% gross raise</div></div>
    <div class="stat"><div class="v">${(keep * 100).toFixed(0)}%</div><div class="k">of the raise you keep after tax and insurance</div></div>
    <div class="stat"><div class="v">${p1(dedA)} → ${p1(dedB)}</div><div class="k">of gross pay goes to deductions, now and after the raise</div></div>`
    : '<p class="hint">Enter a salary in the calculator to see what a raise is worth.</p>';

  // City ranking
  const rank = CITIES.map(c => {
    const s = { ...S, city: c.id, state: c.state, overrides: S.overrides };
    return { c, x: compute(s) };
  }).sort((p, q) => q.x.leftM - p.x.leftM);
  $('crTitle').textContent = `Where ${eur(S.gross)} goes furthest`;
  const meIdx = rank.findIndex(p => p.c.id === S.city);
  $('crDesc').textContent = `Money left each month in ${CITIES.length} cities with your salary, family and costs; only rent and state rules change. ` +
    (meIdx >= 0 ? `${findCity(S.city).name} ranks ${meIdx + 1} of ${CITIES.length}.` : '');
  const vals = rank.map(p => p.x.leftM), lo = Math.min(0, ...vals), hi = Math.max(1, ...vals), sp = hi - lo;
  const P = v => ((v - lo) / sp * 100);
  let shown = showAllCities ? rank : rank.filter((p, i) => i < 8 || i >= rank.length - 4 || p.c.id === S.city);
  let prev = -1;
  $('cityRank').innerHTML = shown.map(p => {
    const v = p.x.leftM, x0 = P(Math.min(0, v)), x1 = P(Math.max(0, v)), i = rank.indexOf(p);
    const gap = i - prev > 1 ? `<div class="cr gap"><span>${i - prev - 1} more ${i - prev - 1 === 1 ? 'city' : 'cities'}</span></div>` : ''; prev = i;
    return gap + `<div class="cr ${p.c.id === S.city ? 'me' : ''}"><span>${i + 1}. ${esc(p.c.name)}</span><div class="trk"><div class="zero" style="left:${P(0)}%"></div><i style="left:${x0}%;width:max(2px,${x1 - x0}%);background:${v < 0 ? 'var(--bad)' : p.c.id === S.city ? 'var(--c-net)' : 'var(--c-cost)'}"></i></div><b style="${v < 0 ? 'color:var(--bad)' : ''}">${fmt(v)}</b></div>`;
  }).join('');
  $('crMore').textContent = showAllCities ? 'Show fewer cities' : `Show all ${CITIES.length} cities`;
}

// Method
function renderMethod() {
  const L = (t, u) => u ? `<a href="${u}" target="_blank" rel="noopener">${t}</a>` : t;
  const SRC = RULES.sources;
  const A = RULES, Rt = A.rates, t = A.tariff, pct = r => +(r * 100).toFixed(2) + '%';
  const rows = [
    ['Tax-free income each year', eur(t.gfb), 'tariff'], ['Where the tax rate steps up', `${eur(t.z2)}, ${eur(t.z3)} and ${eur(t.z4)} of taxable income`, 'tariff'],
    ['Highest tax rates', '42%, and 45% on very high incomes', 'tariff'], ['Standard work allowance and special expenses', `${eur(A.werbungskosten)} and ${eur(A.sonderausgaben)}`, 'vp'],
    ['Solidarity surcharge', `${pct(A.soli.rate)} of income tax, only once your tax is above ${eur(A.soli.freigrenze)}`, 'soli'],
    ['Pension and unemployment insurance, your share', `${pct(Rt.rv)} and ${pct(Rt.av)}`, 'rates'], ['Health insurance, your share', `${pct(Rt.kvGeneral)} plus half your insurer's extra rate (${A.zusatzAverage}% on average)`, 'rates'],
    ['Care insurance, your share', `${pct(Rt.pv)}; ${pct(Rt.pvChildless)} more if 23 or older with no children; ${pct(Rt.pvChildDiscount)} less per child from the 2nd`, 'rates'],
    ['Pay limit for health and care insurance', `${eur(A.bbg.kv)} a year`, 'bbg'], ['Pay limit for pension and unemployment insurance', `${eur(A.bbg.rv)} a year`, 'bbg'],
    ['Reduced contributions on low pay', `${eur(A.midijob.lower)} to ${eur(A.midijob.upper)} a month; up to ${eur(A.midijob.lower)} (mini-job) only ${pct(Rt.minijobRv)} pension`, 'rates'],
    ['Limit on tax-deductible health, care and unemployment insurance', `${eur(A.vorsorgeCap)} a year, unless health and care alone are higher`, 'pap'],
    ['Child benefit and child tax allowance', `${eur(A.kindergeld)} a month and ${eur(A.kinderfreibetrag)} a year per child`, 'kg'],
    ['EU Blue Card minimum salary', `${eur(A.blueCard.standard)}, or ${eur(A.blueCard.shortage, 2)} for IT, STEM and health jobs`, 'bc'],
    ...(A.blueCardNext ? [[`EU Blue Card minimum salary from January ${A.blueCardNext.year} (expected, not official yet)`, `${eur(A.blueCardNext.standard)}, or ${eur(A.blueCardNext.shortage, 2)} for IT, STEM and health jobs`, 'bcNext']] : [])
  ];

  // Worked example with the calculator's current settings (yearly figures).
  const r = calcNet({ gross: S.gross, taxClass: S.taxClass, children: S.kids, age: S.age, state: S.state, church: S.church, zusatz: S.zusatz });
  const fam = ['', 'single', 'single parent', 'married, I earn (class III)', 'married, both earn (class IV)'][S.taxClass];
  const kidsTxt = S.kids ? `, ${S.kids} child${S.kids > 1 ? 'ren' : ''}` : '';
  $('exampleIntro').textContent = `Using what's in the calculator now: ${fmt(r.gross)} a year, ${fam}${kidsTxt}, ${findCity(S.city).name}. All figures are per year.`;
  const capKV = r.gross > A.bbg.kv ? ` Only the first ${eur(A.bbg.kv)} of pay counts.` : '';
  const capRV = r.gross > A.bbg.rv ? ` Only the first ${eur(A.bbg.rv)} of pay counts.` : '';
  const band = r.gross / 12 > A.midijob.lower && r.gross / 12 < A.midijob.upper ? ' Lower, because your pay is in the reduced band.' : '';
  const careRate = (S.state === 'SN' ? Rt.pvSaxony : Rt.pv) + (S.kids === 0 && S.age >= 23 ? Rt.pvChildless : 0) - (S.kids >= 2 ? Rt.pvChildDiscount * Math.min(S.kids - 1, 4) : 0);
  const soliNote = r.soli ? `${pct(A.soli.rate)} of income tax, phased in just above the threshold.` : `You don't pay it: it only starts once income tax is above ${eur(A.soli.freigrenze * (S.taxClass === 3 ? 2 : 1))}.`;
  const step = (k, note, v, cls = '') => `<div class="${cls}"><span><b>${k}</b><small>${note}</small></span><strong>${v < 0 ? '−' + fmt(-v) : fmt(v)}</strong></div>`;
  $('methodExample').innerHTML = [
    step('Gross salary', 'The figure in your contract.', r.gross, 'start'),
    step('Pension insurance', `${pct(Rt.rv)} of your pay, for your state pension.${capRV}${band}`, -r.rv),
    step('Health insurance', `${pct(Rt.kvGeneral)} plus half of your insurer's ${S.zusatz}% extra rate.${capKV}${band}`, -r.kv),
    step('Care insurance', `${pct(careRate)} for your age, family and state, for care in old age or illness.${capKV}${band}`, -r.pv),
    step('Unemployment insurance', `${pct(Rt.av)} of your pay, for benefits if you lose your job.${capRV}${band}`, -r.av),
    step('Income tax', `Worked out on your taxable income of ${fmt(r.zve)}. That's your salary minus allowances and most of your insurance.`, -r.incomeTax),
    step('Solidarity surcharge', soliNote, -r.soli),
    S.church ? step('Church tax', `${pct(A.church[S.state] ?? A.church.other)} of income tax in your state.`, -r.church) : '',
    step('Take-home pay', `${fmt(r.net / 12)} a month. You keep ${r.gross ? (r.net / r.gross * 100).toFixed(0) : 0}% of your gross salary.`, r.net, 'sum'),
    r.kindergeld ? step('Child benefit', `${eur(A.kindergeld)} per child per month, paid separately by the Familienkasse.`, r.kindergeld, 'plus') : ''
  ].join('');

  const X = (term, de, text) => `<div><h4>${term} <span>${de}</span></h4><p>${text}</p></div>`;
  $('methodSteps').innerHTML = [
    X('Social security', 'Sozialversicherung', `Four insurances that cover your pension, health, care and unemployment. You pay about 21% of your pay and your employer pays roughly the same again on top. Health and care stop growing above ${eur(A.bbg.kv)} a year, pension and unemployment above ${eur(A.bbg.rv)}. On pay between ${eur(A.midijob.lower)} and ${eur(A.midijob.upper)} a month you pay less.`),
    X('Income tax', 'Lohnsteuer', `Taken from your salary every month by your employer. The first ${eur(t.gfb)} of taxable income is tax-free. After that the rate rises smoothly from 14% to 42%, and reaches 45% above ${eur(t.z4)}. You only pay the higher rates on the part of your income above each step, not on all of it.`),
    X('Taxable income', 'zu versteuerndes Einkommen', `Not your full salary. We first take off a ${eur(A.werbungskosten)} work allowance, ${eur(A.sonderausgaben)} for special expenses, most of your insurance contributions, and ${eur(A.entlastungAlleinerziehend)} for single parents.`),
    X('Tax classes', 'Steuerklassen', `Class I is for single people and class II for single parents. Married couples pick III and V, or IV and IV. In class III you pay much less tax because your partner's unused allowance is shifted to you. In class IV each partner is taxed like a single person.`),
    X('Solidarity surcharge', 'Solidaritätszuschlag', `An extra ${pct(A.soli.rate)} on top of income tax, but only for high earners: it starts once your income tax is above ${eur(A.soli.freigrenze)} a year (double for class III). Most employees don't pay it.`),
    X('Church tax', 'Kirchensteuer', `Only for registered members of the Catholic or Protestant church: ${pct(A.church.BY)} of income tax in Bavaria and Baden-Württemberg, ${pct(A.church.other)} everywhere else.`),
    X('Child benefit', 'Kindergeld', `${eur(A.kindergeld)} a month per child, paid to parents by the Familienkasse rather than through your salary. We add it to your monthly money. Children also lower the solidarity surcharge and church tax.`)
  ].join('');
  $('rulesTax').innerHTML = `<thead><tr><th>What</th><th>${A.year} figure</th><th>Source</th></tr></thead><tbody>${rows.map(([a, b, s]) => `<tr><td>${a}</td><td class="v">${b}</td><td class="s">${L(...SRC[s])}</td></tr>`).join('')}</tbody>`;
  const cs = costDefs({ ...DEFAULTS }, 15.19).filter(c => c.id !== 'rent');
  $('rulesCost').innerHTML = `<thead><tr><th>Cost</th><th>Default</th><th>Source</th></tr></thead><tbody>
    <tr><td>Rent (cold)</td><td class="v">${CITIES.length} cities, ${eur(Math.min(...CITIES.map(c => c.rate)), 2)} to ${eur(Math.max(...CITIES.map(c => c.rate)), 2)} per m²</td><td class="s">${Object.values(RENT_SRC).map(s => L(s.name, s.url)).join(', ')}</td></tr>
    ${cs.map(c => `<tr><td>${c.name}</td><td class="v">${c.id === 'extra' || c.id === 'heat' ? '€' + PER_M2[c.id].toFixed(2) + ' per m²' : c.id === 'food' || c.id === 'personal' ? `€${LIFESTYLE.frugal[c.id]}, €${LIFESTYLE.typical[c.id]} or €${LIFESTYLE.comfort[c.id]}` : eur(c.v, 2)}</td><td class="s">${c.id === 'food' ? 'Typical: ' + L(COST_SRC.evs.name, COST_SRC.evs.url) + '. Saver and Comfortable: Wings49 estimates' : L(COST_SRC[c.src].name, COST_SRC[c.src].url)}</td></tr>`).join('')}
  </tbody>`;
  $('tests').innerHTML = `<thead><tr><th>Check</th><th>Result</th><th>Expected</th><th></th></tr></thead><tbody>${runChecks(A).map(c =>
    `<tr><td>${c.label}<div class="s" style="color:var(--muted);font-size:12.5px">${c.note}</div></td><td class="v">${eur(c.got)}</td><td class="v">${eur(c.expected)}</td><td>${c.pass ? '<span class="ok">Pass</span>' : '<span class="fail">Fail</span>'}</td></tr>`).join('')}</tbody>`;
}

// Routing
const VIEWS = ['calculator', 'compare', 'explorer', 'method'];
let view = 'calculator';
function route() {
  const h = location.hash.slice(1);
  if (VIEWS.includes(h)) view = h; else if (!h) view = 'calculator'; // other hashes are links within the current view
  VIEWS.forEach(v => { $('v-' + v).hidden = v !== view; });
  document.querySelectorAll('nav.tabs a').forEach(a => { if (a.dataset.view === view) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  $('mbar').style.display = view === 'calculator' ? '' : 'none';
  renderVisible();
}
function renderVisible() {
  if (view === 'compare') renderCompare();
  if (view === 'explorer') renderExplorer();
  if (view === 'method') renderMethod();
}
let rz; window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => view === 'explorer' && renderExplorer(), 150); });
window.addEventListener('hashchange', () => { route(); if (VIEWS.includes(location.hash.slice(1))) window.scrollTo({ top: 0 }); });

// Page text that repeats figures from RULES. With more than one year of rules, the header
// shows a year switch; with one, just the year.
function renderYearText() {
  $('yearBox').innerHTML = YEARS.length > 1
    ? `<div class="seg2" role="group" aria-label="Tax year">${YEARS.map(y => `<button type="button" data-year="${y}" aria-pressed="${y === S.year}">${y}</button>`).join('')}</div>`
    : `<span class="year">Tax year ${RULES.year}</span>`;
  $('asOf').textContent = RULES.asOf;
  document.querySelectorAll('.ruleYear').forEach(el => { el.textContent = RULES.year; });
  $('zusatzHint').textContent = `Each insurer (TK, AOK, Barmer and others) sets its own. ${RULES.zusatzAverage}% is the ${RULES.year} average.`;
  $('ageHint').textContent = `From age 23, people without children pay ${+(RULES.rates.pvChildless * 100).toFixed(2)}% more for care insurance.`;
}
$('yearBox').addEventListener('click', e => { const b = e.target.closest('[data-year]'); if (!b) return; S.year = +b.dataset.year; syncInputs(); update(); });
$('cityInput').placeholder = `Search ${CITIES.length} cities`;

syncInputs(); update(); route(); loadFx();
