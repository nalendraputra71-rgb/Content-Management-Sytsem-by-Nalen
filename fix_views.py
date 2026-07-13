import re

with open('src/Views.tsx', 'r') as f:
    content = f.read()

target = '              <div style={{display:"flex",flexDirection:"column",gap:2, flex: 1, minHeight: 0, overflowY: "auto", paddingRight: "2px", scrollbarWidth: "thin"}}>'
replacement = '              <div className="[&::-webkit-scrollbar]:hidden" style={{display:"flex",flexDirection:"column",gap:2, flex: 1, minHeight: 0, overflowY: "auto", msOverflowStyle: "none", scrollbarWidth: "none"}}>'

content = content.replace(target, replacement)

target2 = '                </AnimatePresence>\n                {items.length===0&&allItems.length>0&&<div style={{fontSize:8,color:"rgba(44,32,22,0.3)",fontStyle:"italic"}}>Disembunyikan filter</div>}\n              </div>'
replacement2 = '                </AnimatePresence>\n                {items.length===0&&allItems.length>0&&<div style={{fontSize:8,color:"rgba(44,32,22,0.3)",fontStyle:"italic"}}>Disembunyikan filter</div>}\n              </div>\n              {items.length > 2 && (\n                <div\n                  style={{\n                    position: "absolute",\n                    bottom: 0,\n                    left: 0,\n                    right: 0,\n                    height: 24,\n                    background: "linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,1) 80%)",\n                    display: "flex",\n                    alignItems: "flex-end",\n                    justifyContent: "center",\n                    paddingBottom: 2,\n                    pointerEvents: "none",\n                  }}\n                >\n                  <ChevronDown size={14} color="rgba(44,32,22,0.4)" style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.15))" }} />\n                </div>\n              )}'

content = content.replace(target2, replacement2)

with open('src/Views.tsx', 'w') as f:
    f.write(content)
