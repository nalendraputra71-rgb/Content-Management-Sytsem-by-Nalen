const fs = require('fs');
let code = fs.readFileSync('src/HubAiTab.tsx', 'utf8');

// The original line:
//   <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(17,24,39,0.5)" }}>
//     Credits: {(ctx.profile?.aiTokensUsed || 0).toLocaleString()} / {(ctx.planDetails?.aiTokenLimit || 100000).toLocaleString()}
//   </div>

const targetStr = `<div style={{ fontSize: 10, fontWeight: 600, color: "rgba(17,24,39,0.5)" }}>
    Credits: {(ctx.profile?.aiTokensUsed || 0).toLocaleString()} / {(ctx.planDetails?.aiTokenLimit || 100000).toLocaleString()}
  </div>`;

const newStr = `<div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(17,24,39,0.6)", display: 'flex', justifyContent: 'space-between' }}>
      <span>Credits:</span>
      <span>{(ctx.profile?.aiTokensUsed || 0).toLocaleString()} / {ctx.planDetails?.aiTokenLimit === -1 ? "∞" : (ctx.planDetails?.aiTokenLimit || 100000).toLocaleString()}</span>
    </div>
    <div style={{ width: 120, height: 4, background: "rgba(0,0,0,0.06)", borderRadius: 2, overflow: "hidden" }}>
      <div style={{ 
        width: ctx.planDetails?.aiTokenLimit === -1 ? "100%" : \`\${Math.min(100, ((ctx.profile?.aiTokensUsed || 0) / (ctx.planDetails?.aiTokenLimit || 100000)) * 100)}%\`, 
        height: "100%", 
        background: (ctx.planDetails?.aiTokenLimit !== -1 && (ctx.profile?.aiTokensUsed || 0) >= (ctx.planDetails?.aiTokenLimit || 100000) * 0.9) ? "#EF4444" : "#1B7FDC",
        borderRadius: 2
      }} />
    </div>
  </div>`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, newStr);
  fs.writeFileSync('src/HubAiTab.tsx', code);
  console.log("Patched HubAiTab credit display");
} else {
  console.log("Target string not found in HubAiTab");
}
