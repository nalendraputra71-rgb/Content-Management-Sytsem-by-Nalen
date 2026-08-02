const fs = require('fs');
let content = fs.readFileSync('src/ContentModal.tsx', 'utf8');

const targetLayout = `          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(44,32,22,0.4)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6, letterSpacing: "0.5px" }}>
              {getFieldIcon(icon, 14)} {translatedLabel}
              {renderSectionCommentBadge(id)}
            </span>
            {fieldValue && (
              <button 
                onClick={handleCopy} 
                onMouseOver={(e: any) => {
                  if (!isCopied) {
                    e.currentTarget.style.background = "rgba(0,0,0,0.06)";
                  }
                }}
                onMouseOut={(e: any) => {
                  if (!isCopied) {
                    e.currentTarget.style.background = "rgba(0,0,0,0.03)";
                  }
                }}
                style={{ 
                   background: isCopied ? "rgba(16,185,129,0.06)" : "rgba(0,0,0,0.03)", 
                   border: "none", 
                   color: isCopied ? "#059669" : "#4B5563", 
                   padding: "4px 10px", 
                   borderRadius: 6, 
                   fontSize: 11, 
                   fontWeight: 700, 
                   cursor: isCopied ? "default" : "pointer", 
                   display: "flex", 
                   alignItems: "center", 
                   transition: "all 0.2s ease",
                  fontFamily: "Plus Jakarta Sans, sans-serif"
                }}
              >
                {isCopied ? (lang === "id" ? <>Disalin</> : <>Copied</>) : <><Copy size={11} style={{marginRight: 4}} /> {lang === "id" ? "Salin" : "Copy"}</>}
              </button>
            )}
          </div>`;

const newLayout = `          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(44,32,22,0.4)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6, letterSpacing: "0.5px" }}>
              {getFieldIcon(icon, 14)} {translatedLabel}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {renderSectionCommentBadge(id)}
              {fieldValue && (
                <button 
                  onClick={handleCopy} 
                  onMouseOver={(e: any) => {
                    if (!isCopied) {
                      e.currentTarget.style.background = "rgba(0,0,0,0.06)";
                    }
                  }}
                  onMouseOut={(e: any) => {
                    if (!isCopied) {
                      e.currentTarget.style.background = "rgba(0,0,0,0.03)";
                    }
                  }}
                  style={{ 
                     background: isCopied ? "rgba(16,185,129,0.06)" : "rgba(0,0,0,0.03)", 
                     border: "none", 
                     color: isCopied ? "#059669" : "#4B5563", 
                     padding: "4px 10px", 
                     borderRadius: 6, 
                     fontSize: 11, 
                     fontWeight: 700, 
                     cursor: isCopied ? "default" : "pointer", 
                     display: "flex", 
                     alignItems: "center", 
                     transition: "all 0.2s ease",
                    fontFamily: "Plus Jakarta Sans, sans-serif"
                  }}
                >
                  {isCopied ? (lang === "id" ? <>Disalin</> : <>Copied</>) : <><Copy size={11} style={{marginRight: 4}} /> {lang === "id" ? "Salin" : "Copy"}</>}
                </button>
              )}
            </div>
          </div>`;

content = content.replace(targetLayout, newLayout);

fs.writeFileSync('src/ContentModal.tsx', content);
