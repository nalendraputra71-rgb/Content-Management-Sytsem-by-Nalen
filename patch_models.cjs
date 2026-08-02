const fs = require('fs');

// 1. server.ts
let serverCode = fs.readFileSync('server.ts', 'utf8');
const mapLogic = `
    let actualModel = model;
    if (actualModel === "gemini-3.1-pro") actualModel = "gemini-3.1-pro-preview";
    if (actualModel === "gemini-3.5-flash-lite") actualModel = "gemini-3.1-flash-lite"; 
    // we let gemini-3.5-flash be gemini-3.6-flash to be safe and use latest
    if (actualModel === "gemini-3.5-flash") actualModel = "gemini-3.6-flash";
`;
serverCode = serverCode.replace(mapLogic, '');
serverCode = serverCode.replace(/model: actualModel,/g, 'model: model,');
fs.writeFileSync('server.ts', serverCode);

// 2. HubAiTab.tsx
let hubCode = fs.readFileSync('src/HubAiTab.tsx', 'utf8');
hubCode = hubCode.replace(
`       const allModels = [
         { value: "gemini-3.1-flash-lite", label: "Gemini 3.1 Flash Lite (1x)" },
         { value: "gemini-3.5-flash-lite", label: "Gemini 3.5 Flash Lite (2x)" },
         { value: "gemini-3.5-flash", label: "Gemini 3.5 Flash (5x)" },
         { value: "gemini-3.6-flash", label: "Gemini 3.6 Flash (10x)" },
         { value: "gemini-3.1-pro", label: "Gemini 3.1 Pro (25x)" }
       ];`,
`       const allModels = [
         { value: "gemini-3.1-flash-lite", label: "Gemini 3.1 Flash Lite (1x)" },
         { value: "gemini-3.5-flash", label: "Gemini 3.5 Flash (5x)" },
         { value: "gemini-3.1-pro-preview", label: "Gemini 3.1 Pro Preview (25x)" }
       ];`
);
fs.writeFileSync('src/HubAiTab.tsx', hubCode);

// 3. AdminPanel.tsx
let adminCode = fs.readFileSync('src/AdminPanel.tsx', 'utf8');
adminCode = adminCode.replace(
`          allowedModels: [
            fd.get("cap_model_gemini-3.1-flash-lite") === "on" ? "gemini-3.1-flash-lite" : null,
            fd.get("cap_model_gemini-3.5-flash-lite") === "on" ? "gemini-3.5-flash-lite" : null,
            fd.get("cap_model_gemini-3.5-flash") === "on" ? "gemini-3.5-flash" : null,
            fd.get("cap_model_gemini-3.6-flash") === "on" ? "gemini-3.6-flash" : null,
            fd.get("cap_model_gemini-3.1-pro") === "on" ? "gemini-3.1-pro" : null
          ].filter(Boolean),`,
`          allowedModels: [
            fd.get("cap_model_gemini-3.1-flash-lite") === "on" ? "gemini-3.1-flash-lite" : null,
            fd.get("cap_model_gemini-3.5-flash") === "on" ? "gemini-3.5-flash" : null,
            fd.get("cap_model_gemini-3.1-pro-preview") === "on" ? "gemini-3.1-pro-preview" : null
          ].filter(Boolean),`
);
adminCode = adminCode.replace(
`                              <label style={{display:"flex", alignItems:"center", gap:8, fontSize:12, fontWeight:500}}><input type="checkbox" name="cap_model_gemini-3.1-flash-lite" defaultChecked={editingPlan.capabilities?.allowedModels?.includes("gemini-3.1-flash-lite") ?? false} /> Gemini 3.1 Flash Lite</label>
                              <label style={{display:"flex", alignItems:"center", gap:8, fontSize:12, fontWeight:500}}><input type="checkbox" name="cap_model_gemini-3.5-flash-lite" defaultChecked={editingPlan.capabilities?.allowedModels?.includes("gemini-3.5-flash-lite") ?? false} /> Gemini 3.5 Flash Lite</label>
                              <label style={{display:"flex", alignItems:"center", gap:8, fontSize:12, fontWeight:500}}><input type="checkbox" name="cap_model_gemini-3.5-flash" defaultChecked={editingPlan.capabilities?.allowedModels?.includes("gemini-3.5-flash") ?? false} /> Gemini 3.5 Flash</label>
                              <label style={{display:"flex", alignItems:"center", gap:8, fontSize:12, fontWeight:500}}><input type="checkbox" name="cap_model_gemini-3.6-flash" defaultChecked={editingPlan.capabilities?.allowedModels?.includes("gemini-3.6-flash") ?? false} /> Gemini 3.6 Flash</label>
                              <label style={{display:"flex", alignItems:"center", gap:8, fontSize:12, fontWeight:500}}><input type="checkbox" name="cap_model_gemini-3.1-pro" defaultChecked={editingPlan.capabilities?.allowedModels?.includes("gemini-3.1-pro") ?? false} /> Gemini 3.1 Pro</label>`,
`                              <label style={{display:"flex", alignItems:"center", gap:8, fontSize:12, fontWeight:500}}><input type="checkbox" name="cap_model_gemini-3.1-flash-lite" defaultChecked={editingPlan.capabilities?.allowedModels?.includes("gemini-3.1-flash-lite") ?? false} /> Gemini 3.1 Flash Lite</label>
                              <label style={{display:"flex", alignItems:"center", gap:8, fontSize:12, fontWeight:500}}><input type="checkbox" name="cap_model_gemini-3.5-flash" defaultChecked={editingPlan.capabilities?.allowedModels?.includes("gemini-3.5-flash") ?? false} /> Gemini 3.5 Flash</label>
                              <label style={{display:"flex", alignItems:"center", gap:8, fontSize:12, fontWeight:500}}><input type="checkbox" name="cap_model_gemini-3.1-pro-preview" defaultChecked={editingPlan.capabilities?.allowedModels?.includes("gemini-3.1-pro-preview") ?? false} /> Gemini 3.1 Pro Preview</label>`
);
fs.writeFileSync('src/AdminPanel.tsx', adminCode);

// 4. firebase.ts
let fbCode = fs.readFileSync('src/firebase.ts', 'utf8');
fbCode = fbCode.replace(
`    if (model.includes("gemini-3.1-flash-lite")) multiplier = 1;
    else if (model.includes("gemini-3.5-flash-lite")) multiplier = 2;
    else if (model.includes("gemini-3.6-flash")) multiplier = 10;
    else if (model.includes("gemini-3.1-pro")) multiplier = 25;`,
`    if (model.includes("gemini-3.1-flash-lite")) multiplier = 1;
    else if (model.includes("gemini-3.5-flash")) multiplier = 5;
    else if (model.includes("gemini-3.1-pro")) multiplier = 25;`
);
fs.writeFileSync('src/firebase.ts', fbCode);

console.log('All models patched to Opsi B');
