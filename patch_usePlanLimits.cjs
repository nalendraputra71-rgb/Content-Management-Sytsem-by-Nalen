const fs = require('fs');
let code = fs.readFileSync('src/hooks/usePlanLimits.ts', 'utf8');

const replacement = `  const getCapability = (capKey: string, defaultValue: any = false) => {
    if (isAdmin) {
       // if it's a numeric cap, we should probably return -1 for unlimited, but for now let's just return the value if we can, or a generic unlimited
       if (capKey === 'sharedBriefs') return -1;
       if (capKey === 'historyDays') return -1;
       return true;
    }
    
    if (planDetails && planDetails.capabilities && planDetails.capabilities[capKey] !== undefined) {
      return planDetails.capabilities[capKey];
    }
    return defaultValue;
  };

  const hasCapability = (capKey: string) => {
    const val = getCapability(capKey);
    if (typeof val === 'number') return val !== 0;
    return !!val;
  };`;

code = code.replace(/  const hasCapability = \(capKey: string\) => \{[\s\S]*?return false; \/\/ Default to false if not found\n  \};/, replacement);

code = code.replace(/    hasCapability\n  \};\n\}/, `    hasCapability,\n    getCapability\n  };\n}`);

fs.writeFileSync('src/hooks/usePlanLimits.ts', code);
