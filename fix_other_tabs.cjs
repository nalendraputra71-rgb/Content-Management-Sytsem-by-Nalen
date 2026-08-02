const fs = require('fs');

function fixTab(tabFile, usedVars) {
    let code = fs.readFileSync(tabFile, 'utf8');
    code = code.replace('// WE WILL FILL THIS LATER', usedVars.join(',\n    '));
    fs.writeFileSync(tabFile, code);
}

// Just waiting for the TS output to see what variables are missing for the others.
