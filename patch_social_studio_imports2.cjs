const fs = require('fs');
let code = fs.readFileSync('src/SocialStudioView.tsx', 'utf8');

const regexToRemove = /import \{ \{ useState, useRef, useEffect, forwardRef, useImperativeHandle \} from 'react';\nimport \{ SimulatedStreamMarkdown \} from '\.\/components\/SimulatedStreamMarkdown';\nimport \{ \{ useState, useEffect, useRef \} from "react";/g;

code = code.replace(regexToRemove, 'import { useState, useEffect, useRef } from "react";');

fs.writeFileSync('src/SocialStudioView.tsx', code, 'utf8');
