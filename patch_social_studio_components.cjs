const fs = require('fs');

let code = fs.readFileSync('src/SocialStudioView.tsx', 'utf8');

const regexDropdown = /function CustomDropdown\([\s\S]*?\}\n\n/m;
code = code.replace(regexDropdown, '');

const regexStepper = /function MobileStepper\([\s\S]*?\}\n\n/m;
code = code.replace(regexStepper, '');

if (!code.includes("import { CustomDropdown }")) {
  code = code.replace("import React,", "import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';\nimport { CustomDropdown } from './components/CustomDropdown';\nimport { MobileStepper } from './components/MobileStepper';\nimport {");
}

fs.writeFileSync('src/SocialStudioView.tsx', code, 'utf8');
