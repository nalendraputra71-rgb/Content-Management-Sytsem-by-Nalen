const fs = require('fs');
let code = fs.readFileSync('src/HubAiTab.tsx', 'utf8');

// Replace the hardcoded <select> options with a mapped array
const selectRegex = /<select[\s\S]*?value=\{selectedAiModel\}[\s\S]*?onChange=\{\(e\) => setSelectedAiModel\(e\.target\.value\)\}[\s\S]*?>[\s\S]*?<\/select>/;

const newSelect = `<select
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

code = code.replace(selectRegex, newSelect);
fs.writeFileSync('src/HubAiTab.tsx', code);
console.log("Updated model select in HubAiTab");
