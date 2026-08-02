const fs = require('fs');

function fixFile(file) {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(/from "\.\/components\//g, 'from "./');
  code = code.replace(/from "\.\/i18n"/g, 'from "../i18n"');
  code = code.replace(/from "\.\/firebase"/g, 'from "../firebase"');
  code = code.replace(/from "\.\/hooks\//g, 'from "../hooks/');
  code = code.replace(/from "\.\/RichTextEditor"/g, 'from "../RichTextEditor"');
  code = code.replace(/from "\.\/data"/g, 'from "../data"');
  code = code.replace(/from "\.\/utils\//g, 'from "../utils/');
  fs.writeFileSync(file, code);
}

fixFile('src/components/ContentModalMobileView.tsx');
fixFile('src/components/ContentModalDesktopView.tsx');

