const fs = require('fs');

const code = fs.readFileSync('src/ContentModal.tsx', 'utf8');

const exportContentModalIdx = code.indexOf('export function ContentModal({');
const renderMobileViewIdx = code.indexOf('  const renderMobileView = () => {');
const desktopViewIdx = code.indexOf('  if (isMobile) {');

const beforeComponent = code.substring(0, exportContentModalIdx);
const imports = beforeComponent.match(/^import .*$/gm).join('\n');

const renderMobileViewCode = code.substring(renderMobileViewIdx, desktopViewIdx);

const desktopReturnStart = code.indexOf('  return (', desktopViewIdx);
const lastBraceIdx = code.lastIndexOf('}');
const desktopViewCode = code.substring(desktopReturnStart, lastBraceIdx);

const ctxVarsRaw = fs.readFileSync('ctx_vars.txt', 'utf8');
const destructure = ctxVarsRaw.replace('const ctx = {', 'const {').replace('};', '} = ctx;');

const mobileContent = `
${imports}

export function ContentModalMobileView({ ctx }: { ctx: any }) {
${destructure}

${renderMobileViewCode.replace('const renderMobileView = () => {', '').slice(0, -1)}
}
`;
fs.writeFileSync('src/components/ContentModalMobileView.tsx', mobileContent);

const desktopContent = `
${imports}

export function ContentModalDesktopView({ ctx }: { ctx: any }) {
${destructure}

${desktopViewCode}
}
`;
fs.writeFileSync('src/components/ContentModalDesktopView.tsx', desktopContent);

console.log("Views generated.");
