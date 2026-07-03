const fs = require('fs');
let code = fs.readFileSync('src/Nav.tsx', 'utf8');

code = code.replace(/}  , Flame } from "lucide-react";/, ', Flame } from "lucide-react";');

fs.writeFileSync('src/Nav.tsx', code);
