const fs = require('fs');
let code = fs.readFileSync('src/AdminPanel.tsx', 'utf8');

code = code.replace(/          aiModelText: fd\.get\("cap_aiModelText"\),/g, `          aiModelText: fd.get("cap_aiModelText"),
          allowedModels: [
            fd.get("cap_model_gemini-3.1-flash-lite") === "on" ? "gemini-3.1-flash-lite" : null,
            fd.get("cap_model_gemini-3.5-flash-lite") === "on" ? "gemini-3.5-flash-lite" : null,
            fd.get("cap_model_gemini-3.5-flash") === "on" ? "gemini-3.5-flash" : null,
            fd.get("cap_model_gemini-3.6-flash") === "on" ? "gemini-3.6-flash" : null,
            fd.get("cap_model_gemini-3.1-pro") === "on" ? "gemini-3.1-pro" : null
          ].filter(Boolean),`);

code = code.replace(/                           <label style=\{\{display:"flex", alignItems:"center", gap:8, fontSize:13, fontWeight:600\}\}>\n                             Model AI Gemini:\n                             <input type="text" name="cap_aiModelText" defaultValue=\{editingPlan\.capabilities\?\.aiModelText \|\| "3\.1 Flash"\} style=\{\{padding:"6px", borderRadius:"6px", border:"1px solid #ccc", width:"120px"\}\} \/>\n                           <\/label>/g, `                           <label style={{display:"flex", alignItems:"center", gap:8, fontSize:13, fontWeight:600}}>
                             Teks Model AI Gemini (Pricing):
                             <input type="text" name="cap_aiModelText" defaultValue={editingPlan.capabilities?.aiModelText || "3.1 Flash"} style={{padding:"6px", borderRadius:"6px", border:"1px solid #ccc", width:"120px"}} />
                           </label>
                           <div style={{display: "flex", flexDirection: "column", gap: 6, paddingLeft: 12, borderLeft: "2px solid #E5E7EB", marginTop: 4}}>
                              <span style={{fontSize: 11, fontWeight: 700, color: "rgba(17,24,39,0.5)"}}>Akses Model AI (Hub.AI):</span>
                              <label style={{display:"flex", alignItems:"center", gap:8, fontSize:12, fontWeight:500}}><input type="checkbox" name="cap_model_gemini-3.1-flash-lite" defaultChecked={editingPlan.capabilities?.allowedModels?.includes("gemini-3.1-flash-lite") ?? false} /> Gemini 3.1 Flash Lite</label>
                              <label style={{display:"flex", alignItems:"center", gap:8, fontSize:12, fontWeight:500}}><input type="checkbox" name="cap_model_gemini-3.5-flash-lite" defaultChecked={editingPlan.capabilities?.allowedModels?.includes("gemini-3.5-flash-lite") ?? false} /> Gemini 3.5 Flash Lite</label>
                              <label style={{display:"flex", alignItems:"center", gap:8, fontSize:12, fontWeight:500}}><input type="checkbox" name="cap_model_gemini-3.5-flash" defaultChecked={editingPlan.capabilities?.allowedModels?.includes("gemini-3.5-flash") ?? false} /> Gemini 3.5 Flash</label>
                              <label style={{display:"flex", alignItems:"center", gap:8, fontSize:12, fontWeight:500}}><input type="checkbox" name="cap_model_gemini-3.6-flash" defaultChecked={editingPlan.capabilities?.allowedModels?.includes("gemini-3.6-flash") ?? false} /> Gemini 3.6 Flash</label>
                              <label style={{display:"flex", alignItems:"center", gap:8, fontSize:12, fontWeight:500}}><input type="checkbox" name="cap_model_gemini-3.1-pro" defaultChecked={editingPlan.capabilities?.allowedModels?.includes("gemini-3.1-pro") ?? false} /> Gemini 3.1 Pro</label>
                           </div>`);

fs.writeFileSync('src/AdminPanel.tsx', code);
