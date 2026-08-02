const fs = require('fs');

function replaceInFile(filename) {
  let code = fs.readFileSync(filename, 'utf8');

  // Add imports if needed
  if (!code.includes('DebouncedInput')) {
    code = code.replace(/import \{ Tooltip \} from "\.\/Tooltip";/, 'import { Tooltip } from "./Tooltip";\nimport { DebouncedInput, DebouncedTextarea } from "./DebouncedInput";');
  }

  // Replace TextareaAutosize
  code = code.replace(/<TextareaAutosize /g, '<DebouncedTextarea ');
  code = code.replace(/<\/TextareaAutosize>/g, '</DebouncedTextarea>');

  // Replace specific text/number inputs
  code = code.replace(/<input (disabled=\{!canEdit\} (type="number"|type="text"|value=|autoFocus))/g, '<DebouncedInput $1');

  fs.writeFileSync(filename, code);
  console.log("Patched " + filename);
}

replaceInFile('src/components/ContentModalMobileView.tsx');
replaceInFile('src/components/ContentModalDesktopView.tsx');
