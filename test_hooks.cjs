const fs = require('fs');
const code = fs.readFileSync('src/ContentModal.tsx', 'utf8');
const exportContentModalIdx = code.indexOf('export function ContentModal({');
const renderMobileViewIdx = code.indexOf('  const renderMobileView = () => {');
const logicCode = code.substring(exportContentModalIdx, renderMobileViewIdx);
const lines = logicCode.split('\n');
lines.forEach((l, i) => {
  if (l.match(/^  const \{/)) Object.keys(l).forEach(() => {}) // wait, regex caught it
  if (l.startsWith("  const { aiTokenLimit }")) console.log("aiTokenLimit");
  if (l.startsWith("  const { lang }")) console.log("lang");
});
