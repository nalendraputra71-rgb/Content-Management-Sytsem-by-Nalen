const fs = require('fs');
let code = fs.readFileSync('src/SocialStudioView.tsx', 'utf8');

const toReplace = `import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { CustomDropdown } from './components/CustomDropdown';
import { MobileStepper } from './components/MobileStepper';
import { useState, useEffect, useRef } from "react";`;

code = code.replace(toReplace, 'import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";');

fs.writeFileSync('src/SocialStudioView.tsx', code, 'utf8');
