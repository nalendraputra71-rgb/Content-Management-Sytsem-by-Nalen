const fs = require('fs');
let s = fs.readFileSync('src/ContentModal.tsx', 'utf-8');

// 1. Update the overall wrapper styling
const wrapperOld = `        <div ref={modalScrollRef} style={{padding: "24px 28px", overflow: "auto", flex: 1, display: "flex", flexDirection: "column", gap: "16px"}}>`;
const wrapperNew = `        <div style={{display: "flex", flexDirection: layoutMode === "drawer" ? "column" : "row", flex: 1, overflow: layoutMode === "drawer" ? "auto" : "hidden"}} ref={layoutMode === "drawer" ? modalScrollRef : undefined}>
            {/* LEFT COLUMN: IDENTITAS & SETTINGS */}
            <div style={{ 
              width: layoutMode === "drawer" ? "100%" : "380px", 
              padding: layoutMode === "drawer" ? "24px 28px 8px 28px" : "32px 28px", 
              flexShrink: 0, 
              display: "flex", 
              flexDirection: "column", 
              gap: "16px", 
              background: layoutMode === "drawer" ? "transparent" : "rgba(255, 255, 255, 0.4)", 
              borderRight: layoutMode === "drawer" ? "none" : "1px solid rgba(0,0,0,0.05)", 
              overflowY: layoutMode === "drawer" ? "visible" : "auto" 
            }}>`;
s = s.replace(wrapperOld, wrapperNew);

// 2. Insert split between Left and Right columns (after AI Analysis block)
const splitTarget = `          {/* AI Analysis Result Section if exists */}
          {aiResult && (
            <div style={{background:"rgba(227, 242, 253, 0.4)", backdropFilter:"blur(12px)", WebkitBackdropFilter:"blur(12px)", border:"1px solid rgba(187, 222, 251, 0.6)", borderRadius:12, padding:16, boxShadow:"0 4px 12px rgba(30,136,229,0.08)"}}>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10}}>
                <span style={{fontSize:12, fontWeight:700, color:"#1E88E5", display:"flex", alignItems:"center", gap:6}}>
                    <GeminiIcon size={14} />
                    AI Content Analysis
                </span>
                <button onClick={()=>setAiResult("")} style={{border:"none", background:"transparent", fontSize:16, cursor:"pointer", color:"#1E88E5"}}>&times;</button>
              </div>
              <div style={{fontSize:12, lineHeight:1.6, color:"#2C3E50", whiteSpace:"pre-wrap"}}><Markdown>{aiResult}</Markdown></div>
            </div>
          )}`;
const splitNew = `          {/* AI Analysis Result Section if exists */}
          {aiResult && (
            <div style={{background:"rgba(227, 242, 253, 0.4)", backdropFilter:"blur(12px)", WebkitBackdropFilter:"blur(12px)", border:"1px solid rgba(187, 222, 251, 0.6)", borderRadius:12, padding:16, boxShadow:"0 4px 12px rgba(30,136,229,0.08)", marginTop: aiResult ? 0 : 0}}>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10}}>
                <span style={{fontSize:12, fontWeight:700, color:"#1E88E5", display:"flex", alignItems:"center", gap:6}}>
                    <GeminiIcon size={14} />
                    AI Content Analysis
                </span>
                <button onClick={()=>setAiResult("")} style={{border:"none", background:"transparent", fontSize:16, cursor:"pointer", color:"#1E88E5"}}>&times;</button>
              </div>
              <div style={{fontSize:12, lineHeight:1.6, color:"#2C3E50", whiteSpace:"pre-wrap"}}><Markdown>{aiResult}</Markdown></div>
            </div>
          )}
          
            </div>
            {/* RIGHT COLUMN: MAIN CONTENT */}
            <div ref={layoutMode === "drawer" ? undefined : modalScrollRef} style={{ 
              flex: 1, 
              padding: layoutMode === "drawer" ? "0 28px 24px 28px" : "32px 32px 32px 32px", 
              display: "flex", 
              flexDirection: "column", 
              gap: "16px", 
              background: layoutMode === "drawer" ? "transparent" : "#FAFAFA", 
              overflowY: layoutMode === "drawer" ? "visible" : "auto",
              position: "relative"
            }}>`;
s = s.replace(splitTarget, splitNew);

// 3. Update the global max width for layoutMode === "center" (from 620px to something wider, say 1050px)
const maxWC = `maxWidth: layoutMode === "drawer" ? "500px" : "620px"`;
const maxWN = `maxWidth: layoutMode === "drawer" ? "500px" : "1050px"`;
s = s.replace(maxWC, maxWN);

fs.writeFileSync('src/ContentModal.tsx', s);
console.log("Refactored layout cleanly");
