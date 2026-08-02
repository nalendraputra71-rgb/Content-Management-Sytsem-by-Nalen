const fs = require('fs');
let code = fs.readFileSync('src/AnalyticsView.tsx', 'utf8');

code = code.replace(/export function AnalyticsView\(\{([\s\S]*?)\}\: any\) \{/m, (match, p1) => {
  return `export function AnalyticsView({${p1}}: any) {\n  const { hasCapability } = usePlanLimits(planDetails);`;
});

fs.writeFileSync('src/AnalyticsView.tsx', code);
console.log("Patched AnalyticsView");
