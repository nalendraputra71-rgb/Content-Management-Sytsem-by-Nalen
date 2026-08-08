const fs = require('fs');
let code = fs.readFileSync('src/AdminPanel.tsx', 'utf8');

// 1. Add state for dynamic features in the Modal
code = code.replace(/const \[editingPlan, setEditingPlan\] = useState<any>\(null\);/, `const [editingPlan, setEditingPlan] = useState<any>(null);
  const [editingFeatures, setEditingFeatures] = useState<string[]>([]);`);

// 2. When opening the modal, set editingFeatures
code = code.replace(/setEditingPlan\(p\); setShowPlanModal\(true\);/g, `setEditingPlan(p); setEditingFeatures(p.features || []); setShowPlanModal(true);`);
code = code.replace(/setEditingPlan\({}\); setShowPlanModal\(true\);/g, `setEditingPlan({}); setEditingFeatures([]); setShowPlanModal(true);`);

// 3. Update savePlan to use editingFeatures
code = code.replace(/features: editingPlan\?\.features \|\| \[\],/g, `features: editingFeatures,`);

// 4. Add the UI for editing features inside "Informasi Umum"
const featuresUI = `
                      <div style={{marginTop: 16}}>
                        <label style={{display:"block", fontSize:11, fontWeight:800, color:"rgba(17,24,39,0.4)", textTransform:"uppercase", marginBottom:6, letterSpacing: "0.5px"}}>Isi Plan (Fitur / Bullet Points)</label>
                        <div style={{display:"flex", flexDirection:"column", gap:8}}>
                          {editingFeatures.map((feat, idx) => (
                            <div key={idx} style={{display:"flex", gap:8}}>
                              <input 
                                value={feat} 
                                onChange={(e) => {
                                  const newF = [...editingFeatures];
                                  newF[idx] = e.target.value;
                                  setEditingFeatures(newF);
                                }}
                                placeholder="Misal: 100x Generate AI"
                                style={{flex:1, padding:"10px 14px", borderRadius:12, border:"1px solid rgba(0,0,0,0.08)", background: "rgba(0,0,0,0.02)", fontSize:14}}
                              />
                              <button type="button" onClick={() => {
                                setEditingFeatures(editingFeatures.filter((_, i) => i !== idx));
                              }} style={{background:"rgba(239,68,68,0.1)", color:"#EF4444", border:"none", padding:"10px", borderRadius:12, cursor:"pointer"}}>X</button>
                            </div>
                          ))}
                          <button type="button" onClick={() => setEditingFeatures([...editingFeatures, ""])} style={{padding:"10px", borderRadius:12, border:"1px dashed rgba(0,0,0,0.2)", background:"transparent", cursor:"pointer", fontSize:13, fontWeight:600, color:"#111827", marginTop: 4}}>+ Tambah Fitur / Bullet Point</button>
                        </div>
                      </div>
`;
code = code.replace(/<div style={{fontSize:11, color:"rgba(17,24,39,0.4)", marginTop:4}}>Keterangan singkat yang muncul di card halaman pricing.<\/div>\s*<\/div>/, `<div style={{fontSize:11, color:"rgba(17,24,39,0.4)", marginTop:4}}>Keterangan singkat yang muncul di card halaman pricing.</div>
                      </div>
${featuresUI}`);

fs.writeFileSync('src/AdminPanel.tsx', code);
