const fs = require('fs');
let code = fs.readFileSync('src/HubAiTab.tsx', 'utf8');

code = code.replace(/  <select\n    value=\{selectedAiModel\}\n    onChange=\{\(e\) => setSelectedAiModel\(e\.target\.value\)\}\n    style=\{\{\n      background: "rgba\\(27,127,220,0\.05\\)",\n      border: "1px solid rgba\\(27,127,220,0\.2\\)",\n      borderRadius: 14,\n      padding: "4px 8px",\n      fontSize: 10,\n      fontWeight: 600,\n      color: "#1B7FDC",\n      outline: "none",\n      cursor: "pointer",\n    \}\}\n  >\n    <option value="gemini-3.1-flash-lite">Gemini 3\.1 Flash Lite \\(1x\\)<\/option>\n    <option value="gemini-3.5-flash-lite">Gemini 3\.5 Flash Lite \\(2x\\)<\/option>\n    <option value="gemini-3.5-flash">Gemini 3\.5 Flash \\(5x\\)<\/option>\n    <option value="gemini-3.6-flash">Gemini 3\.6 Flash \\(10x\\)<\/option>\n    <option value="gemini-3.1-pro">Gemini 3\.1 Pro \\(25x\\)<\/option>\n  <\/select>/, `  <select
    value={selectedAiModel}
    onChange={(e) => setSelectedAiModel(e.target.value)}
    style={{
      background: "rgba(27,127,220,0.05)",
      border: "1px solid rgba(27,127,220,0.2)",
      borderRadius: 14,
      padding: "4px 8px",
      fontSize: 10,
      fontWeight: 600,
      color: "#1B7FDC",
      outline: "none",
      cursor: "pointer",
    }}
  >
    {(() => {
       const allModels = [
         { value: "gemini-3.1-flash-lite", label: "Gemini 3.1 Flash Lite (1x)" },
         { value: "gemini-3.5-flash-lite", label: "Gemini 3.5 Flash Lite (2x)" },
         { value: "gemini-3.5-flash", label: "Gemini 3.5 Flash (5x)" },
         { value: "gemini-3.6-flash", label: "Gemini 3.6 Flash (10x)" },
         { value: "gemini-3.1-pro", label: "Gemini 3.1 Pro (25x)" }
       ];
       const allowedModels = ctx.planDetails?.capabilities?.allowedModels || ["gemini-3.5-flash"];
       const visibleModels = allModels.filter(m => allowedModels.includes(m.value));
       if (visibleModels.length === 0) visibleModels.push(allModels[2]); // fallback to 3.5-flash
       return visibleModels.map(m => <option key={m.value} value={m.value}>{m.label}</option>);
    })()}
  </select>`);

fs.writeFileSync('src/HubAiTab.tsx', code);
