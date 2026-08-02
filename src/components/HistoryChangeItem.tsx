import React from 'react';
import * as Diff from 'diff';

export const HistoryChangeItem = ({ ch, lang }: { ch: any, lang: string }) => {
  if (typeof ch === "string") {
    return (
      <div style={{ fontSize: 13, color: "#374151", padding: "6px 12px", background: "#F3F4F6", borderRadius: 8, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#6B7280" }} />
        {ch}
      </div>
    );
  }
  
  const fromStr = String(ch.from || "");
  const toStr = String(ch.to || "");

  const diffs = Diff.diffWords(fromStr, toStr);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4, marginBottom: 8 }}>
      <div style={{ fontWeight: 700, fontSize: 13, color: "#0F172A", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2563EB", flexShrink: 0 }} />
        <span>{ch.field}</span>
      </div>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12, fontSize: 13 }}>
        {fromStr ? (
          <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 12, padding: "12px 14px", minWidth: 0, boxShadow: "0 1px 2px rgba(0,0,0,0.02)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#B91C1C", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#EF4444" }}></span>
              {lang === "id" ? "Sebelum Edit" : "Previous Text"}
            </div>
            <div style={{ color: "#374151", whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: 1.55 }}>
              {diffs.map((part, index) => {
                if (part.added) return null;
                if (part.removed) {
                  return <span key={index} style={{ background: "#FCA5A5", color: "#7F1D1D", textDecoration: "line-through", padding: "1px 4px", borderRadius: 3, fontWeight: 600 }}>{part.value}</span>;
                }
                return <span key={index}>{part.value}</span>;
              })}
            </div>
          </div>
        ) : null}

        {toStr ? (
          <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 12, padding: "12px 14px", minWidth: 0, boxShadow: "0 1px 2px rgba(0,0,0,0.02)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#15803D", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22C55E" }}></span>
              {lang === "id" ? "Setelah Edit" : "New Text"}
            </div>
            <div style={{ color: "#374151", whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: 1.55 }}>
              {diffs.map((part, index) => {
                if (part.removed) return null;
                if (part.added) {
                  return <span key={index} style={{ background: "#86EFAC", color: "#14532D", padding: "1px 4px", borderRadius: 3, fontWeight: 600 }}>{part.value}</span>;
                }
                return <span key={index}>{part.value}</span>;
              })}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
