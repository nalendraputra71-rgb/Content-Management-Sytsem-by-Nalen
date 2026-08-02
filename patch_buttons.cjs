const fs = require('fs');
let content = fs.readFileSync('src/ContentModal.tsx', 'utf8');

// 1. Update renderSectionCommentBadge to remove text
const badgeTarget = `      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpenSections(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
        }}
        style={{
          marginLeft: "auto",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "4px 10px",
          borderRadius: "10px",
          fontSize: "10px",
          fontWeight: 800,
          border: count > 0 ? "1px solid rgba(217, 119, 6, 0.3)" : "1px solid rgba(0, 0, 0, 0.05)",
          background: count > 0 ? "#FFFBEB" : isOpen ? "#EFF6FF" : "rgba(0,0,0,0.02)",
          color: count > 0 ? "#D97706" : isOpen ? "#2563EB" : "#9CA3AF",
          cursor: "pointer",
          textTransform: "uppercase",
          transition: "all 0.2s"
        }}
        title={\`\${count} komentar aktif.\`}
      >
        <MessageSquare size={11} />
        <span>{count > 0 ? \`\${count} Komen\` : "Komen"}</span>
      </button>`;

const badgeReplacement = `      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpenSections(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
        }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "4px",
          padding: "6px",
          borderRadius: "6px",
          border: "none",
          background: count > 0 ? "rgba(217, 119, 6, 0.1)" : isOpen ? "rgba(37, 99, 235, 0.1)" : "rgba(0,0,0,0.03)",
          color: count > 0 ? "#D97706" : isOpen ? "#2563EB" : "#4B5563",
          cursor: "pointer",
          transition: "all 0.2s ease"
        }}
        title={\`\${count} komentar aktif.\`}
      >
        <MessageSquare size={14} />
        {count > 0 && <span style={{ fontSize: "11px", fontWeight: 700 }}>{count}</span>}
      </button>`;

content = content.replace(badgeTarget, badgeReplacement);

// 2. Update the layout in isEditing = false block to show Copy then Comment
const layoutTarget1 = `            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
            </div>`;

const layoutReplacement1 = `            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
            </div>`;

content = content.replace(layoutTarget1, layoutReplacement1);

fs.writeFileSync('src/ContentModal.tsx', content);
