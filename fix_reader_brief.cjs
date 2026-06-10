const fs = require('fs');
let s = fs.readFileSync('src/ContentModal.tsx', 'utf8');

const regex = /(\{\/\* Item 2: Objective \*\/\})[\s\S]*?(?=<\/div>\n\n              <\/>\n                \)\}\n                \{activeTab === "refs")/m;

const match = s.match(regex);
if (!match) {
    console.log("Could not find reader mode block");
} else {
    // Generate the replacement
    const replacement = `{/* Item 2: Objective (Landscape) */}
              <div style={{
                display: "grid",
                gridTemplateColumns: layoutMode === "drawer" ? "1fr" : "1fr 1fr",
                gap: "16px",
                width: "100%",
                alignItems: "stretch"
              }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div 
                    onDoubleClick={(e) => { e.stopPropagation(); setIsReaderMode(false); setFocusTarget("objective"); }}
                    style={{ background: "rgba(255, 255, 255, 0.5)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: "1px solid rgba(255, 255, 255, 0.7)", borderRadius: 16, padding: "16px 20px", boxShadow: "0 8px 32px rgba(0, 0, 0, 0.04)", cursor: "text" }}
                    title="Klik ganda untuk mengedit Objective"
                  >
                    <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(44,32,22,0.4)", textTransform: "uppercase", marginBottom: 6, letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: 6 }}>
                      <Target size={14} /> Objective Konten
                    </div>
                    <div style={{ fontSize: 13, color: "#2C2016", lineHeight: 1.5, background: "rgba(44,32,22,0.02)", padding: "12px 16px", borderRadius: 10 }}>
                      {d.objective ? <div className="tiptap-prose" dangerouslySetInnerHTML={{ __html: d.objective }} /> : <span style={{ color: "rgba(44,32,22,0.4)", fontStyle: "italic" }}>Tidak ada spesifikasi objective khusus.</span>}
                    </div>
                  </div>

                  <div 
                    onDoubleClick={(e) => { e.stopPropagation(); setIsReaderMode(false); setFocusTarget("brief"); }}
                    style={{ background: "rgba(255, 255, 255, 0.5)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: "1px solid rgba(255, 255, 255, 0.7)", borderRadius: 16, padding: "16px 20px", boxShadow: "0 8px 32px rgba(0, 0, 0, 0.04)", cursor: "text", flex: 1, display: "flex", flexDirection: "column" }}
                    title="Klik ganda untuk mengedit Brief"
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(44,32,22,0.4)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6, letterSpacing: "0.5px" }}>
                        <FileText size={14} /> Arahan Kreatif & Brief Konten
                      </span>
                      {d.briefCopywriting && (
                        <button onClick={() => { if (copiedBrief) return; navigator.clipboard.writeText(htmlToPlainText(d.briefCopywriting)); setCopiedBrief(true); setTimeout(() => setCopiedBrief(false), 2000); }} style={{ background: copiedBrief ? "rgba(46,125,50,0.1)" : "rgba(59,130,246,0.08)", border: "none", color: copiedBrief ? "#2E7D32" : "#3B82F6", padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 750, cursor: copiedBrief ? "default" : "pointer", display: "flex", alignItems: "center", transition: "all 0.3s ease" }}>
                          {copiedBrief ? <>Berhasil disalin</> : <><Copy size={12} style={{marginRight: 4}} /> Salin Brief</>}
                        </button>
                      )}
                    </div>
                    <div style={{ fontSize: 13, color: "#2C2016", lineHeight: 1.5, background: "#FCFAF7", padding: "12px 16px", borderRadius: 10, border: "1px solid rgba(44,32,22,0.03)", flex: 1, height: "100%" }}>
                      {d.briefCopywriting ? <div className="tiptap-prose" dangerouslySetInnerHTML={{ __html: d.briefCopywriting }} /> : <span style={{ color: "rgba(44,32,22,0.4)", fontStyle: "italic" }}>Belum ada brief konten yang ditambahkan...</span>}
                    </div>
                  </div>
                </div>

                <div 
                  onDoubleClick={(e) => { e.stopPropagation(); setIsReaderMode(false); setFocusTarget("caption"); }}
                  style={{ background: "rgba(255, 255, 255, 0.5)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: "1px solid rgba(255, 255, 255, 0.7)", borderRadius: 16, padding: "16px 20px", boxShadow: "0 8px 32px rgba(0, 0, 0, 0.04)", cursor: "text", height: "100%", display: "flex", flexDirection: "column" }}
                  title="Klik ganda untuk mengedit Caption"
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(44,32,22,0.4)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6, letterSpacing: "0.5px" }}>
                      <PenTool size={14} /> Salinan Caption Posting
                    </span>
                    {d.caption && (
                      <button onClick={() => { if (copiedCaption) return; navigator.clipboard.writeText(htmlToPlainText(d.caption)); setCopiedCaption(true); setTimeout(() => setCopiedCaption(false), 2000); }} style={{ background: copiedCaption ? "rgba(46,125,50,0.1)" : "rgba(59,130,246,0.08)", border: "none", color: copiedCaption ? "#2E7D32" : "#3B82F6", padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 750, cursor: copiedCaption ? "default" : "pointer", display: "flex", alignItems: "center", transition: "all 0.3s ease" }}>
                        {copiedCaption ? <>Berhasil disalin</> : <><Copy size={12} style={{marginRight: 4}} /> Salin Caption</>}
                      </button>
                    )}
                  </div>
                  <div style={{ fontSize: 13, color: "#2C2016", lineHeight: 1.5, background: "#FAFDFB", padding: "12px 16px", borderRadius: 10, border: "1px solid rgba(44,32,22,0.03)", flex: 1, height: "100%" }}>
                    {d.caption ? <div className="tiptap-prose" dangerouslySetInnerHTML={{ __html: d.caption }} /> : <span style={{ color: "rgba(44,32,22,0.4)", fontStyle: "italic" }}>Belum ada salinan caption. Silakan tambahkan.</span>}
                  </div>
                </div>
              </div>\n              `;
    
    s = s.replace(match[0], replacement);
    fs.writeFileSync('src/ContentModal.tsx', s);
    console.log("Replaced Reader Mode block 5");
}
