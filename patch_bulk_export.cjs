const fs = require('fs');
let code = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf8');

const replacement = `    const { hasCapability } = usePlanLimits(planDetails);
    if (!hasCapability('csvImportExport')) {
        alert("Fitur Bulk Import/Export CSV tidak tersedia di paket Anda. Silakan upgrade paket.");
        return;
    }`;

code = code.replace(/    if \(profile\?\.plan !== "vip"\) \{\n       const hasFeature = planDetails\?\.features\?\.includes\("Bulk Edit & Export to CSV"\);\n       if \(!hasFeature\) \{\n          alert\("Fitur Bulk Edit & Export to CSV tidak tersedia di paket Anda\. Silakan upgrade paket\."\);\n          return;\n       \}\n    \}/g, replacement);

fs.writeFileSync('src/layouts/MainLayout.tsx', code);
