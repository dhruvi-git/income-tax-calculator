# Updating the figures

Three kinds of data in this calculator change over time. Only two need a person.

| What | When | Effort |
|---|---|---|
| [Tax and social security rules](#1-tax-and-social-security-rules-once-a-year) | Once a year, mid-December to early January | About an hour |
| [Rents and living costs](#2-rents-and-living-costs-about-twice-a-year) | About every 6 months (May and November) | About an hour |
| Exchange rate | Never: it updates itself | None |

---

## 1. Tax and social security rules (once a year)

German tax and insurance figures are set by law for each calendar year. The next year's figures are usually final by early December and take effect on 1 January.

**Until you add the new year, the calculator keeps using the previous year's rules** and shows that year in the header (e.g. "Tax year 2026"). Nothing breaks, but the figures are a year out of date, so plan this for every December.

### Steps

1. In `engine.js`, copy the latest block inside `RULES_BY_YEAR` (e.g. `2026: { ... }`) and paste it below as the new year (e.g. `2027: { ... }`).
2. Change `year` and `asOf` (the month you checked the figures, e.g. `'December 2026'`).
3. Go through **every figure** in the [checklist below](#checklist-every-figure-and-where-to-find-it) and update it from an official source.
4. Update `sources` with links for the new year.
5. Replace `checks` with official test figures for the new year (see [Accuracy checks](#accuracy-checks)).
6. Run `node check.js`. Every line must say `PASS`.
7. Open `index.html` in a browser and check:
   - the header now shows a year switch (e.g. 2026 / 2027);
   - on "How it's calculated", every accuracy check shows "Pass";
   - a typical salary (e.g. €60,000, single) gives a sensible take-home pay, and compares sensibly with the BMF calculator.
8. Deploy.

Keep the old year's block. Visitors can still switch back to it, and saved offers remember their year.

### Checklist: every figure and where to find it

All amounts are yearly unless marked. German terms are given so you can search for them.

| Field in `engine.js` | What it is | German term | Where to find it |
|---|---|---|---|
| `tariff.gfb` | Tax-free allowance | Grundfreibetrag | § 32a EStG for the year, or the BMF *Programmablaufplan* (PAP) |
| `tariff.z2`, `z3`, `z4` | Upper limits of tax zones 2, 3 and 4 | Tarifzonen | § 32a EStG |
| `tariff.a2`, `b2`, `a3`, `b3`, `c3`, `c4`, `c5` | Constants of the tax formula. Zone 2 is `(a2·y + b2)·y`, zone 3 is `(a3·z + b3)·z + c3`, zone 4 is `0.42·x − c4`, zone 5 is `0.45·x − c5` | Tarifformel | § 32a EStG. finanz-tools.de publishes each year's formula clearly |
| `werbungskosten` | Standard work allowance | Arbeitnehmer-Pauschbetrag | § 9a EStG |
| `sonderausgaben` | Standard special expenses allowance | Sonderausgaben-Pauschbetrag | § 10c EStG (rarely changes) |
| `entlastungAlleinerziehend` | Single-parent relief, first child | Entlastungsbetrag für Alleinerziehende | § 24b EStG |
| `kinderfreibetrag` | Child allowance for **both parents together**, including the care allowance | Kinderfreibetrag + BEA-Freibetrag | § 32 Abs. 6 EStG. 2026: 6,828 + 2,928 = 9,756 |
| `kindergeld` | Child benefit, **€ per child per month** | Kindergeld | Familienkasse / § 66 EStG |
| `soli.freigrenze` | Income tax below which no solidarity surcharge is due (single) | Freigrenze Solidaritätszuschlag | § 3 SolZG, or the PAP |
| `soli.rate`, `soli.milderung` | 5.5% and 11.9% | | Rarely change |
| `bbg.rv` | Pay limit for pension and unemployment insurance | Beitragsbemessungsgrenze Renten- und Arbeitslosenversicherung | *Sozialversicherungsrechengrößen-Verordnung* for the year (BMAS, approved in autumn) |
| `bbg.kv` | Pay limit for health and care insurance | Beitragsbemessungsgrenze Kranken- und Pflegeversicherung | Same regulation |
| `midijob.lower` | Mini-job limit, **€ per month** | Geringfügigkeitsgrenze | Rises with the minimum wage. Minijob-Zentrale |
| `midijob.upper` | Upper end of the reduced-contribution band, **€ per month** | Übergangsbereich, Obergrenze | § 20 Abs. 2 SGB IV (€2,000 since 2023) |
| `rates.rv`, `av` | **Employee's half** of pension (18.6% total) and unemployment (2.6% total) insurance | Beitragssätze | GKV-Spitzenverband, Haufe, or any payroll site |
| `rates.kvGeneral`, `kvReduced` | Employee's half of the general (14.6%) and reduced (14.0%) health rate | allgemeiner / ermäßigter Beitragssatz | Same |
| `rates.pv` | Employee's share of care insurance (3.6% total, split evenly) | Pflegeversicherung | Same |
| `rates.pvSaxony` | Employee's care share in Saxony, which is higher | Pflegeversicherung Sachsen | Same |
| `rates.pvChildless`, `pvChildDiscount` | Childless surcharge (age 23+) and discount per child from the 2nd | Kinderlosenzuschlag, Beitragsabschlag | Same |
| `zusatzAverage` | Average extra health insurance rate, in % | durchschnittlicher Zusatzbeitragssatz | Announced by the Federal Ministry of Health (BMG) around 1 November |
| `vorsorgeCap` | Limit on deductible health, care and unemployment insurance in payroll tax | Höchstbetrag Vorsorgepauschale | BMF PAP for the year |
| `church` | Church tax rates (8% in Bavaria and Baden-Württemberg, 9% elsewhere) | Kirchensteuer | Rarely change |
| `blueCard.standard` | Blue Card minimum salary. **Always 50% of `bbg.rv`** | Mindestgehalt Blaue Karte EU | BMI announcement, or make-it-in-germany.com |
| `blueCard.shortage` | Lower minimum for IT, STEM and health jobs. **Always 45.3% of `bbg.rv`** | Engpassberufe | Same |
| `blueCardNext` | Optional: the *following* year's expected Blue Card salary, shown as "not official yet". Set to `null` if not announced | | Same, once the next pension pay limit is approved |
| `ticket` | Deutschlandticket price, **€ per month** | Deutschlandticket | News or deutschlandticket.de. Set each autumn for the next year |

**Official all-in-one source:** each November the Federal Ministry of Finance (BMF) publishes the payroll tax flowchart (*Programmablaufplan für den Lohnsteuerabzug*, "PAP") for the next year. It contains most of the tax figures above. Find it on bmf-steuerrechner.de or by searching "PAP 2027 Lohnsteuer".

### Accuracy checks

Each year's `checks` list holds official results the rules must reproduce. They run in `node check.js` and on the "How it's calculated" page.

To make them for a new year, use the BMF's official payroll tax calculator at **bmf-steuerrechner.de** (choose the new year):

1. For each check in the list, enter the same case: yearly gross pay, tax class, statutory health insurance with the average extra rate (`zusatzAverage`), pension and unemployment insurance, and care insurance **with** the childless surcharge (the checks assume age 30, no children, unless children are given).
   - For a single parent in class II, the BMF's "number of child allowances" (*Zahl der Kinderfreibeträge*) is **0.5 per child**.
2. Copy the yearly payroll tax (*Lohnsteuer*) into `expected`.
3. Update the two formula checks (`Tax at the allowance` and `Tax at … (zone edge)`) to the new `tariff.gfb` and `tariff.z2`.

The last two checks (the reduced band and the health pay limit) are generated from the rules automatically and need no editing.

### If a check fails

- **Off by a lot:** usually a typo in a figure. Compare each field against the checklist.
- **Off by a few euros, or only some checks fail:** the law may have changed *how* tax is calculated, not just the figures. In 2026, for example, unemployment insurance was added to the payroll tax insurance deduction. Compare the new PAP with the logic in `calcNet()` in `engine.js`; this needs a developer.
- **Don't deploy** with a failing check.

---

## 2. Rents and living costs (about twice a year)

All of these are in `app.js`, near the top. None of them affect tax.

| What | Where in `app.js` | Source to check |
|---|---|---|
| Rent per m² for each city | `CITY_ROWS`, with the source key per row and the sources in `RENT_SRC` | Miet-Check.de, mietspiegeltabelle.de, immowelt Mietkompass. Use average **asking** rents for existing flats |
| Service charges and heating per m² | `PER_M2` | Deutscher Mieterbund, *Betriebskostenspiegel* (published yearly) |
| Food and personal spending by lifestyle | `LIFESTYLE` | Typical food: Destatis EVS. The rest are Wings49 estimates |
| Electricity, mobile, internet, broadcasting fee, bank, insurance | Inline in `costDefs()` | Sources listed in `COST_SRC` |
| Source names and dates shown on the page | `RENT_SRC`, `COST_SRC` | Update the name or date whenever you change a figure |

When adding a city, add a row to `CITY_ROWS` in the form `[id, English name, German name or '', rent per m², source key, state code]`. The city count on the page updates by itself.

After changing anything, open the page and check the city list, the "Monthly living costs" step and the living cost table on "How it's calculated".

---

## 3. Exchange rate (automatic)

The page fetches the European Central Bank's euro to rupee rate on every load from `api.frankfurter.dev` (free, no API key). It caches the last rate in the visitor's browser.

The only manual setting is the fallback used when the request fails and nothing is cached: `FX_BUILT_IN` near the top of `app.js`. Updating it once a year, with the date, is enough.

If the service ever shuts down, replace `FX_URL` with another source returning the EUR to INR rate, and adjust the two lines in `loadFx()` that read the response.
