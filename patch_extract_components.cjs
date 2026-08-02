const fs = require('fs');

let appContent = fs.readFileSync('src/App.tsx', 'utf8');

// QuickAddEventModal
const qStart = appContent.indexOf('export function QuickAddEventModal({');
let endIdx = appContent.indexOf('export function CMSLayout', qStart);
if (endIdx === -1) endIdx = appContent.indexOf('function PublicView', qStart);
let qContent = appContent.substring(qStart, endIdx);

let newQContent = `import { useState } from "react";\nimport { motion } from "motion/react";\nimport { Calendar, Trash2 } from "lucide-react";\nimport { ColorPickerSelect } from "./components/ColorPickerSelect";\nimport { useI18n } from "./i18n";\nimport { gid, I, B } from "./data";\n\n` + qContent;
fs.writeFileSync('src/QuickAddEventModal.tsx', newQContent);
appContent = appContent.substring(0, qStart) + appContent.substring(endIdx);


// LoadingScreen
const lStart = appContent.indexOf('export function LoadingScreen({');
endIdx = appContent.indexOf('export function QuickAddEventModal', lStart);
if (endIdx === -1) endIdx = appContent.indexOf('export function CMSLayout', lStart);
let lContent = appContent.substring(lStart, endIdx);

let newLContent = `import { motion } from "motion/react";\nimport { getPlatformIcon } from "./data";\n\n` + lContent;
fs.writeFileSync('src/LoadingScreen.tsx', newLContent);
appContent = appContent.substring(0, lStart) + appContent.substring(endIdx);


// OnboardingOverlay
const oStart = appContent.indexOf('function OnboardingOverlay({');
endIdx = appContent.indexOf('export function LoadingScreen', oStart);
if (endIdx === -1) endIdx = appContent.indexOf('export function CMSLayout', oStart);
if (endIdx === -1) endIdx = appContent.indexOf('function PublicView', oStart);
let oContent = appContent.substring(oStart, endIdx);

let newOContent = `import { useState } from "react";\nimport { motion } from "motion/react";\nimport { useI18n } from "./i18n";\nimport { B, I } from "./data";\n\nexport ` + oContent;
fs.writeFileSync('src/OnboardingOverlay.tsx', newOContent);
appContent = appContent.substring(0, oStart) + appContent.substring(endIdx);

fs.writeFileSync('src/App.tsx', appContent);
