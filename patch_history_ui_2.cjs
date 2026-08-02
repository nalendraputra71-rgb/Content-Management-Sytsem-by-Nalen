const fs = require('fs');

let content = fs.readFileSync('src/ContentModal.tsx', 'utf8');

const oldHistoryItem = /const HistoryChangeItem = \(\{ ch, lang \}: \{ ch: any, lang: string \}\) => \{[\s\S]*?    <\/div>\n  \);\n\};/;

const newHistoryItem = `const HistoryChangeItem = ({ ch, lang }: { ch: any, lang: string }) => {
  if (typeof ch === "string") {
    return (
      <div style={{background: "#F9FAFB", padding: "12px", borderRadius: 12, border: "1px solid #F3F4F6"}}>
        <div style={{fontWeight: 700, fontSize: 13, color: "#111827"}}>{ch}</div>
      </div>
    );
  }
  
  const fromStr = String(ch.from || "");
  const toStr = String(ch.to || "");

  // Generate diff
  const diffs = Diff.diffWords(fromStr, toStr);

  return (
    <div style={{background: "#F9FAFB", padding: "12px", borderRadius: 12, border: "1px solid #E5E7EB"}}>
      <div style={{fontWeight: 800, fontSize: 13, color: "#111827", marginBottom: 12, display: "flex", alignItems: "center"}}>
        <div style={{width: 6, height: 6, borderRadius: "50%", background: "var(--theme-primary, #3B82F6)", marginRight: 8}}></div>
        {ch.field}
      </div>
      
      <div style={{display: "flex", flexDirection: "column", gap: 12, fontSize: 13}}>
        {fromStr ? (
          <div style={{background: "#FEF2F2", padding: 12, borderRadius: 8, border: "1px solid #FECACA"}}>
            <div style={{fontSize: 11, fontWeight: 700, color: "#B91C1C", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5}}>
              {lang === "id" ? "Teks Sebelumnya" : "Previous Text"}
            </div>
            <div style={{color: "#4B5563", whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: 1.6}}>
              {diffs.map((part, index) => {
                if (part.added) return null;
                if (part.removed) {
                  return <span key={index} style={{ background: "#FCA5A5", color: "#7F1D1D", textDecoration: "line-through", padding: "2px 4px", borderRadius: 4, fontWeight: 600 }}>{part.value}</span>;
                }
                return <span key={index}>{part.value}</span>;
              })}
            </div>
          </div>
        ) : null}

        {fromStr && toStr ? (
          <div style={{display: "flex", justifyContent: "center", margin: "-4px 0"}}>
            <div style={{background: "#F3F4F6", padding: 4, borderRadius: "50%", border: "1px solid #E5E7EB"}}>
              <ArrowDown size={14} color="#6B7280" />
            </div>
          </div>
        ) : null}

        {toStr ? (
          <div style={{background: "#F0FDF4", padding: 12, borderRadius: 8, border: "1px solid #BBF7D0"}}>
            <div style={{fontSize: 11, fontWeight: 700, color: "#15803D", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5}}>
              {lang === "id" ? "Teks Baru" : "New Text"}
            </div>
            <div style={{color: "#4B5563", whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: 1.6}}>
              {diffs.map((part, index) => {
                if (part.removed) return null;
                if (part.added) {
                  return <span key={index} style={{ background: "#86EFAC", color: "#14532D", padding: "2px 4px", borderRadius: 4, fontWeight: 600 }}>{part.value}</span>;
                }
                return <span key={index}>{part.value}</span>;
              })}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};`;

content = content.replace(oldHistoryItem, newHistoryItem);
fs.writeFileSync('src/ContentModal.tsx', content);
console.log("Updated HistoryChangeItem to always show expanded view");
