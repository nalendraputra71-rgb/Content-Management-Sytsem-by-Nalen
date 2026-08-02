const fs = require('fs');
let code = fs.readFileSync('src/PricingPage.tsx', 'utf8');

const getCompareRowsReplacement = `export const getCompareRows = (lang: 'id' | 'en' = 'id') => [
  // 1. Management & Limits
  {
    category: lang === 'id' ? 'Manajemen & Akses' : 'Management & Access',
    id: lang === 'id' ? 'Jumlah Workspace' : 'Workspaces',
    free: '1',
    getVal: (p: any) => {
      const v = p.limits?.workspaces;
      return (v === -1 || v === '-1') ? 'Unlimited' : \`\${v ?? 1}\`;
    }
  },
  {
    category: lang === 'id' ? 'Manajemen & Akses' : 'Management & Access',
    id: lang === 'id' ? 'Integrasi Akun Sosmed (Segera)' : 'Social Accounts (Soon)',
    free: '1 Akun',
    getVal: (p: any) => {
      const v = p.limits?.socialAccounts;
      return (v === -1 || v === '-1') ? 'Unlimited' : \`\${v ?? 1} Akun\`;
    }
  },
  {
    category: lang === 'id' ? 'Manajemen & Akses' : 'Management & Access',
    id: lang === 'id' ? 'Anggota Tim & Kolaborasi' : 'Team Members',
    free: '-',
    getVal: (p: any) => {
      const v = p.limits?.teamMembers;
      if (v === -1 || v === '-1') return 'Unlimited';
      if (!v || v === 0) return '-';
      return \`\${v}\`;
    }
  },
  {
    category: lang === 'id' ? 'Manajemen & Akses' : 'Management & Access',
    id: lang === 'id' ? 'Penyimpanan Aset Media' : 'Asset Storage',
    free: '50 MB',
    getVal: (p: any) => {
      const v = p.limits?.storageMB;
      if (v === -1 || v === '-1') return 'Unlimited';
      return \`\${v ?? 50} MB\`;
    }
  },
  // 2. Dashboard & Productivity
  {
    category: lang === 'id' ? 'Dashboard & Produktivitas' : 'Dashboard & Productivity',
    id: lang === 'id' ? 'Tren Terkini & Insight' : 'Up-to-Date Trends',
    free: true,
    getVal: () => true
  },
  {
    category: lang === 'id' ? 'Dashboard & Produktivitas' : 'Dashboard & Productivity',
    id: lang === 'id' ? 'To-Do List & Tugas' : 'To-Do List & Tasks',
    free: true,
    getVal: () => true
  },
  {
    category: lang === 'id' ? 'Dashboard & Produktivitas' : 'Dashboard & Productivity',
    id: lang === 'id' ? 'Metrik Progres Harian' : 'Daily Progress Metrics',
    free: true,
    getVal: () => true
  },
  {
    category: lang === 'id' ? 'Dashboard & Produktivitas' : 'Dashboard & Productivity',
    id: lang === 'id' ? 'Catatan Tempel (Sticky Notes)' : 'Sticky Notes',
    free: true,
    getVal: () => true
  },
  {
    category: lang === 'id' ? 'Dashboard & Produktivitas' : 'Dashboard & Productivity',
    id: lang === 'id' ? 'Brief Konten Bersama' : 'Shared Brief Content',
    free: '20 Brief Konten',
    getVal: (p: any) => {
      const v = p.capabilities?.sharedBriefs;
      if (v === -1 || v === '-1') return 'Unlimited';
      return v ? \`\${v} Brief Konten\` : '-';
    }
  },
  // 3. Hub.AI Assistant
  {
    category: lang === 'id' ? 'Hub.AI Assistant' : 'Hub.AI Assistant',
    id: lang === 'id' ? 'Model AI Gemini' : 'Gemini AI Models',
    free: '3.1 Flash',
    getVal: (p: any) => p.capabilities?.aiModelText || '3.1 Flash'
  },
  {
    category: lang === 'id' ? 'Hub.AI Assistant' : 'Hub.AI Assistant',
    id: lang === 'id' ? 'Auto-Save Chat ke Brief' : 'Auto-Save Chat to Brief',
    free: '-',
    getVal: (p: any) => p.capabilities?.aiAutoSave ? true : '-'
  },
  {
    category: lang === 'id' ? 'Hub.AI Assistant' : 'Hub.AI Assistant',
    id: lang === 'id' ? 'Batas Generate AI / Bulan' : 'AI Generation / Month',
    free: 'Terbatas',
    getVal: (p: any) => p.capabilities?.aiUsageText || 'Terbatas'
  },
  // 4. Content Calendar & Brief
  {
    category: lang === 'id' ? 'Kalender & Brief Konten' : 'Content Calendar & Brief',
    id: lang === 'id' ? 'Public / Shared Brief Link' : 'Public Shared Brief',
    free: true,
    getVal: (p: any) => p.capabilities?.publicLink ? true : '-'
  },
  {
    category: lang === 'id' ? 'Kalender & Brief Konten' : 'Content Calendar & Brief',
    id: lang === 'id' ? 'Riwayat Edit Brief Konten' : 'Brief Edit History',
    free: '-',
    getVal: (p: any) => {
      const v = p.capabilities?.historyDays;
      if (!v || v === 0) return '-';
      if (v === -1) return 'Unlimited';
      return \`\${v} Hari\`;
    }
  },
  {
    category: lang === 'id' ? 'Kalender & Brief Konten' : 'Content Calendar & Brief',
    id: lang === 'id' ? 'Kustom Kolom Brief' : 'Brief Column Customization',
    free: '-',
    getVal: (p: any) => p.capabilities?.customColumn ? true : '-'
  },
  {
    category: lang === 'id' ? 'Kalender & Brief Konten' : 'Content Calendar & Brief',
    id: lang === 'id' ? 'Pemisah Data Organik/Paid' : 'Organic vs Paid Split',
    free: true,
    getVal: (p: any) => p.capabilities?.organicPaid ? true : '-'
  },
  {
    category: lang === 'id' ? 'Kalender & Brief Konten' : 'Content Calendar & Brief',
    id: lang === 'id' ? 'Bulk Import & Export CSV/XLSX' : 'Bulk Import/Export',
    free: '-',
    getVal: (p: any) => p.capabilities?.csvImportExport ? true : '-'
  },
  {
    category: lang === 'id' ? 'Kalender & Brief Konten' : 'Content Calendar & Brief',
    id: lang === 'id' ? 'Penjadwalan Otomatis (Segera)' : 'Auto Publishing',
    free: '-',
    getVal: (p: any) => p.capabilities?.autoPublishing ? true : '-'
  },
  // 5. Analytics & Reports
  {
    category: lang === 'id' ? 'Analitik & Pelaporan' : 'Analytics & Reporting',
    id: lang === 'id' ? 'Analitik Per Platform' : 'Platform Analytics',
    free: '-',
    getVal: (p: any) => p.capabilities?.platformAnalytics ? true : '-'
  },
  {
    category: lang === 'id' ? 'Analitik & Pelaporan' : 'Analytics & Reporting',
    id: lang === 'id' ? 'Grafik & Heatmap Aktivitas' : 'Charts & Heatmap',
    free: '-',
    getVal: (p: any) => p.capabilities?.heatmaps ? true : '-'
  },
  {
    category: lang === 'id' ? 'Analitik & Pelaporan' : 'Analytics & Reporting',
    id: lang === 'id' ? 'Rangkuman AI Otomatis' : 'AI Performance Summary',
    free: '-',
    getVal: (p: any) => p.capabilities?.aiSummary ? true : '-'
  },
  {
    category: lang === 'id' ? 'Analitik & Pelaporan' : 'Analytics & Reporting',
    id: lang === 'id' ? 'Analisis Top & Bad Content' : 'Top & Bad Content Analysis',
    free: '-',
    getVal: (p: any) => p.capabilities?.topBadAnalysis ? true : '-'
  },
  {
    category: lang === 'id' ? 'Analitik & Pelaporan' : 'Analytics & Reporting',
    id: lang === 'id' ? 'Data Demografi Per Platform' : 'Platform Demographics',
    free: '-',
    getVal: (p: any) => p.capabilities?.demographics ? true : '-'
  },
  {
    category: lang === 'id' ? 'Analitik & Pelaporan' : 'Analytics & Reporting',
    id: lang === 'id' ? 'Export Laporan PDF' : 'PDF Report Export',
    free: '-',
    getVal: (p: any) => p.capabilities?.pdfExport ? true : '-'
  }
];`;

code = code.replace(/export const getCompareRows = \(lang: 'id' \| 'en' = 'id'\) => \[(.|\n)*?\n\];/m, getCompareRowsReplacement);

fs.writeFileSync('src/PricingPage.tsx', code);
