const fs = require('fs');

let mobile = fs.readFileSync('src/components/ContentModalMobileView.tsx', 'utf8');
mobile = mobile.replace(/  };\n}$/, '}\n');
fs.writeFileSync('src/components/ContentModalMobileView.tsx', mobile);

