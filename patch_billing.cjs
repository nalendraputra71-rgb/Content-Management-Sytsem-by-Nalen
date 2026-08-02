const fs = require('fs');
let code = fs.readFileSync('src/BillingView.tsx', 'utf8');

code = code.replace(/\{getCompareRows\(lang\)\.map/g, `
                {(() => {
                  const dbFreePlan = dbPlans.find(p => p.id === (isAnnual ? 'free-annual' : 'free-monthly'));
                  const freeLimits = dbFreePlan?.limits || { workspaces: 1, socialAccounts: 1, teamMembers: 0, aiCreditsPerMonth: 10, storageMB: 150 };
                  const freeCaps = dbFreePlan?.capabilities || { 
                      publicLink: true, customColumn: false, organicPaid: true, csvImportExport: false, autoPublishing: false, 
                      platformAnalytics: false, heatmaps: false, aiSummary: false, topBadAnalysis: false, demographics: false, pdfExport: false,
                      aiAutoSave: false, aiModelText: "3.1 Flash", aiUsageText: "Terbatas", historyDays: 0, sharedBriefs: 20
                  };
                  return getCompareRows(lang, freeLimits, freeCaps);
                })().map`);

fs.writeFileSync('src/BillingView.tsx', code);
