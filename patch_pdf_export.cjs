const fs = require('fs');
let code = fs.readFileSync('src/AnalyticsView.tsx', 'utf8');

const replacement = `  const handleOpenPrintModal = () => {
    if (!hasCapability('pdfExport')) {
      alert(lang === 'id' ? 'Upgrade paket untuk mengekspor Laporan PDF.' : 'Upgrade plan to export PDF Reports.');
      return;
    }
    setIsPrintModalOpen(true);
  };`;

code = code.replace(/  const handleOpenPrintModal = \(\) => \{\n    setIsPrintModalOpen\(true\);\n  \};/, replacement);

fs.writeFileSync('src/AnalyticsView.tsx', code);
