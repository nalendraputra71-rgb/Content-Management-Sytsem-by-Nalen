const fs = require('fs');
let code = fs.readFileSync('src/AdminPanel.tsx', 'utf8');

const updatedPromoModalFooter = `               {/* Promo Modal Sticky Footer */}
               <div style={{display:"flex", justifyContent: "flex-end", gap:12, padding: "16px 24px", background: "rgba(0,0,0,0.015)", borderTop: "1px solid rgba(0,0,0,0.03)", flexShrink: 0}}>
                 <button type="button" onClick={()=>setShowPromoModal(false)} style={{background:"transparent", border:"1px solid rgba(0,0,0,0.08)", color: "#111827", padding:"10px 20px", borderRadius:12, fontSize:13, fontWeight:700, cursor:"pointer", transition: "all 0.2s"}} className="hover-bg-light">Batal</button>
                 <button type="submit" style={{background:"var(--theme-primary, #2563EB)", color:"white", border:"none", padding:"10px 24px", borderRadius:12, fontSize:13, fontWeight:700, cursor:"pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 6}} className="hover-scale">
                   <Check size={14} /> {lang === "id" ? "Aktifkan Promo" : "Activate Promo"}
                 </button>
               </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>`;

code = code.replace(/               \{\/\* Promo Modal Sticky Footer \*\/\}\n               <div style=\{\{display:"flex", justifyContent: "flex-end", gap:12, padding: "16px 24px", background: "rgba\(0,0,0,0\.015\)", borderTop: "1px solid rgba\(0,0,0,0\.03\)", flexShrink: 0\}\}>\n                 <button type="button" onClick=\{\(\)=>setShowPromoModal\(false\)\} style=\{\{background:"transparent", border:"1px solid rgba\(0,0,0,0\.08\)", color: "#111827", padding:"10px 20px", borderRadius:12, fontSize:13, fontWeight:700, cursor:"pointer", transition: "all 0\.2s"\}\} className="hover-bg-light">Batal<\/button>\n                 <button type="submit" style=\{\{background:"var\(--theme-primary, #2563EB\)", color:"white", border:"none", padding:"10px 24px", borderRadius:12, fontSize:13, fontWeight:700, cursor:"pointer", transition: "all 0\.2s", display: "flex", alignItems: "center", gap: 6\}\} className="hover-scale">\n                   <Check size=\{14\} \/> \{lang === "id" \? "Aktifkan Promo" : "Activate Promo"\}\n                 <\/button>\n               <\/div>\n            <\/motion.form>\n          <\/motion.div>\n        \)\}\n      <\/AnimatePresence>/, updatedPromoModalFooter); // Fix close tag error

// Also remove Promo Modal Sticky Footer section if the previous block fails to catch it precisely. We'll use a simpler search and replace for just the footer part of Promo Modal.
code = code.replace(/               \{\/\* Modal Sticky Footer \*\/\}\n               <div style=\{\{display:"flex", justifyContent: "flex-end", gap:12, padding: "16px 24px", background: "rgba\(0,0,0,0\.015\)", borderTop: "1px solid rgba\(0,0,0,0\.03\)", flexShrink: 0\}\}>\n                 <button type="button" onClick=\{\(\)=>setShowPromoModal\(false\)\} style=\{\{background:"transparent", border:"1px solid rgba\(0,0,0,0\.08\)", color: "#111827", padding:"10px 20px", borderRadius:12, fontSize:13, fontWeight:700, cursor:"pointer", transition: "all 0\.2s"\}\} className="hover-bg-light">Batal<\/button>\n                 <button type="submit" style=\{\{background:"var\(--theme-primary, #2563EB\)", color:"white", border:"none", padding:"10px 24px", borderRadius:12, fontSize:13, fontWeight:700, cursor:"pointer", transition: "all 0\.2s", display: "flex", alignItems: "center", gap: 6\}\} className="hover-scale">\n                   <Check size=\{14\} \/> \{lang === "id" \? "Aktifkan Promo" : "Activate Promo"\}\n                 <\/button>\n               <\/div>\n            <\/motion.form>\n          <\/motion.div>\n        \)\}\n      <\/AnimatePresence>/, 
`               {/* Promo Modal Sticky Footer */}
               <div style={{display:"flex", justifyContent: "flex-end", gap:12, padding: "16px 24px", background: "rgba(0,0,0,0.015)", borderTop: "1px solid rgba(0,0,0,0.03)", flexShrink: 0}}>
                 <button type="button" onClick={()=>setShowPromoModal(false)} style={{background:"transparent", border:"1px solid rgba(0,0,0,0.08)", color: "#111827", padding:"10px 20px", borderRadius:12, fontSize:13, fontWeight:700, cursor:"pointer", transition: "all 0.2s"}} className="hover-bg-light">Batal</button>
                 <button type="submit" style={{background:"var(--theme-primary, #2563EB)", color:"white", border:"none", padding:"10px 24px", borderRadius:12, fontSize:13, fontWeight:700, cursor:"pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 6}} className="hover-scale">
                   <Check size={14} /> {lang === "id" ? "Aktifkan Promo" : "Activate Promo"}
                 </button>
               </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>`);

fs.writeFileSync('src/AdminPanel.tsx', code);
