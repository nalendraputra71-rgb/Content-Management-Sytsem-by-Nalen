const fs = require('fs');

let cm = fs.readFileSync('src/ContentModal.tsx', 'utf8');
cm = cm.replace(/import \{ ContentModalMobileView \} from "\.\/components\/ContentModalMobileView";/g, 'import { ContentModalMobileView } from "./components/ContentModalMobileView";\nimport { ContentModalContext } from "./ContentModalContext";');

cm = cm.replace(/<ContentModalDesktopView ctx=\{ctx\} \/>/g, '<ContentModalContext.Provider value={ctx}><ContentModalDesktopView /></ContentModalContext.Provider>');
cm = cm.replace(/<ContentModalMobileView ctx=\{ctx\} \/>/g, '<ContentModalContext.Provider value={ctx}><ContentModalMobileView /></ContentModalContext.Provider>');
fs.writeFileSync('src/ContentModal.tsx', cm);

let cmm = fs.readFileSync('src/components/ContentModalMobileView.tsx', 'utf8');
cmm = cmm.replace(/export function ContentModalMobileView\(\{\s*ctx\s*\}\s*:\s*\{\s*ctx:\s*any\s*\}\) \{/g, 'import { useContentModal } from "../ContentModalContext";\nexport function ContentModalMobileView() {\nconst ctx = useContentModal();');
fs.writeFileSync('src/components/ContentModalMobileView.tsx', cmm);

let cmd = fs.readFileSync('src/components/ContentModalDesktopView.tsx', 'utf8');
cmd = cmd.replace(/export function ContentModalDesktopView\(\{\s*ctx\s*\}\s*:\s*\{\s*ctx:\s*any\s*\}\) \{/g, 'import { useContentModal } from "../ContentModalContext";\nexport function ContentModalDesktopView() {\nconst ctx = useContentModal();');
fs.writeFileSync('src/components/ContentModalDesktopView.tsx', cmd);

console.log("Context implemented");
