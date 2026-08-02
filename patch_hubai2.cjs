const fs = require('fs');
let code = fs.readFileSync('src/HubAiTab.tsx', 'utf8');

const target = `<select
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
    <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite (1x)</option>
    <option value="gemini-3.5-flash-lite">Gemini 3.5 Flash Lite (2x)</option>
    <option value="gemini-3.5-flash">Gemini 3.5 Flash (5x)</option>
    <option value="gemini-3.6-flash">Gemini 3.6 Flash (10x)</option>
    <option value="gemini-3.1-pro">Gemini 3.1 Pro (25x)</option>
  </select>`;

const replacement = `<select
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
       if (visibleModels.length === 0) visibleModels.push(allModels[2]);
       return visibleModels.map(m => <option key={m.value} value={m.value}>{m.label}</option>);
    })()}
  </select>`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/HubAiTab.tsx', code);
  console.log("Replaced successfully!");
} else {
  console.log("Target not found!");
}
