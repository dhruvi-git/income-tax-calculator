# Wings49 salary calculator

A German salary calculator for people moving to Germany. It works out take-home pay, living costs and savings for a job offer, compares offers and cities, and checks the EU Blue Card salary. Figures can be shown in euros or rupees.

It is a static site: plain HTML, CSS and JavaScript, with no build step, no framework and no server code.

## Files

| File | What it holds |
|---|---|
| `index.html` | Page structure and all fixed text |
| `styles.css` | Styles. Brand colours are `--purple` (#522583) and `--gold` (#caaf66) at the top |
| `engine.js` | **Tax and social security rules, one block per tax year**, and the calculation itself |
| `app.js` | Everything else: city rents, living costs, exchange rate, page logic and charts |
| `check.js` | Command-line accuracy checks for the tax rules |
| `logo.png` | Logo and favicon |
| `UPDATING.md` | **How to keep the figures up to date.** Read this before changing any numbers |

## Running and deploying

- **Locally:** open `index.html` in a browser. No install needed.
- **Deploying:** upload the files above to any static host (Netlify, Vercel, S3, nginx, cPanel and so on). `check.js`, `README.md` and `UPDATING.md` don't need to be served, but it does no harm.
- **Before every deploy** that touches `engine.js`, run `node check.js` (Node 18 or newer). It exits with code 1 if any check fails, so it can be added to a CI pipeline as a gate.

## External services

The page calls out to two places. If your host sets a Content Security Policy, allow them:

| Service | Used for | CSP directive |
|---|---|---|
| `https://api.frankfurter.dev` | Daily euro to rupee rate (European Central Bank data). Free, no API key, no account | `connect-src` |
| `https://fonts.googleapis.com`, `https://fonts.gstatic.com` | Montserrat font | `style-src`, `font-src` |

If the exchange-rate request fails, the page uses the last rate it fetched, then a built-in rate, and says so on the "How it's calculated" page. Nothing else breaks.

## What updates by itself and what doesn't

| Data | Updates | How |
|---|---|---|
| Exchange rate | Automatically, every page load | Fetched live, see above |
| Tax year in use | Automatically, on 1 January | The page uses the latest year in `engine.js` that has started |
| Tax and social security figures | **By hand, once a year** | See `UPDATING.md` |
| Rents and living costs | **By hand, about twice a year** | See `UPDATING.md` |

Tax figures can't be fetched automatically: there is no official German API for them, and they are fixed by law for a whole year. A yearly update with the accuracy checks is the reliable way to keep them right.

## Browser storage

Visitors' inputs and saved offers are kept in their own browser's `localStorage`, under keys starting with `w49calc.`. Nothing is sent to any server. Default values are not stored, so visitors pick up new yearly figures automatically.
