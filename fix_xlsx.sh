# Fix src/data.tsx
sed -i '/import \* as XLSX from "xlsx";/d' src/data.tsx

# Fix src/App.tsx
sed -i '/import \* as XLSX from "xlsx";/d' src/App.tsx
sed -i 's|const ws = XLSX.utils.json_to_sheet(exportData);|import("xlsx").then((XLSX) => {\n                const ws = XLSX.utils.json_to_sheet(exportData);|g' src/App.tsx
sed -i 's|setExportModal(false);|setExportModal(false);\n             });|g' src/App.tsx

# Fix src/CsvModal.tsx
sed -i '/import \* as XLSX from "xlsx";/d' src/CsvModal.tsx

