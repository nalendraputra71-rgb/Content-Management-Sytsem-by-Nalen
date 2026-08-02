const fs = require('fs');

const code = fs.readFileSync('src/ContentModal.tsx', 'utf8');
const renderMobileViewIdx = code.indexOf('  const renderMobileView = () => {');

let newCode = code.substring(0, renderMobileViewIdx);
const ctxVarsRaw = fs.readFileSync('ctx_vars.txt', 'utf8');

newCode += `
${ctxVarsRaw.replace(/\\n/g, '\n')}

  if (isMobile) {
    return <ContentModalMobileView ctx={ctx} />;
  }

  return <ContentModalDesktopView ctx={ctx} />;
}
`;

// Add imports
newCode = `import { ContentModalMobileView } from "./components/ContentModalMobileView";\nimport { ContentModalDesktopView } from "./components/ContentModalDesktopView";\n${newCode}`;

fs.writeFileSync('src/ContentModal.tsx', newCode);
