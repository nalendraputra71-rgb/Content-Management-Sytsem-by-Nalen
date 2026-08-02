const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Map the model from req.body
const mapLogic = `
    let actualModel = model;
    if (actualModel === "gemini-3.1-pro") actualModel = "gemini-3.1-pro-preview";
    if (actualModel === "gemini-3.5-flash-lite") actualModel = "gemini-3.1-flash-lite"; 
    // we let gemini-3.5-flash be gemini-3.6-flash to be safe and use latest
    if (actualModel === "gemini-3.5-flash") actualModel = "gemini-3.6-flash";
`;

code = code.replace(/} = req\.body;\s*(\/\/ Mengambil API Key murni dari Google AI Studio dropdown atau secret)/g, `} = req.body;\n${mapLogic}\n    $1`);

code = code.replace(/model: model,/g, 'model: actualModel,');

fs.writeFileSync('server.ts', code);
console.log('Patched server.ts models');
