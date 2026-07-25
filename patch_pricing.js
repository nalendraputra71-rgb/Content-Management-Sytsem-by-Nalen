const fs = require('fs');
let code = fs.readFileSync('src/PricingPage.tsx', 'utf8');

const regex = /export const generateBulletPoints = \([\s\S]*?return bullets;\n};\n/m;
const match = code.match(regex);
if (match) {
  code = code.replace(regex, ''); // remove it from inside the function
  
  // Find where PricingPage function starts
  const funcStart = code.indexOf('export function PricingPage() {');
  if (funcStart !== -1) {
    code = code.slice(0, funcStart) + match[0] + '\n' + code.slice(funcStart);
    fs.writeFileSync('src/PricingPage.tsx', code);
    console.log("Successfully extracted generateBulletPoints.");
  }
}
