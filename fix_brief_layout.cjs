const fs = require('fs');
let s = fs.readFileSync('src/ContentModal.tsx', 'utf8');

const editModeBlock5Regex = /\{\/\* Block 5: Objective, Brief & Caption \*\/\}[\s\S]*?(?=\{\/\* Block 6: Asset Link & Social Media Link \*\/\}|<\/\>\n                \)\}\n                \{activeTab === "refs")/m;

const editMatch = s.match(editModeBlock5Regex);
if (!editMatch) {
   console.log("Could not find edit mode block 5");
} else {
   const newEditBlock = `{/* Block 5: Objective, Brief & Caption (Landscape Layout) */}
              <div style={{
                display: "grid",
                gridTemplateColumns: layoutMode === "drawer" ? "1fr" : "1fr 1fr",
                gap: "16px",
                width: "100%",
                alignItems: "stretch"
              }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ background: "rgba(255, 255, 255, 0.5)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: "1px solid rgba(255, 255, 255, 0.7)", borderRadius: 16, padding: "16px 20px", boxShadow: "0 8px 32px rgba(0, 0, 0, 0.04)"}}>
                    <div style={GRP}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(44,32,22,0.6)", display: "flex", alignItems: "center", gap: 6, margin: 0 }}>
                        <Target size={14} /> Objective Konten
                      </label>
                      <RichTextEditor inputRef={objectiveRef} value={d.objective} onChange={(val)=>set("objective",val)} minRows={2} placeholder="Tujuan atau target output dari konten ini..."/>
                    </div>
                  </div>

                  <div style={{ background: "rgba(255, 255, 255, 0.5)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: "1px solid rgba(255, 255, 255, 0.7)", borderRadius: 16, padding: "16px 20px", boxShadow: "0 8px 32px rgba(0, 0, 0, 0.04)", flex: 1, display: "flex", flexDirection: "column" }}>
                    <div style={{...GRP, flex: 1, display: "flex", flexDirection: "column"}}>
                        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                            <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(44,32,22,0.6)", display: "flex", alignItems: "center", gap: 6, margin: 0 }}>
                              <FileText size={14} /> Brief Konten
                            </label>
                            <button onClick={analyzeContent} disabled={aiLoading} 
                              style={{...B(false), fontSize:10, padding:"4px 10px", borderRadius: 8, background:"#f3f4f6", color:"#1f2937", border:"1px solid #d1d5db", display:"flex", alignItems:"center", gap:4}}>
                              <GeminiIcon size={12} />
                              {aiLoading ? <LoadingDots /> : "Analyze with Gemini"}
                            </button>
                        </div>
                        <div style={{flex: 1, display: "flex", flexDirection: "column", minHeight: 150}}>
                          <RichTextEditor style={{flex: 1}} inputRef={briefRef} value={d.briefCopywriting} onChange={(val)=>set("briefCopywriting",val)} minRows={8} placeholder="Arah konten, tone of voice, call to action, poin kata kunci utama..."/>
                        </div>
                    </div>
                  </div>
                </div>

                <div style={{ background: "rgba(255, 255, 255, 0.5)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: "1px solid rgba(255, 255, 255, 0.7)", borderRadius: 16, padding: "16px 20px", boxShadow: "0 8px 32px rgba(0, 0, 0, 0.04)", display: "flex", flexDirection: "column" }}>
                  <div style={{...GRP, flex: 1, display: "flex", flexDirection: "column"}}>
                      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                          <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(44,32,22,0.6)", display: "flex", alignItems: "center", gap: 6, margin: 0 }}>
                            <PenTool size={14} /> Salinan Caption
                          </label>
                          <button onClick={generateCaption} disabled={captionLoading} 
                            style={{...B(false), fontSize:10, padding:"4px 10px", borderRadius: 8, background:"#f3f4f6", color:"#1f2937", border:"1px solid #d1d5db", display:"flex", alignItems:"center", gap:4}}>
                            <GeminiIcon size={12} />
                            {captionLoading ? <LoadingDots /> : "Generate Caption"}
                          </button>
                      </div>
                      <div style={{flex: 1, display: "flex", flexDirection: "column", minHeight: 250}}>
                        <RichTextEditor style={{flex: 1}} inputRef={captionRef} value={d.caption} onChange={(val)=>set("caption",val)} minRows={12} placeholder="Salinan caption social media yang sudah siap diposting..."/>
                      </div>
                  </div>
                </div>
              </div>\n`;
   s = s.replace(editMatch[0], newEditBlock);
   console.log("Replaced Edit Mode block 5");
}

fs.writeFileSync('src/ContentModal.tsx', s);
