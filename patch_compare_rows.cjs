const fs = require('fs');
let code = fs.readFileSync('src/PricingPage.tsx', 'utf8');

// Update signature
code = code.replace(/export const getCompareRows = \(lang: 'id' \| 'en' = 'id'\) => \[/, `export const getCompareRows = (lang: 'id' | 'en' = 'id', freeLimits: any = {}, freeCaps: any = {}) => [`);

// Update free values
code = code.replace(/free: '1',\n    getVal: \(p: any\) => \{\n      const v = p.limits\?.workspaces;/, `free: (freeLimits.workspaces === -1 || freeLimits.workspaces === '-1') ? 'Unlimited' : \`\${freeLimits.workspaces ?? 1}\`,
    getVal: (p: any) => {
      const v = p.limits?.workspaces;`);

code = code.replace(/free: '1 Akun',\n    getVal: \(p: any\) => \{\n      const v = p.limits\?.socialAccounts;/, `free: (freeLimits.socialAccounts === -1 || freeLimits.socialAccounts === '-1') ? 'Unlimited' : \`\${freeLimits.socialAccounts ?? 1} Akun\`,
    getVal: (p: any) => {
      const v = p.limits?.socialAccounts;`);

code = code.replace(/free: '-',\n    getVal: \(p: any\) => \{\n      const v = p.limits\?.teamMembers;/, `free: (() => {
      const v = freeLimits.teamMembers;
      if (v === -1 || v === '-1') return 'Unlimited';
      if (!v || v === 0) return '-';
      return \`\${v}\`;
    })(),
    getVal: (p: any) => {
      const v = p.limits?.teamMembers;`);

code = code.replace(/free: '50 MB',\n    getVal: \(p: any\) => \{\n      const v = p.limits\?.storageMB;/, `free: (() => {
      const v = freeLimits.storageMB;
      if (v === -1 || v === '-1') return 'Unlimited';
      return \`\${v ?? 50} MB\`;
    })(),
    getVal: (p: any) => {
      const v = p.limits?.storageMB;`);

code = code.replace(/free: '20 Brief Konten',\n    getVal: \(p: any\) => \{\n      const v = p.capabilities\?.sharedBriefs;/, `free: (() => {
      const v = freeCaps.sharedBriefs;
      if (v === -1 || v === '-1') return 'Unlimited';
      return v ? \`\${v} Brief Konten\` : '-';
    })(),
    getVal: (p: any) => {
      const v = p.capabilities?.sharedBriefs;`);

code = code.replace(/free: '3.1 Flash',\n    getVal: \(p: any\) => p.capabilities\?.aiModelText \|\| '3.1 Flash'/, `free: freeCaps.aiModelText || '3.1 Flash',
    getVal: (p: any) => p.capabilities?.aiModelText || '3.1 Flash'`);

code = code.replace(/free: '-',\n    getVal: \(p: any\) => p.capabilities\?.aiAutoSave \? true : '-'/g, `free: freeCaps.aiAutoSave ? true : '-',
    getVal: (p: any) => p.capabilities?.aiAutoSave ? true : '-'`);

code = code.replace(/free: 'Terbatas',\n    getVal: \(p: any\) => p.capabilities\?.aiUsageText \|\| 'Terbatas'/, `free: freeCaps.aiUsageText || 'Terbatas',
    getVal: (p: any) => p.capabilities?.aiUsageText || 'Terbatas'`);

code = code.replace(/free: true,\n    getVal: \(p: any\) => p.capabilities\?.publicLink \? true : '-'/g, `free: freeCaps.publicLink ? true : '-',
    getVal: (p: any) => p.capabilities?.publicLink ? true : '-'`);

code = code.replace(/free: '-',\n    getVal: \(p: any\) => \{\n      const v = p.capabilities\?.historyDays;/, `free: (() => {
      const v = freeCaps.historyDays;
      if (!v || v === 0) return '-';
      if (v === -1) return 'Unlimited';
      return \`\${v} Hari\`;
    })(),
    getVal: (p: any) => {
      const v = p.capabilities?.historyDays;`);

code = code.replace(/free: '-',\n    getVal: \(p: any\) => p.capabilities\?.customColumn \? true : '-'/g, `free: freeCaps.customColumn ? true : '-',
    getVal: (p: any) => p.capabilities?.customColumn ? true : '-'`);

code = code.replace(/free: true,\n    getVal: \(p: any\) => p.capabilities\?.organicPaid \? true : '-'/g, `free: freeCaps.organicPaid ? true : '-',
    getVal: (p: any) => p.capabilities?.organicPaid ? true : '-'`);

code = code.replace(/free: '-',\n    getVal: \(p: any\) => p.capabilities\?.csvImportExport \? true : '-'/g, `free: freeCaps.csvImportExport ? true : '-',
    getVal: (p: any) => p.capabilities?.csvImportExport ? true : '-'`);

code = code.replace(/free: '-',\n    getVal: \(p: any\) => p.capabilities\?.autoPublishing \? true : '-'/g, `free: freeCaps.autoPublishing ? true : '-',
    getVal: (p: any) => p.capabilities?.autoPublishing ? true : '-'`);

code = code.replace(/free: '-',\n    getVal: \(p: any\) => p.capabilities\?.platformAnalytics \? true : '-'/g, `free: freeCaps.platformAnalytics ? true : '-',
    getVal: (p: any) => p.capabilities?.platformAnalytics ? true : '-'`);

code = code.replace(/free: '-',\n    getVal: \(p: any\) => p.capabilities\?.heatmaps \? true : '-'/g, `free: freeCaps.heatmaps ? true : '-',
    getVal: (p: any) => p.capabilities?.heatmaps ? true : '-'`);

code = code.replace(/free: '-',\n    getVal: \(p: any\) => p.capabilities\?.aiSummary \? true : '-'/g, `free: freeCaps.aiSummary ? true : '-',
    getVal: (p: any) => p.capabilities?.aiSummary ? true : '-'`);

code = code.replace(/free: '-',\n    getVal: \(p: any\) => p.capabilities\?.topBadAnalysis \? true : '-'/g, `free: freeCaps.topBadAnalysis ? true : '-',
    getVal: (p: any) => p.capabilities?.topBadAnalysis ? true : '-'`);

code = code.replace(/free: '-',\n    getVal: \(p: any\) => p.capabilities\?.demographics \? true : '-'/g, `free: freeCaps.demographics ? true : '-',
    getVal: (p: any) => p.capabilities?.demographics ? true : '-'`);

code = code.replace(/free: '-',\n    getVal: \(p: any\) => p.capabilities\?.pdfExport \? true : '-'/g, `free: freeCaps.pdfExport ? true : '-',
    getVal: (p: any) => p.capabilities?.pdfExport ? true : '-'`);

code = code.replace(/\{getCompareRows\(lang\)\.map/g, `{getCompareRows(lang, freeLimits, freeCaps).map`);

fs.writeFileSync('src/PricingPage.tsx', code);
