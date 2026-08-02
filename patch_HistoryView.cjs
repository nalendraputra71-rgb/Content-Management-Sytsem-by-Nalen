const fs = require('fs');
let code = fs.readFileSync('src/components/HistoryView.tsx', 'utf8');

// Update HistoryView props to accept planDetails
code = code.replace(/export const HistoryView = \(\{/, `import { usePlanLimits } from '../hooks/usePlanLimits';\n\nexport const HistoryView = ({`);
code = code.replace(/  editorProfiles\n\}\: \{/, `  editorProfiles,\n  planDetails\n}: {`);
code = code.replace(/  editorProfiles\: any\;\n\}\)/, `  editorProfiles: any;\n  planDetails: any;\n})`);

// Use usePlanLimits to get historyDays
const getHistoryDaysCode = `
  const { hasCapability } = usePlanLimits(planDetails);
  // Actually historyDays is a numeric capability? Wait, usePlanLimits hasCapability returns boolean. Let's get it directly from planDetails
  const historyDays = planDetails?.capabilities?.historyDays ?? 0;
  
  useEffect(() => {`;

code = code.replace(/  useEffect\(\(\) => \{/, getHistoryDaysCode);

fs.writeFileSync('src/components/HistoryView.tsx', code);
