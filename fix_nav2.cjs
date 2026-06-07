const fs = require('fs');

let content = fs.readFileSync('./src/Nav.tsx', 'utf8');

content = content.replace(
  /padding: open \? 12 : 8,\n                      borderRadius: 16,\n                      background: "rgba\(255,255,255,0\.05\)",\n                      cursor: "pointer",\n                      marginBottom: 8,/g,
  'padding: open ? 12 : "8px 0",\n                      justifyContent: open ? "flex-start" : "center",\n                      borderRadius: 16,\n                      background: "rgba(255,255,255,0.05)",\n                      cursor: "pointer",\n                      marginBottom: 8,'
);

content = content.replace(
  /padding: open \? 12 : 8,\n                      borderRadius: 16,\n                      background: "rgba\(225,29,72,0\.1\)",\n                      color: "#E11D48",\n                      cursor: "pointer",/g,
  'padding: open ? 12 : "8px 0",\n                      justifyContent: open ? "flex-start" : "center",\n                      borderRadius: 16,\n                      background: "rgba(225,29,72,0.1)",\n                      color: "#E11D48",\n                      cursor: "pointer",'
);

fs.writeFileSync('./src/Nav.tsx', content);
