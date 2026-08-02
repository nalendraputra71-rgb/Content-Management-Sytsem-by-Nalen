const fs = require('fs');
let code = fs.readFileSync('src/AdminPanel.tsx', 'utf8');

// We will replace the CAPABILITIES TAB with all the checkboxes and inputs needed for the spreadsheet
const capabilitiesReplacement = `
                   {/* 4. CAPABILITIES TAB */}
                   <div style={{display: modalPlanTab === "capabilities" ? "flex" : "none", flexDirection: "column", gap: 16}}>
                      <div style={{marginBottom: 4}}>
                        <h4 style={{margin: 0, fontSize: 14, fontWeight: 800, color: "#111827"}}>Layanan & Fitur Premium</h4>
                        <p style={{margin: "4px 0 0 0", fontSize: 12, color: "rgba(17,24,39,0.4)"}}>Centang fitur yang tersedia untuk paket ini.</p>
                      </div>

                      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:16}}>
                        {/* Kalender & Brief Konten */}
                        <div style={{display:"flex", flexDirection:"column", gap:12}}>
                          <h5 style={{margin:0, fontSize:12, color:"#2563EB", textTransform:"uppercase", fontWeight:800}}>Kalender & Brief</h5>
                          <label style={{display:"flex", alignItems:"center", gap:8, fontSize:13, fontWeight:600}}><input type="checkbox" name="cap_publicLink" defaultChecked={editingPlan.capabilities?.publicLink ?? false} /> Public / Shared Brief Link</label>
                          <label style={{display:"flex", alignItems:"center", gap:8, fontSize:13, fontWeight:600}}><input type="checkbox" name="cap_customColumn" defaultChecked={editingPlan.capabilities?.customColumn ?? false} /> Kustom Kolom Brief</label>
                          <label style={{display:"flex", alignItems:"center", gap:8, fontSize:13, fontWeight:600}}><input type="checkbox" name="cap_organicPaid" defaultChecked={editingPlan.capabilities?.organicPaid ?? false} /> Pemisah Data Organik/Paid</label>
                          <label style={{display:"flex", alignItems:"center", gap:8, fontSize:13, fontWeight:600}}><input type="checkbox" name="cap_csvImportExport" defaultChecked={editingPlan.capabilities?.csvImportExport ?? false} /> Bulk Import & Export CSV/XLSX</label>
                          <label style={{display:"flex", alignItems:"center", gap:8, fontSize:13, fontWeight:600}}><input type="checkbox" name="cap_autoPublishing" defaultChecked={editingPlan.capabilities?.autoPublishing ?? false} /> Penjadwalan Otomatis (Segera)</label>
                        </div>

                        {/* Analitik & Pelaporan */}
                        <div style={{display:"flex", flexDirection:"column", gap:12}}>
                          <h5 style={{margin:0, fontSize:12, color:"#2563EB", textTransform:"uppercase", fontWeight:800}}>Analitik & Pelaporan</h5>
                          <label style={{display:"flex", alignItems:"center", gap:8, fontSize:13, fontWeight:600}}><input type="checkbox" name="cap_platformAnalytics" defaultChecked={editingPlan.capabilities?.platformAnalytics ?? false} /> Analitik Per Platform</label>
                          <label style={{display:"flex", alignItems:"center", gap:8, fontSize:13, fontWeight:600}}><input type="checkbox" name="cap_heatmaps" defaultChecked={editingPlan.capabilities?.heatmaps ?? false} /> Grafik & Heatmap Aktivitas</label>
                          <label style={{display:"flex", alignItems:"center", gap:8, fontSize:13, fontWeight:600}}><input type="checkbox" name="cap_aiSummary" defaultChecked={editingPlan.capabilities?.aiSummary ?? false} /> Rangkuman AI Otomatis</label>
                          <label style={{display:"flex", alignItems:"center", gap:8, fontSize:13, fontWeight:600}}><input type="checkbox" name="cap_topBadAnalysis" defaultChecked={editingPlan.capabilities?.topBadAnalysis ?? false} /> Analisis Top & Bad Content</label>
                          <label style={{display:"flex", alignItems:"center", gap:8, fontSize:13, fontWeight:600}}><input type="checkbox" name="cap_demographics" defaultChecked={editingPlan.capabilities?.demographics ?? false} /> Data Demografi Per Platform</label>
                          <label style={{display:"flex", alignItems:"center", gap:8, fontSize:13, fontWeight:600}}><input type="checkbox" name="cap_pdfExport" defaultChecked={editingPlan.capabilities?.pdfExport ?? false} /> Export Laporan PDF</label>
                        </div>
                      </div>

                      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginTop:8}}>
                        {/* Dashboard & AI */}
                        <div style={{display:"flex", flexDirection:"column", gap:12}}>
                           <h5 style={{margin:0, fontSize:12, color:"#2563EB", textTransform:"uppercase", fontWeight:800}}>Hub.AI Assistant</h5>
                           <label style={{display:"flex", alignItems:"center", gap:8, fontSize:13, fontWeight:600}}><input type="checkbox" name="cap_aiAutoSave" defaultChecked={editingPlan.capabilities?.aiAutoSave ?? false} /> Auto-Save Chat ke Brief</label>
                           <label style={{display:"flex", alignItems:"center", gap:8, fontSize:13, fontWeight:600}}>
                             Model AI Gemini:
                             <input type="text" name="cap_aiModelText" defaultValue={editingPlan.capabilities?.aiModelText || "3.1 Flash"} style={{padding:"6px", borderRadius:"6px", border:"1px solid #ccc", width:"120px"}} />
                           </label>
                           <label style={{display:"flex", alignItems:"center", gap:8, fontSize:13, fontWeight:600}}>
                             Batas Generate AI / Bulan:
                             <input type="text" name="cap_aiUsageText" defaultValue={editingPlan.capabilities?.aiUsageText || "Terbatas"} style={{padding:"6px", borderRadius:"6px", border:"1px solid #ccc", width:"120px"}} />
                           </label>
                        </div>
                        
                        {/* Limits Extensions */}
                        <div style={{display:"flex", flexDirection:"column", gap:12}}>
                           <h5 style={{margin:0, fontSize:12, color:"#2563EB", textTransform:"uppercase", fontWeight:800}}>Limit Spesifik</h5>
                           <label style={{display:"block", fontSize:13, fontWeight:600}}>
                             Riwayat Edit Brief (Hari):
                             <input type="number" name="cap_historyDays" defaultValue={editingPlan.capabilities?.historyDays ?? 0} placeholder="0 untuk tidak ada" style={{display:"block", marginTop:4, padding:"6px", borderRadius:"6px", border:"1px solid #ccc", width:"100%"}} />
                           </label>
                           <label style={{display:"block", fontSize:13, fontWeight:600}}>
                             Brief Konten Bersama:
                             <input type="number" name="cap_sharedBriefs" defaultValue={editingPlan.capabilities?.sharedBriefs ?? 20} placeholder="-1 untuk Unlimited" style={{display:"block", marginTop:4, padding:"6px", borderRadius:"6px", border:"1px solid #ccc", width:"100%"}} />
                           </label>
                        </div>
                      </div>
`;

code = code.replace(/\{\/\* 4\. CAPABILITIES TAB \*\/\}(.|\n)*?(?=<\/div>\n\s*<\/div>\n\s*\{\/\* Modal Sticky Footer \*\/)/g, capabilitiesReplacement);

// Also need to parse these capabilities in savePlan
const savePlanReplacement = `
       const limits = {
          workspaces: Number(fd.get("workspaces")),
          socialAccounts: Number(fd.get("socialAccounts")),
          teamMembers: Number(fd.get("teamMembers")),
          aiCreditsPerMonth: Number(fd.get("aiCreditsPerMonth")),
          storageMB: Number(fd.get("storageMB"))
       };
       
       const capabilities = {
          publicLink: fd.get("cap_publicLink") === "on",
          customColumn: fd.get("cap_customColumn") === "on",
          organicPaid: fd.get("cap_organicPaid") === "on",
          csvImportExport: fd.get("cap_csvImportExport") === "on",
          autoPublishing: fd.get("cap_autoPublishing") === "on",
          platformAnalytics: fd.get("cap_platformAnalytics") === "on",
          heatmaps: fd.get("cap_heatmaps") === "on",
          aiSummary: fd.get("cap_aiSummary") === "on",
          topBadAnalysis: fd.get("cap_topBadAnalysis") === "on",
          demographics: fd.get("cap_demographics") === "on",
          pdfExport: fd.get("cap_pdfExport") === "on",
          aiAutoSave: fd.get("cap_aiAutoSave") === "on",
          aiModelText: fd.get("cap_aiModelText"),
          aiUsageText: fd.get("cap_aiUsageText"),
          historyDays: Number(fd.get("cap_historyDays")),
          sharedBriefs: Number(fd.get("cap_sharedBriefs"))
       };
`;

code = code.replace(/const limits = \{(.|\n)*?supportLevel: fd\.get\("supportLevel"\)\n       \};/g, savePlanReplacement);

fs.writeFileSync('src/AdminPanel.tsx', code);
