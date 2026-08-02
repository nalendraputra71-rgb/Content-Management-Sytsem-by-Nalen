const fs = require('fs');
let content = fs.readFileSync('src/ContentModal.tsx', 'utf8');

// Match everything from <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
// to </button>}</div></div>
const targetRegex = /<div style=\{\{ display: "flex", alignItems: "center", gap: 8 \}\}>\s*\{renderSectionCommentBadge\(id\)\}\s*\{fieldValue && \(\s*<button[\s\S]*?<\/button>\s*\)\}\s*<\/div>\s*<\/div>/;

const replacement = `<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
                   padding: "6px", 
                   borderRadius: 6, 
                   cursor: isCopied ? "default" : "pointer", 
                   display: "flex", 
                   alignItems: "center", 
                   justifyContent: "center",
                   transition: "all 0.2s ease"
                }}
                title={lang === "id" ? "Salin" : "Copy"}
              >
                {isCopied ? <Check size={14} /> : <Copy size={14} />}
              </button>
              )}
              {renderSectionCommentBadge(id)}
            </div>
          </div>`;

content = content.replace(targetRegex, replacement);

fs.writeFileSync('src/ContentModal.tsx', content);
