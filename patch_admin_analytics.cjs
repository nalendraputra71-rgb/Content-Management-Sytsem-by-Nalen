const fs = require('fs');
let code = fs.readFileSync('src/AdminPanel.tsx', 'utf8');

const replacement = `                          <h5 style={{margin:0, fontSize:12, color:"#2563EB", textTransform:"uppercase", fontWeight:800}}>Analitik & Pelaporan</h5>
                          <label style={{display:"flex", alignItems:"center", gap:8, fontSize:13, fontWeight:600}}><input type="checkbox" name="cap_analytics" defaultChecked={editingPlan.capabilities?.analytics ?? false} /> Akses Menu Analitik</label>`;

code = code.replace(/                          <h5 style=\{\{margin:0, fontSize:12, color:"#2563EB", textTransform:"uppercase", fontWeight:800\}\}>Analitik & Pelaporan<\/h5>/, replacement);

const formReplacement = `          analytics: fd.get("cap_analytics") === "on",
          platformAnalytics: fd.get("cap_platformAnalytics") === "on",`;

code = code.replace(/          platformAnalytics: fd\.get\("cap_platformAnalytics"\) === "on",/, formReplacement);

fs.writeFileSync('src/AdminPanel.tsx', code);
