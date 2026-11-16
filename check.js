// Runs the accuracy checks for every tax year in engine.js.
// Usage: node check.js   (exits with code 1 if any check fails, so it can gate a deploy)
const { runChecks, RULES_BY_YEAR, YEARS, currentYear } = require('./engine.js');

let failed = 0;
for (const y of YEARS) {
  console.log(`\nTax year ${y}${y === currentYear() ? ' (in use today)' : ''}`);
  for (const c of runChecks(RULES_BY_YEAR[y])) {
    if (!c.pass) failed++;
    console.log(`  ${c.pass ? 'PASS' : 'FAIL'}  ${c.label}: got ${c.got}, expected ${c.expected}`);
  }
}
console.log(failed ? `\n${failed} check(s) failed.` : '\nAll checks passed.');
process.exit(failed ? 1 : 0);
