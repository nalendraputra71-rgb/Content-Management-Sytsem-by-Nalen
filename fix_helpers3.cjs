const fs = require('fs');

let code = fs.readFileSync('src/utils/contentModalHelpers.tsx', 'utf8');

code = code.replace(/export const valid =/g, 'const valid =');
code = code.replace(/export const split =/g, 'const split =');
code = code.replace(/export const lower =/g, 'const lower =');
code = code.replace(/export const translations: any =/g, 'const translations: any =');

code = code.replace(/MK, MC, eng, fmt, fmtD, gps,/, '');
code = code.replace(/import { I, B, CARD, MK, MC, eng, gps, L, GRP, CustomDropdown, htmlToPlainText } from "\.\/data";/g, '');

fs.writeFileSync('src/utils/contentModalHelpers.tsx', code);

