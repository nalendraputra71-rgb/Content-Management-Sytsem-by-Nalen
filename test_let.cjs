const fs = require('fs');
const code = fs.readFileSync('src/ContentModal.tsx', 'utf8');
const exportContentModalIdx = code.indexOf('export function ContentModal({');
const renderMobileViewIdx = code.indexOf('  const renderMobileView = () => {');
const logicCode = code.substring(exportContentModalIdx, renderMobileViewIdx);
const lines = logicCode.split('\n');
lines.forEach((l, i) => {
  if (l.match(/^  let /)) console.log("Line " + i + ": " + l);
  if (l.match(/^  function /)) console.log("Line " + i + ": " + l);
});
