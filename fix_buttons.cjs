const fs = require('fs');
let s = fs.readFileSync('src/ContentModal.tsx', 'utf-8');

// The button group:
const buttonGroupStr = `              <div style={{position: "absolute", top: 20, right: 20, display: "flex", gap: "8px"}}>
                <button 
                  onClick={(e) => { e.stopPropagation(); setLayoutMode(p => p === "center" ? "drawer" : "center"); }}
                  title="Ubah Tampilan Mode (Popup / Drawer)"
                  style={{background:"rgba(255,255,255,0.1)",border:"none",borderRadius:"50%",width:32,height:32,cursor:"pointer",fontSize:14,color:"white",display:"flex",alignItems:"center",justifyContent:"center", transition: "background 0.2s"}}
                  onMouseOver={(e: any) => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
                  onMouseOut={(e: any) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                >
                  {layoutMode === "drawer" ? <Maximize2 size={14}/> : <PanelRight size={14}/>}
                </button>
                <button 
                  className="hover-scale" 
                  onClick={handleClose} 
                  style={{background:"rgba(255,255,255,0.1)",border:"none",borderRadius:"50%",width:32,height:32,cursor:"pointer",fontSize:18,color:"white",display:"flex",alignItems:"center",justifyContent:"center", transition: "background 0.2s"}}
                  onMouseOver={(e: any) => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
                  onMouseOut={(e: any) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                >
                  ×
                </button>
              </div>`;

s = s.replace(buttonGroupStr, "");

// We insert it at the very top of `<motion.div ...>` the modal container:
const targetWrapper = `      <motion.div 
        initial={layoutMode === "drawer" ? {x: "100%", opacity:1} : {scale:0.97, opacity:0, y:15}} 
        animate={layoutMode === "drawer" ? {x: 0, opacity:1} : {scale:1, opacity:1, y:0}} 
        exit={layoutMode === "drawer" ? {x: "100%", opacity:1} : {scale:0.97, opacity:0, y:15}} 
        transition={{ duration: 0.25, ease: "easeOut" }}
        onClick={e=>e.stopPropagation()} 
        style={{
          background:"rgba(250, 250, 252, 0.65)", backdropFilter:"blur(48px) saturate(150%)", WebkitBackdropFilter:"blur(48px) saturate(150%)", 
          border: layoutMode === "drawer" ? "none" : "1px solid rgba(255,255,255,0.5)",
          borderLeft: layoutMode === "drawer" ? "1px solid rgba(255,255,255,0.5)" : undefined,
          borderRadius: layoutMode === "drawer" ? "24px 0 0 24px" : "24px",
          maxWidth: layoutMode === "drawer" ? "500px" : "1050px",
          width:"100%",
          height: layoutMode === "drawer" ? "100%" : "auto",
          maxHeight: layoutMode === "drawer" ? "100%" : "94vh",
          position:"relative",
          boxShadow: layoutMode === "drawer" ? "-10px 0 60px rgba(0,0,0,0.2)" : "0 24px 60px rgba(30,21,9,0.3)", 
          display: "flex", flexDirection: "column"
        }}
      >`;

const blackButtonGroupStr = `        {/* Modal Controls */}
        <div style={{position: "absolute", top: layoutMode === "drawer" ? 20 : 28, right: layoutMode === "drawer" ? 20 : 28, display: "flex", gap: "8px", zIndex: 50}}>
          <button 
            onClick={(e) => { e.stopPropagation(); setLayoutMode(p => p === "center" ? "drawer" : "center"); }}
            title="Ubah Tampilan Mode (Popup / Drawer)"
            style={{background:"rgba(0,0,0,0.05)",border:"none",borderRadius:"50%",width:32,height:32,cursor:"pointer",fontSize:14,color:"#444",display:"flex",alignItems:"center",justifyContent:"center", transition: "background 0.2s"}}
            onMouseOver={(e: any) => e.currentTarget.style.background = "rgba(0,0,0,0.1)"}
            onMouseOut={(e: any) => e.currentTarget.style.background = "rgba(0,0,0,0.05)"}
          >
            {layoutMode === "drawer" ? <Maximize2 size={14}/> : <PanelRight size={14}/>}
          </button>
          <button 
            className="hover-scale" 
            onClick={handleClose} 
            style={{background:"rgba(0,0,0,0.05)",border:"none",borderRadius:"50%",width:32,height:32,cursor:"pointer",fontSize:20,fontWeight: 500, color:"#444",display:"flex",alignItems:"center",justifyContent:"center", transition: "background 0.2s"}}
            onMouseOver={(e: any) => e.currentTarget.style.background = "rgba(0,0,0,0.1)"}
            onMouseOut={(e: any) => e.currentTarget.style.background = "rgba(0,0,0,0.05)"}
          >
            ×
          </button>
        </div>`;

s = s.replace(targetWrapper, targetWrapper + '\\n' + blackButtonGroupStr);
fs.writeFileSync('src/ContentModal.tsx', s);
console.log("Moved close buttons to outer modal");
