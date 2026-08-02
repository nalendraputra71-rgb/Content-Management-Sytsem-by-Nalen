const fs = require('fs');
let code = fs.readFileSync('src/AdminPanel.tsx', 'utf8');

const defaultPlansReplacement = `
      const defaultPlans = [
        {
          id: "free-monthly",
          name: "Free Starter",
          desc: "Sempurna untuk kreator konten & profesional.",
          price: 0,
          originalPrice: 0,
          addMonths: 1,
          popular: false,
          features: ["1 Workspace", "Hub.AI: 3.1 Flash", "1 Akun Sosmed"],
          limits: { workspaces: 1, socialAccounts: 1, teamMembers: 0, aiCreditsPerMonth: 10, storageMB: 50 },
          capabilities: { 
            publicLink: true, customColumn: false, organicPaid: true, csvImportExport: false, autoPublishing: false,
            platformAnalytics: false, heatmaps: false, aiSummary: false, topBadAnalysis: false, demographics: false, pdfExport: false,
            aiAutoSave: false, aiModelText: "3.1 Flash", aiUsageText: "Terbatas", historyDays: 0, sharedBriefs: 20
          }
        },
        {
          id: "free-annual",
          name: "Free Starter",
          desc: "Sempurna untuk kreator konten & profesional.",
          price: 0,
          originalPrice: 0,
          addMonths: 12,
          popular: false,
          features: ["1 Workspace", "Hub.AI: 3.1 Flash", "1 Akun Sosmed"],
          limits: { workspaces: 1, socialAccounts: 1, teamMembers: 0, aiCreditsPerMonth: 10, storageMB: 50 },
          capabilities: { 
            publicLink: true, customColumn: false, organicPaid: true, csvImportExport: false, autoPublishing: false,
            platformAnalytics: false, heatmaps: false, aiSummary: false, topBadAnalysis: false, demographics: false, pdfExport: false,
            aiAutoSave: false, aiModelText: "3.1 Flash", aiUsageText: "Terbatas", historyDays: 0, sharedBriefs: 20
          }
        },
        {
          id: "plus-monthly",
          name: "Plus Plan (Monthly)",
          desc: "Sempurna untuk kreator konten & profesional.",
          price: 79000,
          originalPrice: 249000,
          addMonths: 1,
          popular: false,
          features: ["3 Workspaces", "Hub.AI: 3.1 Flash", "3 Akun Sosmed"],
          limits: { workspaces: 3, socialAccounts: 3, teamMembers: 3, aiCreditsPerMonth: 100, storageMB: 1000 },
          capabilities: { 
            publicLink: true, customColumn: true, organicPaid: true, csvImportExport: true, autoPublishing: true,
            platformAnalytics: true, heatmaps: true, aiSummary: true, topBadAnalysis: true, demographics: true, pdfExport: true,
            aiAutoSave: true, aiModelText: "3.1 Flash", aiUsageText: "Penggunaan 2x Lebih Tinggi", historyDays: 45, sharedBriefs: -1
          }
        },
        {
          id: "plus-annual",
          name: "Plus Plan (Annual)",
          desc: "Sempurna untuk kreator konten & profesional.",
          price: 948000,
          originalPrice: 2988000,
          addMonths: 12,
          popular: false,
          features: ["3 Workspaces", "Hub.AI: 3.1 Flash", "3 Akun Sosmed"],
          limits: { workspaces: 3, socialAccounts: 3, teamMembers: 3, aiCreditsPerMonth: 100, storageMB: 1000 },
          capabilities: { 
            publicLink: true, customColumn: true, organicPaid: true, csvImportExport: true, autoPublishing: true,
            platformAnalytics: true, heatmaps: true, aiSummary: true, topBadAnalysis: true, demographics: true, pdfExport: true,
            aiAutoSave: true, aiModelText: "3.1 Flash", aiUsageText: "Penggunaan 2x Lebih Tinggi", historyDays: 45, sharedBriefs: -1
          }
        },
        {
          id: "pro-monthly",
          name: "Pro Plan (Monthly)",
          desc: "Kolaborasi mulus untuk tim kecil & bisnis.",
          price: 149000,
          originalPrice: 499000,
          addMonths: 1,
          popular: true,
          features: ["5 Workspaces", "Hub.AI: 3.1 Pro & 3.5", "5 Anggota Tim"],
          limits: { workspaces: 5, socialAccounts: 10, teamMembers: 5, aiCreditsPerMonth: 500, storageMB: 5000 },
          capabilities: { 
            publicLink: true, customColumn: true, organicPaid: true, csvImportExport: true, autoPublishing: true,
            platformAnalytics: true, heatmaps: true, aiSummary: true, topBadAnalysis: true, demographics: true, pdfExport: true,
            aiAutoSave: true, aiModelText: "3.1 Pro, 3.5 & 3.1 Flash", aiUsageText: "Penggunaan 4x Lebih Tinggi", historyDays: 60, sharedBriefs: -1
          }
        },
        {
          id: "pro-annual",
          name: "Pro Plan (Annual)",
          desc: "Kolaborasi mulus untuk tim kecil & bisnis.",
          price: 1788000,
          originalPrice: 5988000,
          addMonths: 12,
          popular: true,
          features: ["5 Workspaces", "Hub.AI: 3.1 Pro & 3.5", "5 Anggota Tim"],
          limits: { workspaces: 5, socialAccounts: 10, teamMembers: 5, aiCreditsPerMonth: 500, storageMB: 5000 },
          capabilities: { 
            publicLink: true, customColumn: true, organicPaid: true, csvImportExport: true, autoPublishing: true,
            platformAnalytics: true, heatmaps: true, aiSummary: true, topBadAnalysis: true, demographics: true, pdfExport: true,
            aiAutoSave: true, aiModelText: "3.1 Pro, 3.5 & 3.1 Flash", aiUsageText: "Penggunaan 4x Lebih Tinggi", historyDays: 60, sharedBriefs: -1
          }
        },
        {
          id: "max-monthly",
          name: "Max Plan (Monthly)",
          desc: "Kekuatan penuh untuk skala besar & agency.",
          price: 249000,
          originalPrice: 799000,
          addMonths: 1,
          popular: false,
          features: ["10 Workspaces", "Hub.AI: 3.1 Pro & 3.5", "10 Anggota Tim"],
          limits: { workspaces: 10, socialAccounts: 15, teamMembers: 10, aiCreditsPerMonth: 1000, storageMB: 10000 },
          capabilities: { 
            publicLink: true, customColumn: true, organicPaid: true, csvImportExport: true, autoPublishing: true,
            platformAnalytics: true, heatmaps: true, aiSummary: true, topBadAnalysis: true, demographics: true, pdfExport: true,
            aiAutoSave: true, aiModelText: "3.1 Pro, 3.5 & 3.1 Flash", aiUsageText: "Penggunaan 6x Lebih Tinggi", historyDays: 90, sharedBriefs: -1
          }
        },
        {
          id: "max-annual",
          name: "Max Plan (Annual)",
          desc: "Kekuatan penuh untuk skala besar & agency.",
          price: 2988000,
          originalPrice: 9588000,
          addMonths: 12,
          popular: false,
          features: ["10 Workspaces", "Hub.AI: 3.1 Pro & 3.5", "10 Anggota Tim"],
          limits: { workspaces: 10, socialAccounts: 15, teamMembers: 10, aiCreditsPerMonth: 1000, storageMB: 10000 },
          capabilities: { 
            publicLink: true, customColumn: true, organicPaid: true, csvImportExport: true, autoPublishing: true,
            platformAnalytics: true, heatmaps: true, aiSummary: true, topBadAnalysis: true, demographics: true, pdfExport: true,
            aiAutoSave: true, aiModelText: "3.1 Pro, 3.5 & 3.1 Flash", aiUsageText: "Penggunaan 6x Lebih Tinggi", historyDays: 90, sharedBriefs: -1
          }
        }
      ];
`;

code = code.replace(/const defaultPlans = \[(.|\n)*?\{(.|\n)*?name: "Max Plan \(Annual\)"(.|\n)*?\}\n      \];/m, defaultPlansReplacement);

fs.writeFileSync('src/AdminPanel.tsx', code);
