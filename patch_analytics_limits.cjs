const fs = require('fs');
let code = fs.readFileSync('src/AnalyticsView.tsx', 'utf8');

code = code.replace(/export function AnalyticsView\(\{[\s\S]*?planDetails,\n\}\: any\) \{/m, (match) => {
  return match + "\n  const { hasCapability } = usePlanLimits(planDetails);";
});

if (!code.includes("const { hasCapability } = usePlanLimits(planDetails);")) {
  console.log("Failed to patch AnalyticsView");
} else {
  fs.writeFileSync('src/AnalyticsView.tsx', code);
  console.log("Patched AnalyticsView");
}
